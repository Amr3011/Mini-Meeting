package services

import (
	"fmt"
	"mini-meeting/internal/models"
	"mini-meeting/internal/repositories"
	"strings"
	"time"
)

type NormalizationService struct {
	repo *repositories.SummarizerRepository
}

func NewNormalizationService(repo *repositories.SummarizerRepository) *NormalizationService {
	return &NormalizationService{
		repo: repo,
	}
}

// MergedSegment represents a merged transcript segment from a single speaker
type MergedSegment struct {
	UserIdentity string
	Text         string
	StartTime    float64
	EndTime      float64
}

// ProcessSession normalizes all transcripts for a given session
func (s *NormalizationService) ProcessSession(sessionID uint) error {
	// 1. Get session and validate status
	session, err := s.repo.FindSessionByID(sessionID)
	if err != nil {
		return fmt.Errorf("failed to get session: %w", err)
	}

	if session.Status != models.StatusTranscribed {
		// If already normalized or in a later stage, that's fine
		if session.Transcript != nil && *session.Transcript != "" {
			return nil
		}
		return fmt.Errorf("session is not in TRANSCRIBED state (current: %s)", session.Status)
	}

	// 2. Get all transcripts for this session
	transcripts, err := s.repo.FindTranscriptsBySessionID(sessionID)
	if err != nil {
		return fmt.Errorf("failed to get transcripts: %w", err)
	}

	if len(transcripts) == 0 {
		return fmt.Errorf("no transcripts found for session %d", sessionID)
	}

	fmt.Printf("Starting normalization for session %d (%d transcript segments)\n", sessionID, len(transcripts))

	// 3. Merge consecutive segments from same speaker
	mergedSegments := s.mergeConsecutiveSpeakers(transcripts)

	// 4. Format into meeting document
	normalizedText := s.formatMeetingDocument(mergedSegments)

	// 5. Update session status to NORMALIZED
	now := time.Now()
	if err := s.repo.UpdateSessionStatus(sessionID, models.StatusNormalized, nil, &now); err != nil {
		return fmt.Errorf("failed to update session status: %w", err)
	}

	// 6. Save to session
	if err := s.repo.UpdateSessionTranscript(sessionID, normalizedText); err != nil {
		return fmt.Errorf("failed to update session transcript: %w", err)
	}

	// 7. Delete individual transcript records
	if err := s.repo.DeleteTranscriptsBySessionID(sessionID); err != nil {
		fmt.Printf("Warning: Failed to cleanup transcripts for session %d: %v\n", sessionID, err)
	} else {
		fmt.Printf("Cleaned up %d transcript records for session %d\n", len(transcripts), sessionID)
	}

	fmt.Printf("Successfully normalized session %d (%d segments merged into %d)\n",
		sessionID, len(transcripts), len(mergedSegments))

	return nil
}

// mergeConsecutiveSpeakers merges consecutive transcript segments from the same speaker
func (s *NormalizationService) mergeConsecutiveSpeakers(transcripts []models.Transcript) []MergedSegment {
	if len(transcripts) == 0 {
		return []MergedSegment{}
	}

	merged := []MergedSegment{}
	current := MergedSegment{
		UserIdentity: transcripts[0].UserIdentity,
		Text:         strings.TrimSpace(transcripts[0].Text),
		StartTime:    transcripts[0].StartTime,
		EndTime:      transcripts[0].EndTime,
	}

	for i := 1; i < len(transcripts); i++ {
		transcript := transcripts[i]

		// If same speaker, merge the text
		if transcript.UserIdentity == current.UserIdentity {
			// Add space between merged segments
			current.Text += " " + strings.TrimSpace(transcript.Text)
			current.EndTime = transcript.EndTime
		} else {
			// Different speaker, save current and start new segment
			merged = append(merged, current)
			current = MergedSegment{
				UserIdentity: transcript.UserIdentity,
				Text:         strings.TrimSpace(transcript.Text),
				StartTime:    transcript.StartTime,
				EndTime:      transcript.EndTime,
			}
		}
	}

	merged = append(merged, current)

	return merged
}

// formatMeetingDocument formats merged segments into a clean meeting document
func (s *NormalizationService) formatMeetingDocument(segments []MergedSegment) string {
	var builder strings.Builder

	for _, segment := range segments {
		timestamp := s.formatTimestamp(segment.StartTime)

		displayName := s.extractDisplayName(segment.UserIdentity)

		builder.WriteString(fmt.Sprintf("[%s] %s: %s\n\n", timestamp, displayName, segment.Text))
	}

	return strings.TrimSpace(builder.String())
}

// formatTimestamp converts seconds to [HH:MM:SS] format
func (s *NormalizationService) formatTimestamp(seconds float64) string {
	duration := time.Duration(seconds * float64(time.Second))
	hours := int(duration.Hours())
	minutes := int(duration.Minutes()) % 60
	secs := int(duration.Seconds()) % 60

	return fmt.Sprintf("%02d:%02d:%02d", hours, minutes, secs)
}

// extractDisplayName removes the _id suffix from UserIdentity
func (s *NormalizationService) extractDisplayName(userIdentity string) string {
	// Find the last underscore
	lastUnderscore := strings.LastIndex(userIdentity, "_")
	if lastUnderscore == -1 {
		return userIdentity
	}
	// Return everything before the last underscore
	return userIdentity[:lastUnderscore]
}
