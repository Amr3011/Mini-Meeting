package handlers

import (
	"fmt"
	"strings"
	"time"

	"mini-meeting/internal/cache"
	"mini-meeting/internal/config"
	"mini-meeting/internal/services"
	"mini-meeting/internal/types"
	"mini-meeting/pkg/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type LobbyHandler struct {
	livekitService *services.LiveKitService
	meetingService *services.MeetingService
	userService    *services.UserService
	config         *config.Config
}

func NewLobbyHandler(
	livekitService *services.LiveKitService,
	meetingService *services.MeetingService,
	userService *services.UserService,
	cfg *config.Config,
) *LobbyHandler {
	return &LobbyHandler{
		livekitService: livekitService,
		meetingService: meetingService,
		userService:    userService,
		config:         cfg,
	}
}

// RequestToJoin handles a user's request to join a meeting.
// If the user is the meeting creator (admin), they are auto-approved with a token.
// Otherwise, a pending request is created in the lobby cache.
// POST /api/v1/lobby/request
func (h *LobbyHandler) RequestToJoin(c *fiber.Ctx) error {
	var req types.LobbyJoinRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if req.MeetingCode == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "meeting_code is required",
		})
	}

	// Verify meeting exists
	meeting, err := h.meetingService.GetMeetingByCode(req.MeetingCode)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Meeting not found",
		})
	}

	// Try to extract user ID from auth header (optional)
	var userID uint
	authHeader := c.Get("Authorization")
	if authHeader != "" {
		parts := strings.Split(authHeader, " ")
		if len(parts) == 2 && parts[0] == "Bearer" {
			claims, err := utils.ValidateToken(parts[1], h.config.JWT.Secret)
			if err == nil {
				userID = claims.UserID
			}
		}
	}

	// Build identity, name, role, metadata
	var userName, identity, userRole, metadata, avatarURL string

	if userID > 0 {
		user, err := h.userService.GetUserByID(userID)
		if err != nil {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "User not found",
			})
		}

		userRole = "user"
		if meeting.CreatorID == userID {
			userRole = "admin"
		}

		userName = user.Name
		if req.UserName != "" {
			userName = req.UserName
		}
		avatarURL = user.AvatarURL

		identity = fmt.Sprintf("user_%d", userID)
		metadata = fmt.Sprintf(`{"name":"%s","avatar":"%s","role":"%s"}`, userName, user.AvatarURL, userRole)
	} else {
		if req.UserName == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "User name is required for guest users",
			})
		}

		userName = req.UserName
		userRole = "guest"
		identity = fmt.Sprintf("guest_%d", c.Context().ConnID())
		metadata = fmt.Sprintf(`{"name":"%s","avatar":"","role":"%s"}`, userName, userRole)
	}

	// If admin (meeting creator), auto-approve and return token immediately
	if userRole == "admin" {
		token, err := h.livekitService.CreateJoinToken(
			req.MeetingCode, identity, userName, userRole, metadata,
		)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to generate token",
			})
		}

		return c.JSON(types.LobbyJoinResponse{
			RequestID: "",
			Status:    "auto_approved",
			Token:     token,
			URL:       h.livekitService.GetURL(),
			RoomName:  req.MeetingCode,
			Identity:  identity,
			UserName:  userName,
		})
	}

	// Non-admin: create a pending lobby request
	requestID := uuid.New().String()

	lobbyReq := &cache.LobbyRequest{
		ID:          requestID,
		MeetingCode: req.MeetingCode,
		UserID:      userID,
		Name:        userName,
		AvatarURL:   avatarURL,
		Identity:    identity,
		Role:        userRole,
		Status:      cache.LobbyStatusPending,
		CreatedAt:   time.Now().Unix(),
	}

	if err := cache.StoreLobbyRequest(lobbyReq); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create lobby request",
		})
	}

	// Notify admins via WebSocket
	NotifyAdminsOfNewRequest(lobbyReq)

	return c.JSON(types.LobbyJoinResponse{
		RequestID: requestID,
		Status:    "pending",
	})
}

// CancelRequest lets a waiting user cancel their own join request.
// DELETE /api/v1/lobby/request?request_id=xxx
func (h *LobbyHandler) CancelRequest(c *fiber.Ctx) error {
	requestID := c.Query("request_id")
	if requestID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "request_id is required",
		})
	}

	// Get the request to know which meeting to notify
	req, _ := cache.GetLobbyRequest(requestID)

	if err := cache.CleanupLobbyRequest(requestID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to cancel request",
		})
	}

	// Notify admins that this request was cancelled
	if req != nil {
		cache.Hub.NotifyAdmins(req.MeetingCode, map[string]string{
			"type":       "visitor_cancelled",
			"request_id": requestID,
		})
	}

	return c.JSON(fiber.Map{
		"message": "Request cancelled",
	})
}

// RespondToRequest lets the admin approve or reject a lobby request (HTTP fallback).
// POST /api/v1/lobby/respond
func (h *LobbyHandler) RespondToRequest(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uint)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	var req types.LobbyRespondRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if req.MeetingCode == "" || req.RequestID == "" || req.Action == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "meeting_code, request_id, and action are required",
		})
	}

	if req.Action != "approve" && req.Action != "reject" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "action must be 'approve' or 'reject'",
		})
	}

	// Verify the user is the meeting creator
	meeting, err := h.meetingService.GetMeetingByCode(req.MeetingCode)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Meeting not found",
		})
	}

	if meeting.CreatorID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Only meeting creator can manage lobby requests",
		})
	}

	// Get the lobby request
	lobbyReq, err := cache.GetLobbyRequest(req.RequestID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Request not found or expired",
		})
	}

	if lobbyReq.MeetingCode != req.MeetingCode {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Request does not belong to this meeting",
		})
	}

	if req.Action == "reject" {
		if err := cache.UpdateLobbyRequestStatus(req.RequestID, cache.LobbyStatusRejected); err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to reject request",
			})
		}

		// Notify visitor via WebSocket
		cache.Hub.NotifyVisitor(req.RequestID, map[string]string{"type": "rejected"})
		cache.Hub.NotifyAdmins(req.MeetingCode, map[string]string{
			"type":       "request_resolved",
			"request_id": req.RequestID,
		})
		go cache.CleanupLobbyRequest(req.RequestID)

		return c.JSON(fiber.Map{
			"message": "Request rejected",
		})
	}

	// Approve: generate token and store it
	metadata := fmt.Sprintf(`{"name":"%s","avatar":"%s","role":"%s"}`, lobbyReq.Name, lobbyReq.AvatarURL, lobbyReq.Role)

	token, err := h.livekitService.CreateJoinToken(
		lobbyReq.MeetingCode,
		lobbyReq.Identity,
		lobbyReq.Name,
		lobbyReq.Role,
		metadata,
	)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate token",
		})
	}

	// Update status to approved
	if err := cache.UpdateLobbyRequestStatus(req.RequestID, cache.LobbyStatusApproved); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to approve request",
		})
	}

	// Notify visitor via WebSocket
	cache.Hub.NotifyVisitor(req.RequestID, map[string]interface{}{
		"type":      "approved",
		"token":     token,
		"url":       h.livekitService.GetURL(),
		"room_name": lobbyReq.MeetingCode,
		"identity":  lobbyReq.Identity,
		"user_name": lobbyReq.Name,
	})
	cache.Hub.NotifyAdmins(req.MeetingCode, map[string]string{
		"type":       "request_resolved",
		"request_id": req.RequestID,
	})
	go func() {
		// give visitor time to receive the token
		time.Sleep(5 * time.Second)
		cache.CleanupLobbyRequest(req.RequestID)
	}()

	return c.JSON(fiber.Map{
		"message": "Request approved",
	})
}
