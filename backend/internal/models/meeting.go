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
