package models

import "time"

// SummarizerSession represents a meeting summarization session
// Status flow: STARTED → CAPTURED → TRANSCRIBED → SUMMARIZED
// On failure, status remains at the failed stage with Error field populated
type SummarizerSession struct {
	ID         uint                    `gorm:"primaryKey" json:"id"`
	MeetingID  uint                    `gorm:"not null" json:"meeting_id"`
	Status     SummarizerSessionStatus `gorm:"not null;default:STARTED" json:"status"`
	Transcript *string                 `json:"transcript,omitempty"`
	Summary    *string                 `json:"summary,omitempty"`
	Error      *string                 `json:"error,omitempty"` // Error message if failed at current status
	StartedAt  time.Time               `gorm:"not null" json:"started_at"`
	EndedAt    *time.Time              `json:"ended_at,omitempty"`
	CreatedAt  time.Time               `json:"created_at"`
	UpdatedAt  time.Time               `json:"updated_at"`

	// Relations
	Meeting Meeting `gorm:"foreignKey:MeetingID" json:"meeting,omitempty"`
}

// Status constants for state machine
// On failure, status remains at current stage and Error field is populated
type SummarizerSessionStatus string

const (
	StatusStarted     SummarizerSessionStatus = "STARTED"     // Bot joined, capturing audio
	StatusCaptured    SummarizerSessionStatus = "CAPTURED"    // Audio captured, ready for transcription
	StatusTranscribed SummarizerSessionStatus = "TRANSCRIBED" // Text extracted, ready for normalization
	StatusNormalized  SummarizerSessionStatus = "NORMALIZED"  // Text normalized, ready for summarization
	StatusSummarized  SummarizerSessionStatus = "SUMMARIZED"  // Final summary generated
)
