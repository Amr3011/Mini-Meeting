package handlers

import (
	"mini-meeting/internal/services"
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

// GetSessions retrieves a paginated list of sessions for the authenticated user
// GET /api/v1/sessions?page=1&page_size=10
func (h *SummarizerHandler) GetSessions(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uint)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	page := c.QueryInt("page", 1)
	pageSize := c.QueryInt("page_size", 10)

	response, err := h.service.GetSessions(userID, page, pageSize)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(response)
}

// GetSession retrieves a specific session by ID
// GET /api/v1/sessions/:id
func (h *SummarizerHandler) GetSession(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uint)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid session ID",
		})
	}

	session, err := h.service.GetSession(uint(id), userID)
	if err != nil {
		statusCode := fiber.StatusInternalServerError
		if err.Error() == "session not found" {
			statusCode = fiber.StatusNotFound
		} else if err.Error() == "unauthorized: session does not belong to user" {
			statusCode = fiber.StatusForbidden
		}
		return c.Status(statusCode).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"data": session,
	})
}

// DeleteSession deletes a session by ID
// DELETE /api/v1/sessions/:id
func (h *SummarizerHandler) DeleteSession(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uint)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid session ID",
		})
	}

	if err := h.service.DeleteSession(uint(id), userID); err != nil {
		statusCode := fiber.StatusInternalServerError
		// Check for error substring since it's wrapped
		errMsg := err.Error()
		if len(errMsg) >= 17 && errMsg[:17] == "session not found" {
			statusCode = fiber.StatusNotFound
		} else if errMsg == "unauthorized: session does not belong to user" {
			statusCode = fiber.StatusForbidden
		}
		return c.Status(statusCode).JSON(fiber.Map{
			"error": errMsg,
		})
	}

	return c.JSON(fiber.Map{
		"message": "Session deleted successfully",
	})
}
