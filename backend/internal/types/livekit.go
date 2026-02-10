package types

// GenerateTokenRequest represents the request to generate a LiveKit token
type GenerateTokenRequest struct {
	MeetingCode string `json:"meeting_code" validate:"required"`
	UserName    string `json:"user_name,omitempty"`
}

// GenerateTokenResponse represents the response after generating a LiveKit token
type GenerateTokenResponse struct {
	Token    string `json:"token"`
	URL      string `json:"url"`
	RoomName string `json:"room_name"`
	Identity string `json:"identity"`
	UserName string `json:"user_name"`
}

// RemoveParticipantRequest represents the request to remove a participant from a meeting
type RemoveParticipantRequest struct {
	MeetingCode         string `json:"meeting_code" validate:"required"`
	ParticipantIdentity string `json:"participant_identity" validate:"required"`
}

// MuteParticipantRequest represents the request to mute/unmute a participant
type MuteParticipantRequest struct {
	MeetingCode         string `json:"meeting_code" validate:"required"`
	ParticipantIdentity string `json:"participant_identity" validate:"required"`
	TrackSid            string `json:"track_sid" validate:"required"`
	Muted               bool   `json:"muted"`
}

// EndMeetingRequest represents the request to end a meeting
type EndMeetingRequest struct {
	MeetingCode string `json:"meeting_code" validate:"required"`
}

// ListParticipantsResponse represents the response containing list of participants
type ListParticipantsResponse struct {
	Participants []ParticipantInfo `json:"participants"`
}

// ParticipantInfo represents information about a meeting participant
type ParticipantInfo struct {
	Identity string `json:"identity"`
	Name     string `json:"name"`
	State    string `json:"state"`
	Metadata string `json:"metadata"`
	JoinedAt int64  `json:"joined_at"`
}
