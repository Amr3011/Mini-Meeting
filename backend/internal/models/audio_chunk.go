package models

import "time"

// AudioChunk represents metadata for a captured audio chunk
type AudioChunk struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	SessionID       uint      `gorm:"not null" json:"session_id"`
	UserIdentity    string    `gorm:"not null;size:255" json:"user_identity"`
	ChunkIndex      int       `gorm:"not null" json:"chunk_index"`
	FilePath        string    `gorm:"not null" json:"file_path"`
	StartTimestamp  time.Time `gorm:"not null" json:"start_timestamp"`
	EndTimestamp    time.Time `gorm:"not null" json:"end_timestamp"`
	DurationSeconds float64   `gorm:"not null" json:"duration_seconds"`
	CreatedAt       time.Time `json:"created_at"`

	// Relations
	Session SummarizerSession `gorm:"foreignKey:SessionID" json:"session,omitempty"`
}
