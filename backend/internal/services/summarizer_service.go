package services

import (
	"errors"
	"fmt"
	"io"
	"mini-meeting/internal/config"
	"mini-meeting/internal/models"
	"mini-meeting/internal/repositories"
	"mini-meeting/internal/types"
	"os"
	"path/filepath"
	"sync"
	"time"

	lksdk "github.com/livekit/server-sdk-go/v2"
	"github.com/pion/webrtc/v4"
	"github.com/pion/webrtc/v4/pkg/media/oggwriter"
)

type SummarizerService struct {
	repo                 *repositories.SummarizerRepository
	meetingRepo          *repositories.MeetingRepository
	userRepo             *repositories.UserRepository
	livekitService       *LiveKitService
	transcriptionService *TranscriptionService
	cfg                  *config.Config

	// Active rooms tracking for graceful shutdown
	activeRooms map[uint]*lksdk.Room
	roomMutex   sync.RWMutex

	// Goroutine tracking
	wg sync.WaitGroup
}

func NewSummarizerService(
	repo *repositories.SummarizerRepository,
	meetingRepo *repositories.MeetingRepository,
	userRepo *repositories.UserRepository,
	livekitService *LiveKitService,
	transcriptionService *TranscriptionService,
	cfg *config.Config,
) *SummarizerService {
	return &SummarizerService{
		repo:                 repo,
		meetingRepo:          meetingRepo,
		userRepo:             userRepo,
		livekitService:       livekitService,
		transcriptionService: transcriptionService,
		cfg:                  cfg,
		activeRooms:          make(map[uint]*lksdk.Room),
	}
}

// StartSummarizer starts a new summarizer session for a meeting
func (s *SummarizerService) StartSummarizer(meetingID uint, userID uint) (*models.SummarizerSession, error) {
	// Validate meeting exists and user is the creator
	meeting, err := s.meetingRepo.FindByID(meetingID)
	if err != nil {
		return nil, fmt.Errorf("meeting not found: %w", err)
	}

	if meeting.CreatorID != userID {
		return nil, fmt.Errorf("unauthorized: only meeting creator can start summarizer")
	}

	// Check if there's already an active session
	existingSession, err := s.repo.FindActiveSessionByMeetingID(meetingID)
	if err == nil && existingSession != nil {
		return nil, fmt.Errorf("summarizer already running for this meeting")
	}

	// Create new session
	session := &models.SummarizerSession{
		MeetingID: meetingID,
		UserID:    userID,
		Status:    models.StatusStarted,
		StartedAt: time.Now(),
	}

	if err := s.repo.CreateSession(session); err != nil {
		return nil, fmt.Errorf("failed to create session: %w", err)
	}

	// Join LiveKit room as bot in background
	go func() {
		if err := s.joinLiveKitRoom(meeting.MeetingCode, session.ID); err != nil {
			// Update session status with error
			now := time.Now()
			errMsg := fmt.Sprintf("Failed to join LiveKit room: %v", err)
			s.repo.UpdateSessionStatus(session.ID, models.StatusStarted, &errMsg, &now)
			fmt.Printf("%s\n", errMsg)
		}
	}()

	return session, nil
}

// StopSummarizer stops an active summarizer session
func (s *SummarizerService) StopSummarizer(sessionID uint, userID uint) (int64, error) {
	// Get session
	session, err := s.repo.FindSessionByID(sessionID)
	if err != nil {
		return 0, fmt.Errorf("session not found: %w", err)
	}

	// Validate user is meeting creator
	meeting, err := s.meetingRepo.FindByID(session.MeetingID)
	if err != nil {
		return 0, fmt.Errorf("meeting not found: %w", err)
	}

	if meeting.CreatorID != userID {
		return 0, fmt.Errorf("unauthorized: only meeting creator can stop summarizer")
	}

	// Validate session is in STARTED state
	if session.Status != models.StatusStarted {
		return 0, fmt.Errorf("session is not active (current status: %s)", session.Status)
	}

	// Disconnect from LiveKit room
	s.roomMutex.Lock()
	if room, exists := s.activeRooms[sessionID]; exists {
		room.Disconnect()
		delete(s.activeRooms, sessionID)
	}
	s.roomMutex.Unlock()

	// Wait for all audio processing goroutines to finish
	s.wg.Wait()

	// Update session status to CAPTURED
	now := time.Now()
	if err := s.repo.UpdateSessionStatus(sessionID, models.StatusCaptured, nil, &now); err != nil {
		return 0, fmt.Errorf("failed to update session status: %w", err)
	}

	// Count total chunks
	totalChunks, err := s.repo.CountChunksBySessionID(sessionID)
	if err != nil {
		return 0, fmt.Errorf("failed to count chunks: %w", err)
	}

	// Trigger transcription in background
	go func() {
		fmt.Printf("Triggering background transcription for session %d\n", sessionID)
		if err := s.transcriptionService.ProcessSession(sessionID); err != nil {
			fmt.Printf("Failed to process session %d: %v\n", sessionID, err)
		}
	}()

	return totalChunks, nil
}

// joinLiveKitRoom joins the LiveKit room as a bot participant
func (s *SummarizerService) joinLiveKitRoom(meetingCode string, sessionID uint) error {
	fmt.Printf("Attempting to join room %s for session %d\n", meetingCode, sessionID)

	// Create a bot token with hidden permission
	token, err := s.livekitService.CreateBotToken(meetingCode, sessionID)
	if err != nil {
		return fmt.Errorf("failed to create bot token: %w", err)
	}

	fmt.Printf("Connecting bot to room %s using token (with Hidden=true permission)\n", meetingCode)
	room, err := lksdk.ConnectToRoomWithToken(s.livekitService.GetURL(), token, &lksdk.RoomCallback{
		ParticipantCallback: lksdk.ParticipantCallback{
			OnTrackSubscribed: func(track *webrtc.TrackRemote, publication *lksdk.RemoteTrackPublication, participant *lksdk.RemoteParticipant) {
				fmt.Printf("Track subscribed: %s from %s (kind: %s)\n", publication.SID(), participant.Identity(), track.Kind())
				// Only process audio tracks
				if track.Kind() == webrtc.RTPCodecTypeAudio {
					fmt.Printf("Starting audio capture for user %s\n", participant.Identity())
					s.wg.Add(1)
					go s.handleAudioTrack(track, participant, sessionID)
				}
			},
			OnTrackPublished: func(publication *lksdk.RemoteTrackPublication, participant *lksdk.RemoteParticipant) {
				fmt.Printf("Track published: %s from %s\n", publication.SID(), participant.Identity())
			},
		},
	})

	if err != nil {
		return fmt.Errorf("failed to connect to room: %w", err)
	}

	// Store room for later disconnection
	s.roomMutex.Lock()
	s.activeRooms[sessionID] = room
	s.roomMutex.Unlock()

	fmt.Printf("Bot successfully joined room %s for session %d\n", meetingCode, sessionID)
	fmt.Printf("Waiting for participants to publish audio tracks...\n")

	return nil
}

// handleAudioTrack processes audio from a participant's track
func (s *SummarizerService) handleAudioTrack(track *webrtc.TrackRemote, participant *lksdk.RemoteParticipant, sessionID uint) {
	defer s.wg.Done()
	defer func() {
		if r := recover(); r != nil {
			fmt.Printf("Recovered from panic in audio handler: %v\n", r)
		}
	}()

	userIdentity := participant.Identity()
	chunkDuration := time.Duration(s.cfg.Summarizer.ChunkDurationSeconds) * time.Second

	fmt.Printf("Started processing audio for user %s in session %d (chunk duration: %v)\n", userIdentity, sessionID, chunkDuration)

	userDir, err := s.setupUserDirectory(sessionID, userIdentity)
	if err != nil {
		fmt.Printf("Failed to setup directory: %v\n", err)
		return
	}

	var (
		writer           *oggwriter.OggWriter
		currentChunkPath string
		chunkStartTime   time.Time
		chunkIndex       = 0
		packetCount      = 0
	)

	// closeChunk finalizes the current chunk
	closeChunk := func() {
		if writer != nil {
			if err := writer.Close(); err != nil {
				fmt.Printf("Failed to close ogg writer: %v\n", err)
			}
			// Only save metadata if we processed packets
			if packetCount > 0 {
				if err := s.createChunkMetadata(sessionID, userIdentity, chunkIndex, currentChunkPath, chunkStartTime); err != nil {
					fmt.Printf("Failed to create chunk metadata: %v\n", err)
				}
			}
		}
	}

	// openNewChunk starts a new chunk
	openNewChunk := func() error {
		chunkStartTime = time.Now()
		filename := fmt.Sprintf("chunk_%04d.ogg", chunkIndex)
		currentChunkPath = filepath.Join(userDir, filename)

		var err error
		// Opus sample rate is always 48000, usually 2 channels for fullband stereo
		writer, err = oggwriter.New(currentChunkPath, 48000, 2)
		if err != nil {
			return fmt.Errorf("failed to create ogg writer: %w", err)
		}
		return nil
	}

	// Ensure the last chunk is closed when we exit
	defer closeChunk()

	// Initialize first chunk
	if err := openNewChunk(); err != nil {
		fmt.Printf("Failed to create initial chunk: %v\n", err)
		return
	}

	for {
		rtp, _, err := track.ReadRTP()
		if err != nil {
			if err == io.EOF {
				fmt.Printf("EOF reached for user %s after %d packets\n", userIdentity, packetCount)
				break
			}
			fmt.Printf("Error reading RTP: %v\n", err)
			continue
		}

		packetCount++
		if packetCount%100 == 0 {
			fmt.Printf("Received %d packets from %s\n", packetCount, userIdentity)
		}

		if err := writer.WriteRTP(rtp); err != nil {
			fmt.Printf("Failed to write RTP packet: %v\n", err)
			continue
		}

		// Rotate if needed
		if time.Since(chunkStartTime) >= chunkDuration {
			closeChunk()
			chunkIndex++
			if err := openNewChunk(); err != nil {
				fmt.Printf("Failed to create new chunk: %v\n", err)
				return
			}
			fmt.Printf("Rotated to chunk %d for user %s\n", chunkIndex, userIdentity)
		}
	}

	fmt.Printf("Finished processing audio for user %s in session %d (total packets: %d)\n", userIdentity, sessionID, packetCount)
}

func (s *SummarizerService) setupUserDirectory(sessionID uint, userIdentity string) (string, error) {
	userDir := filepath.Join(s.cfg.Summarizer.TempDir, fmt.Sprintf("%d", sessionID), fmt.Sprintf("user_%s", userIdentity))
	fmt.Printf("Creating directory: %s\n", userDir)

	if err := os.MkdirAll(userDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create directory for user %s: %w", userIdentity, err)
	}
	return userDir, nil
}

// createChunkMetadata creates DB metadata for a saved audio chunk
func (s *SummarizerService) createChunkMetadata(sessionID uint, userIdentity string, chunkIndex int, filePath string, startTime time.Time) error {
	endTime := time.Now()
	duration := endTime.Sub(startTime).Seconds()

	// Create DB metadata
	chunk := &models.AudioChunk{
		SessionID:       sessionID,
		UserIdentity:    userIdentity,
		ChunkIndex:      chunkIndex,
		FilePath:        filePath,
		StartTimestamp:  startTime,
		EndTimestamp:    endTime,
		DurationSeconds: duration,
	}

	if err := s.repo.CreateAudioChunk(chunk); err != nil {
		return fmt.Errorf("failed to create audio chunk metadata: %w", err)
	}

	fmt.Printf("Saved metadata for chunk %d, user %s (%.2f seconds)\n", chunkIndex, userIdentity, duration)
	return nil
}

// GetActiveSession returns the active summarizer session for a meeting
func (s *SummarizerService) GetActiveSession(meetingID uint) (*models.SummarizerSession, error) {
	session, err := s.repo.FindActiveSessionByMeetingID(meetingID)
	if err != nil {
		return nil, fmt.Errorf("no active summarizer session found")
	}
	return session, nil
}

// GetSessionByID returns a session by its ID
func (s *SummarizerService) GetSessionByID(sessionID uint) (*models.SummarizerSession, error) {
	return s.repo.FindSessionByID(sessionID)
}

// GetSessions returns a paginated list of sessions for a user
func (s *SummarizerService) GetSessions(userID uint, page, pageSize int) (*types.PaginatedSessionsResponse, error) {
	// Set default values
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	sessions, total, err := s.repo.FindAllByUserIDPaginated(userID, page, pageSize)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch sessions: %w", err)
	}

	// Map models to response type
	sessionList := make([]types.SessionsList, len(sessions))
	for i, session := range sessions {
		sessionList[i] = types.SessionsList{
			ID:        session.ID,
			Status:    session.Status,
			Error:     session.Error,
			StartedAt: session.StartedAt,
		}
	}

	// Calculate total pages
	totalPages := int(total) / pageSize
	if int(total)%pageSize > 0 {
		totalPages++
	}

	return &types.PaginatedSessionsResponse{
		Data:       sessionList,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

// GetSession retrieves a specific session for a user (verifying ownership)
func (s *SummarizerService) GetSession(sessionID, userID uint) (*types.SessionResponse, error) {
	session, err := s.repo.FindSessionByID(sessionID)
	if err != nil {
		return nil, fmt.Errorf("session not found: %w", err)
	}

	if session.UserID != userID {
		return nil, errors.New("unauthorized: session does not belong to user")
	}

	return &types.SessionResponse{
		ID:         session.ID,
		Status:     session.Status,
		Error:      session.Error,
		Transcript: session.Transcript,
		Summary:    session.Summary,
		StartedAt:  session.StartedAt,
		EndedAt:    session.EndedAt,
	}, nil
}

// DeleteSession deletes a session (verifying ownership)
func (s *SummarizerService) DeleteSession(sessionID, userID uint) error {
	session, err := s.repo.FindSessionByID(sessionID)
	if err != nil {
		return fmt.Errorf("session not found: %w", err)
	}

	if session.UserID != userID {
		return errors.New("unauthorized: session does not belong to user")
	}

	// 1. Delete audio files from file system
	sessionDir := filepath.Join(s.cfg.Summarizer.TempDir, fmt.Sprintf("%d", sessionID))
	if err := os.RemoveAll(sessionDir); err != nil {
		fmt.Printf("Warning: failed to delete audio files for session %d: %v\n", sessionID, err)
	}

	// 2. Delete chunks for this session in database
	if err := s.repo.DeleteChunksBySessionID(sessionID); err != nil {
		return fmt.Errorf("failed to delete chunks: %w", err)
	}

	// 3. Delete transcripts for this session in database
	if err := s.repo.DeleteTranscriptsBySessionID(sessionID); err != nil {
		return fmt.Errorf("failed to delete transcripts: %w", err)
	}

	// 4. Finally delete the session record itself
	if err := s.repo.DeleteSession(sessionID); err != nil {
		return fmt.Errorf("failed to delete session: %w", err)
	}

	return nil
}
