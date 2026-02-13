package handlers

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"mini-meeting/internal/cache"
	"mini-meeting/internal/config"
	"mini-meeting/internal/services"
	"mini-meeting/pkg/utils"

	"github.com/gofiber/contrib/websocket"
)

// WS message types
const (
	// Sent TO admin
	WSTypePendingRequests = "pending_requests"
	WSTypeNewRequest      = "new_request"
	WSTypeRequestResolved = "request_resolved"
	WSTypeVisitorCancelled = "visitor_cancelled"

	// Sent TO visitor
	WSTypeApproved = "approved"
	WSTypeRejected = "rejected"

	// Received FROM admin
	WSTypeRespond = "respond"
)

// --- Message structs ---

type WSPendingRequestsMsg struct {
	Type     string                     `json:"type"`
	Requests []WSPendingRequestEntry    `json:"requests"`
}

type WSPendingRequestEntry struct {
	RequestID string `json:"request_id"`
	Name      string `json:"name"`
	AvatarURL string `json:"avatar_url,omitempty"`
	Role      string `json:"role"`
	CreatedAt int64  `json:"created_at"`
}

type WSNewRequestMsg struct {
	Type    string                `json:"type"`
	Request WSPendingRequestEntry `json:"request"`
}

type WSRequestResolvedMsg struct {
	Type      string `json:"type"`
	RequestID string `json:"request_id"`
}

type WSApprovedMsg struct {
	Type     string `json:"type"`
	Token    string `json:"token"`
	URL      string `json:"url"`
	RoomName string `json:"room_name"`
	Identity string `json:"identity"`
	UserName string `json:"user_name"`
}

type WSRejectedMsg struct {
	Type string `json:"type"`
}

type WSRespondMsg struct {
	Type      string `json:"type"`
	RequestID string `json:"request_id"`
	Action    string `json:"action"` // "approve" or "reject"
}

// --- Handler ---

type LobbyWSHandler struct {
	livekitService *services.LiveKitService
	meetingService *services.MeetingService
	userService    *services.UserService
	config         *config.Config
}

func NewLobbyWSHandler(
	livekitService *services.LiveKitService,
	meetingService *services.MeetingService,
	userService *services.UserService,
	cfg *config.Config,
) *LobbyWSHandler {
	return &LobbyWSHandler{
		livekitService: livekitService,
		meetingService: meetingService,
		userService:    userService,
		config:         cfg,
	}
}

// HandleVisitor handles the WebSocket connection for a visitor waiting to join.
// Query params: request_id, meeting_code
// The visitor connects AFTER submitting a lobby request via POST /lobby/request.
// They wait for push messages: "approved" or "rejected".
// When the connection closes (e.g., tab closed), the request is automatically cleaned up.
func (h *LobbyWSHandler) HandleVisitor(c *websocket.Conn) {
	requestID := c.Query("request_id")
	meetingCode := c.Query("meeting_code")

	if requestID == "" || meetingCode == "" {
		log.Printf("[WS Visitor] Missing request_id or meeting_code")
		c.WriteJSON(map[string]string{"error": "request_id and meeting_code are required"})
		c.Close()
		return
	}

	// Verify the request exists
	_, err := cache.GetLobbyRequest(requestID)
	if err != nil {
		log.Printf("[WS Visitor] Request not found: %s", requestID)
		c.WriteJSON(map[string]string{"error": "Request not found or expired"})
		c.Close()
		return
	}

	// Register in hub
	cache.Hub.RegisterVisitor(requestID, c)

	// When this function returns (connection closes), clean up
	defer func() {
		cache.Hub.UnregisterVisitor(requestID)

		// Clean up the lobby request from cache
		req, err := cache.GetLobbyRequest(requestID)
		if err == nil && req.Status == cache.LobbyStatusPending {
			cache.CleanupLobbyRequest(requestID)

			// Notify admins that this visitor cancelled (disconnected)
			cache.Hub.NotifyAdmins(meetingCode, WSRequestResolvedMsg{
				Type:      WSTypeVisitorCancelled,
				RequestID: requestID,
			})
			log.Printf("[WS Visitor] Visitor disconnected, cleaned up request %s", requestID)
		}
	}()

	// Read loop — visitor doesn't send meaningful messages, but we need
	// to keep the connection alive and detect disconnection
	for {
		_, _, err := c.ReadMessage()
		if err != nil {
			// Connection closed (tab closed, network issue, etc.)
			log.Printf("[WS Visitor] Connection closed for request %s: %v", requestID, err)
			break
		}
	}
}

// HandleAdmin handles the WebSocket connection for a meeting admin.
// Query params: meeting_code, token (JWT)
// On connect: sends all current pending requests.
// Receives: {type: "respond", request_id, action} messages.
// Pushes: new_request, request_resolved, visitor_cancelled events.
func (h *LobbyWSHandler) HandleAdmin(c *websocket.Conn) {
	meetingCode := c.Query("meeting_code")
	token := c.Query("token")

	if meetingCode == "" || token == "" {
		log.Printf("[WS Admin] Missing meeting_code or token")
		c.WriteJSON(map[string]string{"error": "meeting_code and token are required"})
		c.Close()
		return
	}

	// Validate JWT
	claims, err := utils.ValidateToken(token, h.config.JWT.Secret)
	if err != nil {
		log.Printf("[WS Admin] Invalid token: %v", err)
		c.WriteJSON(map[string]string{"error": "Invalid or expired token"})
		c.Close()
		return
	}

	userID := claims.UserID

	// Verify the user is the meeting creator
	meeting, err := h.meetingService.GetMeetingByCode(meetingCode)
	if err != nil {
		log.Printf("[WS Admin] Meeting not found: %s", meetingCode)
		c.WriteJSON(map[string]string{"error": "Meeting not found"})
		c.Close()
		return
	}

	if meeting.CreatorID != userID {
		log.Printf("[WS Admin] User %d is not the creator of meeting %s", userID, meetingCode)
		c.WriteJSON(map[string]string{"error": "Only meeting creator can manage lobby"})
		c.Close()
		return
	}

	// Register admin connection
	cache.Hub.RegisterAdmin(meetingCode, c)
	defer cache.Hub.UnregisterAdmin(meetingCode, c)

	// Send current pending requests
	pending, err := cache.GetPendingRequests(meetingCode)
	if err != nil {
		log.Printf("[WS Admin] Failed to get pending requests: %v", err)
	}

	entries := make([]WSPendingRequestEntry, 0, len(pending))
	for _, req := range pending {
		entries = append(entries, WSPendingRequestEntry{
			RequestID: req.ID,
			Name:      req.Name,
			AvatarURL: req.AvatarURL,
			Role:      req.Role,
			CreatedAt: req.CreatedAt,
		})
	}

	c.WriteJSON(WSPendingRequestsMsg{
		Type:     WSTypePendingRequests,
		Requests: entries,
	})

	// Read loop — process admin commands
	for {
		_, msgBytes, err := c.ReadMessage()
		if err != nil {
			log.Printf("[WS Admin] Connection closed for meeting %s: %v", meetingCode, err)
			break
		}

		var baseMsg struct {
			Type string `json:"type"`
		}
		if err := json.Unmarshal(msgBytes, &baseMsg); err != nil {
			log.Printf("[WS Admin] Invalid message: %v", err)
			continue
		}

		switch baseMsg.Type {
		case WSTypeRespond:
			var respondMsg WSRespondMsg
			if err := json.Unmarshal(msgBytes, &respondMsg); err != nil {
				log.Printf("[WS Admin] Invalid respond message: %v", err)
				continue
			}
			h.handleAdminRespond(meetingCode, &respondMsg)

		default:
			log.Printf("[WS Admin] Unknown message type: %s", baseMsg.Type)
		}
	}
}

// handleAdminRespond processes an approve/reject action from the admin.
func (h *LobbyWSHandler) handleAdminRespond(meetingCode string, msg *WSRespondMsg) {
	if msg.RequestID == "" || (msg.Action != "approve" && msg.Action != "reject") {
		log.Printf("[WS Admin] Invalid respond params: request_id=%s action=%s", msg.RequestID, msg.Action)
		return
	}

	// Get the lobby request
	lobbyReq, err := cache.GetLobbyRequest(msg.RequestID)
	if err != nil {
		log.Printf("[WS Admin] Request not found: %s", msg.RequestID)
		return
	}

	if lobbyReq.MeetingCode != meetingCode {
		log.Printf("[WS Admin] Request %s does not belong to meeting %s", msg.RequestID, meetingCode)
		return
	}

	if msg.Action == "reject" {
		// Update status
		if err := cache.UpdateLobbyRequestStatus(msg.RequestID, cache.LobbyStatusRejected); err != nil {
			log.Printf("[WS Admin] Failed to reject request: %v", err)
			return
		}

		// Notify visitor
		cache.Hub.NotifyVisitor(msg.RequestID, WSRejectedMsg{
			Type: WSTypeRejected,
		})

		// Notify all admins (in case of multiple admin tabs)
		cache.Hub.NotifyAdmins(meetingCode, WSRequestResolvedMsg{
			Type:      WSTypeRequestResolved,
			RequestID: msg.RequestID,
		})

		// Cleanup
		go cache.CleanupLobbyRequest(msg.RequestID)
		return
	}

	// Approve: generate token
	metadata := fmt.Sprintf(`{"name":"%s","avatar":"%s","role":"%s"}`, lobbyReq.Name, lobbyReq.AvatarURL, lobbyReq.Role)

	token, err := h.livekitService.CreateJoinToken(
		lobbyReq.MeetingCode,
		lobbyReq.Identity,
		lobbyReq.Name,
		lobbyReq.Role,
		metadata,
	)
	if err != nil {
		log.Printf("[WS Admin] Failed to generate token: %v", err)
		return
	}

	// Update status
	if err := cache.UpdateLobbyRequestStatus(msg.RequestID, cache.LobbyStatusApproved); err != nil {
		log.Printf("[WS Admin] Failed to approve request: %v", err)
		return
	}

	// Notify visitor with token
	cache.Hub.NotifyVisitor(msg.RequestID, WSApprovedMsg{
		Type:     WSTypeApproved,
		Token:    token,
		URL:      h.livekitService.GetURL(),
		RoomName: lobbyReq.MeetingCode,
		Identity: lobbyReq.Identity,
		UserName: lobbyReq.Name,
	})

	// Notify all admins
	cache.Hub.NotifyAdmins(meetingCode, WSRequestResolvedMsg{
		Type:      WSTypeRequestResolved,
		RequestID: msg.RequestID,
	})

	// Cleanup after a delay (give visitor time to receive the token)
	go func() {
		time.Sleep(5 * time.Second)
		cache.CleanupLobbyRequest(msg.RequestID)
	}()
}

// HandleVisitorRequest is called from the HTTP RequestToJoin handler
// AFTER storing the lobby request. It notifies connected admins about the new request.
func NotifyAdminsOfNewRequest(lobbyReq *cache.LobbyRequest) {
	cache.Hub.NotifyAdmins(lobbyReq.MeetingCode, WSNewRequestMsg{
		Type: WSTypeNewRequest,
		Request: WSPendingRequestEntry{
			RequestID: lobbyReq.ID,
			Name:      lobbyReq.Name,
			AvatarURL: lobbyReq.AvatarURL,
			Role:      lobbyReq.Role,
			CreatedAt: lobbyReq.CreatedAt,
		},
	})
}
