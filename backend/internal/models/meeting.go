package models

import "time"

type Meeting struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	CreatorID   uint      `gorm:"not null" json:"creator_id"`
	MeetingCode string    `gorm:"unique;not null;size:14" json:"meeting_code"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// Relations
	Creator User `gorm:"foreignKey:CreatorID" json:"creator,omitempty"`
}

type MeetingResponse struct {
	ID          uint      `json:"id"`
	CreatorID   uint      `json:"creator_id"`
	MeetingCode string    `json:"meeting_code"`
	MeetingLink string    `json:"meeting_link"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (m *Meeting) ToResponse(baseURL string) MeetingResponse {
	return MeetingResponse{
		ID:          m.ID,
		CreatorID:   m.CreatorID,
		MeetingCode: m.MeetingCode,
		MeetingLink: baseURL + m.MeetingCode,
		CreatedAt:   m.CreatedAt,
		UpdatedAt:   m.UpdatedAt,
	}
}
