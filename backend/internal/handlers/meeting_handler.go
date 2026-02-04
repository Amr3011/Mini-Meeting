package handlers

import (
	"mini-meeting/internal/config"
	"mini-meeting/internal/models"
	"mini-meeting/internal/services"
	"strconv"

	"github.com/gofiber/fiber/v2"
)

type MeetingHandler struct {
	service *services.MeetingService
	cfg     *config.Config
}

func NewMeetingHandler(service *services.MeetingService, cfg *config.Config) *MeetingHandler {
	return &MeetingHandler{service: service, cfg: cfg}
}

// CreateMeeting creates a new instant meeting
// POST /api/v1/meetings
func (h *MeetingHandler) CreateMeeting(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uint)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	// Create instant meeting (no request body needed)
	meeting, err := h.service.CreateMeeting(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Generate meeting link using frontend URL
	baseURL := h.cfg.Server.FrontendURL
	if baseURL == "" {
		baseURL = "http://localhost:5173"
	}
	baseURL = baseURL + "/"

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Meeting created successfully",
		"data":    meeting.ToResponse(baseURL),
	})
}

// GetMeeting retrieves a meeting by ID
// GET /api/v1/meetings/:id
func (h *MeetingHandler) GetMeeting(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid meeting ID",
		})
	}

	meeting, err := h.service.GetMeetingByID(uint(id))
	if err != nil {
		if err.Error() == "meeting not found" {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	baseURL := h.cfg.Server.FrontendURL
	if baseURL == "" {
		baseURL = "http://localhost:5173"
	}

	return c.JSON(fiber.Map{
		"data": meeting.ToResponse(baseURL),
	})
}

// GetMeetingByCode retrieves a meeting by its code
// GET /api/v1/meetings/code/:code
func (h *MeetingHandler) GetMeetingByCode(c *fiber.Ctx) error {
	code := c.Params("code")
	if code == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Meeting code is required",
		})
	}

	meeting, err := h.service.GetMeetingByCode(code)
	if err != nil {
		if err.Error() == "meeting not found" {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	baseURL := h.cfg.Server.FrontendURL
	if baseURL == "" {
		baseURL = "http://localhost:5173"
	}

	return c.JSON(fiber.Map{
		"data": meeting.ToResponse(baseURL),
	})
}

// GetMyMeetings retrieves meetings created by the current user
// GET /api/v1/meetings/my
func (h *MeetingHandler) GetMyMeetings(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uint)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	meetings, err := h.service.GetMeetingsByCreatorID(userID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	baseURL := h.cfg.Server.FrontendURL
	if baseURL == "" {
		baseURL = "http://localhost:5173"
	}

	responses := make([]models.MeetingResponse, len(meetings))
	for i, meeting := range meetings {
		responses[i] = meeting.ToResponse(baseURL)
	}

	return c.JSON(fiber.Map{
		"data": responses,
	})
}

// GetAllMeetings retrieves all meetings
// GET /api/v1/meetings
func (h *MeetingHandler) GetAllMeetings(c *fiber.Ctx) error {
	meetings, err := h.service.GetAllMeetings()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	baseURL := h.cfg.Server.FrontendURL
	if baseURL == "" {
		baseURL = "http://localhost:5173"
	}

	responses := make([]models.MeetingResponse, len(meetings))
	for i, meeting := range meetings {
		responses[i] = meeting.ToResponse(baseURL)
	}

	return c.JSON(fiber.Map{
		"data": responses,
	})
}

// DeleteMeeting deletes a meeting by ID
// DELETE /api/v1/meetings/:id
func (h *MeetingHandler) DeleteMeeting(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uint)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid meeting ID",
		})
	}

	if err := h.service.DeleteMeeting(uint(id), userID); err != nil {
		if err.Error() == "meeting not found" {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		if err.Error() == "unauthorized: you can only delete your own meetings" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": err.Error(),
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"message": "Meeting deleted successfully",
	})
}
