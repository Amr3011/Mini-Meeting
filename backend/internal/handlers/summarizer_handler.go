package handlers

import (
	"fmt"
	"mini-meeting/internal/services"
	"os"
	"path/filepath"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type SummarizerHandler struct {
	service *services.SummarizerService
}

func NewSummarizerHandler(service *services.SummarizerService) *SummarizerHandler {
	return &SummarizerHandler{service: service}
}

// StartSummarizer starts the summarizer for a meeting
// POST /api/v1/meetings/:id/summarizer/start
func (h *SummarizerHandler) StartSummarizer(c *fiber.Ctx) error {
	// Get authenticated user ID
	userID, ok := c.Locals("userID").(uint)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// Get meeting ID from params
	meetingID, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid meeting ID",
		})
	}

	// Start summarizer
	session, err := h.service.StartSummarizer(uint(meetingID), userID)
	if err != nil {
		// Determine appropriate status code
		statusCode := fiber.StatusInternalServerError
		if err.Error() == "meeting not found" {
			statusCode = fiber.StatusNotFound
		} else if err.Error() == "unauthorized: only meeting creator can start summarizer" {
			statusCode = fiber.StatusForbidden
		} else if err.Error() == "summarizer already running for this meeting" {
			statusCode = fiber.StatusConflict
		}

		return c.Status(statusCode).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Summarizer started successfully",
		"data": fiber.Map{
			"session_id": session.ID,
			"meeting_id": session.MeetingID,
			"status":     session.Status,
			"started_at": session.StartedAt,
		},
	})
}

// StopSummarizer stops the summarizer for a meeting
// POST /api/v1/meetings/:id/summarizer/stop
func (h *SummarizerHandler) StopSummarizer(c *fiber.Ctx) error {
	// Get authenticated user ID
	userID, ok := c.Locals("userID").(uint)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// Get meeting ID from params
	meetingID, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid meeting ID",
		})
	}

	// Get active session for this meeting
	session, err := h.service.GetActiveSession(uint(meetingID))
	if err != nil {
		statusCode := fiber.StatusNotFound
		if err.Error() == "no active summarizer session found" {
			statusCode = fiber.StatusNotFound
		}
		return c.Status(statusCode).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Stop summarizer
	totalChunks, err := h.service.StopSummarizer(session.ID, userID)
	if err != nil {
		// Determine appropriate status code
		statusCode := fiber.StatusInternalServerError
		if err.Error() == "session not found" || err.Error() == "meeting not found" {
			statusCode = fiber.StatusNotFound
		} else if err.Error() == "unauthorized: only meeting creator can stop summarizer" {
			statusCode = fiber.StatusForbidden
		} else if err.Error()[:28] == "session is not active" {
			statusCode = fiber.StatusConflict
		}

		return c.Status(statusCode).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Reload session to get updated data
	session, _ = h.service.GetSessionByID(session.ID)

	return c.JSON(fiber.Map{
		"message": "Summarizer stopped successfully",
		"data": fiber.Map{
			"session_id":   session.ID,
			"meeting_id":   session.MeetingID,
			"status":       session.Status,
			"started_at":   session.StartedAt,
			"ended_at":     session.EndedAt,
			"total_chunks": totalChunks,
		},
	})
}

// TestWhisper tests the connection to the Whisper service
// GET /api/v1/summarizer/test-whisper
func (h *SummarizerHandler) TestWhisper(c *fiber.Ctx) error {
	if err := h.service.TestTranscription(); err != nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"status":  "error",
			"message": "Whisper service is not reachable",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"status":  "ok",
		"message": "Whisper service is reachable",
	})
}

// TestTranscribe transcribes a specific file and saves the result to a .txt file
// GET /api/v1/summarizer/test-transcribe?file=...
func (h *SummarizerHandler) TestTranscribe(c *fiber.Ctx) error {
	filePath := c.Query("file")
	if filePath == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "file query parameter is required",
		})
	}

	// Transcribe
	text, err := h.service.TestTranscribeFile(filePath)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": fmt.Sprintf("Transcription failed: %v", err),
		})
	}

	// Save to .txt file in tmp folder
	outputFile := "./tmp/test_transcription.txt"
	if err := os.WriteFile(outputFile, []byte(text), 0644); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": fmt.Sprintf("Failed to save transcription to file: %v", err),
		})
	}

	absPath, _ := filepath.Abs(outputFile)

	return c.JSON(fiber.Map{
		"status":  "ok",
		"message": "Transcription successful",
		"data": fiber.Map{
			"text":        text,
			"saved_to":    absPath,
			"source_file": filePath,
		},
	})
}
