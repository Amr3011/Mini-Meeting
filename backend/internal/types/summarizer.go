package types

import (
	"mini-meeting/internal/models"
	"time"
)

type PaginatedSessionsResponse struct {
	Data       []SessionsList `json:"data"`
	Total      int64          `json:"total"`
	Page       int            `json:"page"`
	PageSize   int            `json:"page_size"`
	TotalPages int            `json:"total_pages"`
}

type SessionsList struct {
	ID        uint                           `json:"id"`
	Status    models.SummarizerSessionStatus `json:"status"`
	Error     *string                        `json:"error"`
	StartedAt time.Time                      `json:"started_at"`
}

type SessionResponse struct {
	ID         uint                           `json:"id"`
	Status     models.SummarizerSessionStatus `json:"status"`
	Error      *string                        `json:"error"`
	Transcript *string                        `json:"transcript"`
	Summary    *string                        `json:"summary"`
	StartedAt  time.Time                      `json:"started_at"`
	EndedAt    *time.Time                     `json:"ended_at,omitempty"`
}
