package handlers

import (
	"fmt"
	"strings"

	"mini-meeting/internal/config"
	"mini-meeting/internal/services"
	"mini-meeting/pkg/utils"

	"github.com/gofiber/fiber/v2"
)

type LiveKitHandler struct {
	livekitService *services.LiveKitService
	meetingService *services.MeetingService
	userService    *services.UserService
	config         *config.Config
}

func NewLiveKitHandler(
	livekitService *services.LiveKitService,
	meetingService *services.MeetingService,
	userService *services.UserService,
	cfg *config.Config,
) *LiveKitHandler {
	return &LiveKitHandler{
		livekitService: livekitService,
		meetingService: meetingService,
		userService:    userService,
		config:         cfg,
	}
}

// Request/Response types
type GenerateTokenRequest struct {
	MeetingCode string `json:"meeting_code" validate:"required"`
	UserName    string `json:"user_name,omitempty"`
}

type GenerateTokenResponse struct {
	Token    string `json:"token"`
	URL      string `json:"url"`
	RoomName string `json:"room_name"`
	Identity string `json:"identity"`
	UserName string `json:"user_name"`
}

type RemoveParticipantRequest struct {
	MeetingCode         string `json:"meeting_code" validate:"required"`
	ParticipantIdentity string `json:"participant_identity" validate:"required"`
}

type ListParticipantsResponse struct {
	Participants []ParticipantInfo `json:"participants"`
}

type ParticipantInfo struct {
	Identity string `json:"identity"`
	Name     string `json:"name"`
	State    string `json:"state"`
	Metadata string `json:"metadata"`
	JoinedAt int64  `json:"joined_at"`
}

// GenerateToken generates a LiveKit token for joining a meeting
// Supports both authenticated users and guest users
func (h *LiveKitHandler) GenerateToken(c *fiber.Ctx) error {
	// Try to get user ID from context (set by auth middleware for authenticated users)
	// For guest users, this will be nil
	var userID uint

	// Try to extract user from JWT token if present (for authenticated users)
	authHeader := c.Get("Authorization")
	if authHeader != "" {
		parts := strings.Split(authHeader, " ")
		if len(parts) == 2 && parts[0] == "Bearer" {
			token := parts[1]
			claims, err := utils.ValidateToken(token, h.config.JWT.Secret)
			if err == nil {
				userID = claims.UserID
			}
		}
	}

	var req GenerateTokenRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Verify meeting exists
	meeting, err := h.meetingService.GetMeetingByCode(req.MeetingCode)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Meeting not found",
		})
	}

	var userName string
	var identity string
	var userRole string
	var metadata string

	// Handle authenticated users
	if userID > 0 {
		// Get user details
		user, err := h.userService.GetUserByID(userID)
		if err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "User not found",
			})
		}

		// Determine user role for the meeting
		// Creator is admin, others are regular users
		userRole = "user"
		if meeting.CreatorID == userID {
			userRole = "admin"
		}

		// Use custom user name if provided, otherwise use user's name
		userName = user.Name
		if req.UserName != "" {
			userName = req.UserName
		}

		identity = fmt.Sprintf("user_%d", userID)
		metadata = fmt.Sprintf(`{"name":"%s","avatar":"%s","role":"%s"}`, userName, user.AvatarURL, userRole)
	} else {
		// Handle guest users
		if req.UserName == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "User name is required for guest users",
			})
		}

		userName = req.UserName
		userRole = "guest"
		// Generate a unique guest identity based on timestamp and random component
		identity = fmt.Sprintf("guest_%d", c.Context().ConnID())
		metadata = fmt.Sprintf(`{"name":"%s","avatar":"","role":"%s"}`, userName, userRole)
	}

	// Generate token
	// Use meeting code as room name for LiveKit
	token, err := h.livekitService.CreateJoinToken(
		req.MeetingCode,
		identity,
		userRole,
		metadata,
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate token",
		})
	}

	response := GenerateTokenResponse{
		Token:    token,
		URL:      h.livekitService.GetURL(),
		RoomName: req.MeetingCode,
		Identity: identity,
		UserName: userName,
	}

	return c.JSON(response)
}

// RemoveParticipant removes a participant from a meeting (admin only)
func (h *LiveKitHandler) RemoveParticipant(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uint)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	var req RemoveParticipantRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Verify meeting exists and user is the creator
	meeting, err := h.meetingService.GetMeetingByCode(req.MeetingCode)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Meeting not found",
		})
	}

	// Only meeting creator can remove participants
	if meeting.CreatorID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Only meeting creator can remove participants",
		})
	}

	// Remove participant
	err = h.livekitService.RemoveParticipant(req.MeetingCode, req.ParticipantIdentity)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to remove participant",
		})
	}

	return c.SendStatus(fiber.StatusNoContent)
}

// ListParticipants lists all participants in a meeting
func (h *LiveKitHandler) ListParticipants(c *fiber.Ctx) error {
	meetingCode := c.Query("meeting_code")
	if meetingCode == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "meeting_code is required",
		})
	}

	// Verify meeting exists
	_, err := h.meetingService.GetMeetingByCode(meetingCode)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Meeting not found",
		})
	}

	// List participants
	participants, err := h.livekitService.ListParticipants(meetingCode)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to list participants",
		})
	}

	// Convert to response format
	participantInfos := make([]ParticipantInfo, 0, len(participants))
	for _, p := range participants {
		participantInfos = append(participantInfos, ParticipantInfo{
			Identity: p.Identity,
			Name:     p.Name,
			State:    p.State.String(),
			Metadata: p.Metadata,
			JoinedAt: p.JoinedAt,
		})
	}

	response := ListParticipantsResponse{
		Participants: participantInfos,
	}

	return c.JSON(response)
}
