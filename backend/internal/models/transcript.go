package models

import "time"

// Transcript represents a transcribed segment of audio from a participant
type Transcript struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	SessionID    uint      `gorm:"not null" json:"session_id"`
	UserIdentity string    `gorm:"not null" json:"user_identity"`
	Text         string    `gorm:"type:text;not null" json:"text"`
	StartTime    float64   `json:"start_time"`
	EndTime      float64   `json:"end_time"`
	CreatedAt    time.Time `json:"created_at"`

	// Link to the audio chunk if available
	ChunkID *uint `json:"chunk_id,omitempty"`
}
