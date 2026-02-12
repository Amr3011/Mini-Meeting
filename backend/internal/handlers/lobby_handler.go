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

	return c.JSON(types.LobbyJoinResponse{
		RequestID: requestID,
		Status:    "pending",
	})
}

// CheckStatus lets a waiting user poll for their request status.
// GET /api/v1/lobby/status?request_id=xxx&meeting_code=xxx
func (h *LobbyHandler) CheckStatus(c *fiber.Ctx) error {
	requestID := c.Query("request_id")
	if requestID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "request_id is required",
		})
	}

	lobbyReq, err := cache.GetLobbyRequest(requestID)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Request not found or expired",
		})
	}

	response := types.LobbyStatusResponse{
		Status: string(lobbyReq.Status),
	}

	// If approved, include the token data
	if lobbyReq.Status == cache.LobbyStatusApproved {
		tokenData, err := cache.GetLobbyToken(requestID)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Token not ready yet",
			})
		}

		response.Token = tokenData.Token
		response.URL = tokenData.URL
		response.RoomName = tokenData.RoomName
		response.Identity = tokenData.Identity
		response.UserName = tokenData.UserName

		// Cleanup after token is fetched
		go cache.CleanupLobbyRequest(requestID)
	}

	// If rejected, cleanup
	if lobbyReq.Status == cache.LobbyStatusRejected {
		go cache.CleanupLobbyRequest(requestID)
	}

	return c.JSON(response)
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

	if err := cache.CleanupLobbyRequest(requestID); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to cancel request",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Request cancelled",
	})
}

// GetPendingRequests returns all pending lobby requests for a meeting (admin only).
// GET /api/v1/lobby/pending?meeting_code=xxx
func (h *LobbyHandler) GetPendingRequests(c *fiber.Ctx) error {
	userID, ok := c.Locals("userID").(uint)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized",
		})
	}

	meetingCode := c.Query("meeting_code")
	if meetingCode == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "meeting_code is required",
		})
	}

	// Verify the user is the meeting creator
	meeting, err := h.meetingService.GetMeetingByCode(meetingCode)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Meeting not found",
		})
	}

	if meeting.CreatorID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Only meeting creator can view lobby requests",
		})
	}

	pending, err := cache.GetPendingRequests(meetingCode)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get pending requests",
		})
	}

	entries := make([]types.LobbyPendingEntry, 0, len(pending))
	for _, req := range pending {
		entries = append(entries, types.LobbyPendingEntry{
			RequestID: req.ID,
			Name:      req.Name,
			AvatarURL: req.AvatarURL,
			Role:      req.Role,
			CreatedAt: req.CreatedAt,
		})
	}

	return c.JSON(types.LobbyPendingResponse{
		Requests: entries,
	})
}

// RespondToRequest lets the admin approve or reject a lobby request.
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

	// Store token for the user to pick up
	tokenData := &cache.LobbyTokenData{
		Token:    token,
		URL:      h.livekitService.GetURL(),
		RoomName: lobbyReq.MeetingCode,
		Identity: lobbyReq.Identity,
		UserName: lobbyReq.Name,
	}

	if err := cache.StoreLobbyToken(req.RequestID, tokenData); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to store token",
		})
	}

	// Update status to approved
	if err := cache.UpdateLobbyRequestStatus(req.RequestID, cache.LobbyStatusApproved); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to approve request",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Request approved",
	})
}
