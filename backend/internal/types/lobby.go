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
	RoomCode string `json:"room_code,omitempty"`
	Identity string `json:"identity,omitempty"`
	UserName string `json:"user_name,omitempty"`
}

// LobbyRespondRequest is sent by admin to approve/reject a request (HTTP fallback)
type LobbyRespondRequest struct {
	MeetingCode string `json:"meeting_code" validate:"required"`
	RequestID   string `json:"request_id" validate:"required"`
	Action      string `json:"action" validate:"required"` // "approve" or "reject"
}

