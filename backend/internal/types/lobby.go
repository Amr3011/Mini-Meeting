package types

// LobbyJoinRequest represents a request to join a meeting lobby
type LobbyJoinRequest struct {
	MeetingCode string `json:"meeting_code" validate:"required"`
	UserName    string `json:"user_name,omitempty"`
}

// LobbyJoinResponse is returned when a join request is created
type LobbyJoinResponse struct {
	RequestID string `json:"request_id"`
	Status    string `json:"status"` // "pending", "approved", "auto_approved"

	// Only set when auto-approved (admin)
	Token    string `json:"token,omitempty"`
	URL      string `json:"url,omitempty"`
	RoomName string `json:"room_name,omitempty"`
	Identity string `json:"identity,omitempty"`
	UserName string `json:"user_name,omitempty"`
}

// LobbyStatusResponse is returned when checking request status
type LobbyStatusResponse struct {
	Status string `json:"status"` // "pending", "approved", "rejected"

	// Only set when approved
	Token    string `json:"token,omitempty"`
	URL      string `json:"url,omitempty"`
	RoomName string `json:"room_name,omitempty"`
	Identity string `json:"identity,omitempty"`
	UserName string `json:"user_name,omitempty"`
}

// LobbyRespondRequest is sent by admin to approve/reject a request
type LobbyRespondRequest struct {
	MeetingCode string `json:"meeting_code" validate:"required"`
	RequestID   string `json:"request_id" validate:"required"`
	Action      string `json:"action" validate:"required"` // "approve" or "reject"
}

// LobbyPendingEntry represents a single pending request shown to admin
type LobbyPendingEntry struct {
	RequestID string `json:"request_id"`
	Name      string `json:"name"`
	AvatarURL string `json:"avatar_url,omitempty"`
	Role      string `json:"role"` // "user" or "guest"
	CreatedAt int64  `json:"created_at"`
}

// LobbyPendingResponse is returned when listing pending requests
type LobbyPendingResponse struct {
	Requests []LobbyPendingEntry `json:"requests"`
}
