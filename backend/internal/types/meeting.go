package types

import (
	"mini-meeting/internal/models"
	"time"
)

// MeetingResponse represents the API response for a meeting
type MeetingResponse struct {
	ID          uint      `json:"id"`
	CreatorID   uint      `json:"creator_id"`
	MeetingCode string    `json:"meeting_code"`
	MeetingLink string    `json:"meeting_link"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// ToMeetingResponse converts a Meeting model to MeetingResponse
func ToMeetingResponse(m *models.Meeting, baseURL string) MeetingResponse {
	return MeetingResponse{
		ID:          m.ID,
		CreatorID:   m.CreatorID,
		MeetingCode: m.MeetingCode,
		MeetingLink: baseURL + m.MeetingCode,
		CreatedAt:   m.CreatedAt,
		UpdatedAt:   m.UpdatedAt,
	}
}
