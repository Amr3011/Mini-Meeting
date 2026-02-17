package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"mini-meeting/internal/config"
	"mini-meeting/internal/models"
	"mini-meeting/internal/repositories"
	"net/http"
	"os"
	"time"
)

type TranscriptionService struct {
	repo *repositories.SummarizerRepository
	cfg  *config.Config
}

func NewTranscriptionService(repo *repositories.SummarizerRepository, cfg *config.Config) *TranscriptionService {
	return &TranscriptionService{
		repo: repo,
		cfg:  cfg,
	}
}

// TranscribeChunk sends an audio file to the Whisper service and returns the transcribed text
func (s *TranscriptionService) TranscribeChunk(filePath string) (string, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to open audio file: %w", err)
	}
	defer file.Close()

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	// Create form file field
	part, err := writer.CreateFormFile("audio_file", filePath)
	if err != nil {
		return "", fmt.Errorf("failed to create form file: %w", err)
	}

	_, err = io.Copy(part, file)
	if err != nil {
		return "", fmt.Errorf("failed to copy file content: %w", err)
	}

	if err := writer.Close(); err != nil {
		return "", fmt.Errorf("failed to close multipart writer: %w", err)
	}

	// Send request to Whisper ASR webservice
	// We use output=json to get structured data
	url := fmt.Sprintf("%s/asr?task=transcribe&output=json", s.cfg.Whisper.URL)
	req, err := http.NewRequest("POST", url, body)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", writer.FormDataContentType())

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to execute request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("whisper service error (status %d): %s", resp.StatusCode, string(respBody))
	}

	// Parse JSON response
	var result struct {
		Text string `json:"text"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("failed to decode whisper response: %w", err)
	}

	return result.Text, nil
}

// ProcessSession transcribes all chunks for a given session
func (s *TranscriptionService) ProcessSession(sessionID uint) error {
	// 1. Get session and validate status
	session, err := s.repo.FindSessionByID(sessionID)
	if err != nil {
		return fmt.Errorf("failed to get session: %w", err)
	}

	if session.Status != models.StatusCaptured {
		// If already transcribed or summarized, that's fine, return nil
		if session.Status == models.StatusTranscribed || session.Status == models.StatusSummarized {
			return nil
		}
		return fmt.Errorf("session is not in CAPTURED state (current: %s)", session.Status)
	}

	// 2. Get all audio chunks
	chunks, err := s.repo.FindChunksBySessionID(sessionID)
	if err != nil {
		return fmt.Errorf("failed to get chunks: %w", err)
	}

	if len(chunks) == 0 {
		return fmt.Errorf("no audio chunks found for session %d", sessionID)
	}

	fmt.Printf("Starting transcription for session %d (%d chunks)\n", sessionID, len(chunks))

	// 3. Process each chunk
	// Note: Processing sequentially to avoid overloading CPU on small VPS (e.g., 2 vCPUs).
	// Since Whisper is CPU-intensive, parallel processing could cause high load averages and system instability.
	// For production environments with more cores/GPU, use a worker pool or semaphore pattern here.
	successCount := 0
	for _, chunk := range chunks {
		fmt.Printf("Transcribing chunk %d for user %s...\n", chunk.ChunkIndex, chunk.UserIdentity)

		text, err := s.TranscribeChunk(chunk.FilePath)
		if err != nil {
			fmt.Printf("Failed to transcribe chunk %d: %v\n", chunk.ID, err)
			continue
		}

		if text == "" {
			fmt.Printf("Empty transcript for chunk %d\n", chunk.ID)
			continue
		}

		// Create transcript record
		transcript := &models.Transcript{
			SessionID:    sessionID,
			UserIdentity: chunk.UserIdentity,
			Text:         text,
			StartTime:    chunk.DurationSeconds * float64(chunk.ChunkIndex), // Approximate start time
			EndTime:      chunk.DurationSeconds * float64(chunk.ChunkIndex+1),
		}

		if err := s.repo.CreateTranscript(transcript); err != nil {
			fmt.Printf("Failed to save transcript for chunk %d: %v\n", chunk.ID, err)
			continue
		}

		successCount++
	}

	// 4. Update session status
	if successCount == 0 {
		errMsg := "Failed to transcribe any chunks"
		s.repo.UpdateSessionStatus(sessionID, models.StatusCaptured, &errMsg, nil)
		return fmt.Errorf("%s", errMsg)
	}

	now := time.Now()
	if err := s.repo.UpdateSessionStatus(sessionID, models.StatusTranscribed, nil, &now); err != nil {
		return fmt.Errorf("failed to update session status: %w", err)
	}

	fmt.Printf("Successfully transcribed session %d (%d/%d chunks)\n", sessionID, successCount, len(chunks))

	// 5. Cleanup Audio Files
	sessionDir := fmt.Sprintf("%s/%d", s.cfg.Summarizer.TempDir, sessionID)
	if err := os.RemoveAll(sessionDir); err != nil {
		fmt.Printf("Warning: Failed to cleanup session directory %s: %v\n", sessionDir, err)
	} else {
		fmt.Printf("Cleaned up audio files for session %d\n", sessionID)
	}

	return nil
}
