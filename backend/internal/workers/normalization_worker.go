package workers

import (
	"fmt"
	"mini-meeting/internal/models"
	"mini-meeting/internal/repositories"
	"mini-meeting/internal/services"
	"time"
)

type NormalizationWorker struct {
	repo                 *repositories.SummarizerRepository
	normalizationService *services.NormalizationService
	interval             time.Duration
	stuckThreshold       time.Duration
}

func NewNormalizationWorker(
	repo *repositories.SummarizerRepository,
	normalizationService *services.NormalizationService,
	interval time.Duration,
	stuckThreshold time.Duration,
) *NormalizationWorker {
	return &NormalizationWorker{
		repo:                 repo,
		normalizationService: normalizationService,
		interval:             interval,
		stuckThreshold:       stuckThreshold,
	}
}

// Start begins the worker loop
func (w *NormalizationWorker) Start() {
	ticker := time.NewTicker(w.interval)
	defer ticker.Stop()

	for range ticker.C {
		w.processStuckSessions()
	}
}

// processStuckSessions finds and processes sessions stuck in TRANSCRIBED status
func (w *NormalizationWorker) processStuckSessions() {
	cutoffTime := time.Now().Add(-w.stuckThreshold)

	// Find sessions that are TRANSCRIBED but haven't been updated recently
	sessions, err := w.repo.FindStuckSessions(models.StatusTranscribed, cutoffTime)
	if err != nil {
		fmt.Printf("NormalizationWorker: Error finding stuck sessions: %v\n", err)
		return
	}

	if len(sessions) == 0 {
		return
	}

	fmt.Printf("NormalizationWorker: Found %d stuck TRANSCRIBED sessions\n", len(sessions))

	for _, session := range sessions {
		// Skip if already has normalized transcript
		if session.Transcript != nil && *session.Transcript != "" {
			continue
		}

		fmt.Printf("NormalizationWorker: Processing session %d\n", session.ID)

		if err := w.normalizationService.ProcessSession(session.ID); err != nil {
			fmt.Printf("NormalizationWorker: Failed to normalize session %d: %v\n", session.ID, err)
		}
	}
}
