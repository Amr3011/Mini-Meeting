package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mime/multipart"
	"mini-meeting/internal/config"
	"mini-meeting/internal/repositories"
	"net/http"
	"os"
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

// CheckHealth checks if the Whisper service is up and running
func (s *TranscriptionService) CheckHealth() error {
	resp, err := http.Get(s.cfg.Whisper.URL + "/docs")
	if err != nil {
		return fmt.Errorf("whisper service unreachable: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("whisper service returned unexpected status: %d", resp.StatusCode)
	}

	return nil
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
