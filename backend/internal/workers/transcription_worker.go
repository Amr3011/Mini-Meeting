package workers

import (
	"log"
	"mini-meeting/internal/models"
	"mini-meeting/internal/repositories"
	"mini-meeting/internal/services"
	"time"
)

type TranscriptionWorker struct {
	repo                 *repositories.SummarizerRepository
	transcriptionService *services.TranscriptionService
	interval             time.Duration
	stuckThreshold       time.Duration
}

func NewTranscriptionWorker(
	repo *repositories.SummarizerRepository,
	transcriptionService *services.TranscriptionService,
	interval time.Duration,
	stuckThreshold time.Duration,
) *TranscriptionWorker {
	return &TranscriptionWorker{
		repo:                 repo,
		transcriptionService: transcriptionService,
		interval:             interval,
		stuckThreshold:       stuckThreshold,
	}
}

// Start begins the background worker process
func (w *TranscriptionWorker) Start() {
	ticker := time.NewTicker(w.interval)

	// Run immediately on start
	go w.processStuckSessions()

	go func() {
		for range ticker.C {
			w.processStuckSessions()
		}
	}()
}

// processStuckSessions finds and processes sessions stuck in CAPTURED status
func (w *TranscriptionWorker) processStuckSessions() {
	cutoffTime := time.Now().Add(-w.stuckThreshold)

	sessions, err := w.repo.FindStuckSessions(models.StatusCaptured, cutoffTime)
	if err != nil {
		log.Printf("Worker: Failed to fetch stuck sessions: %v", err)
		return
	}

	if len(sessions) > 0 {
		log.Printf("Worker: Found %d stuck sessions to process", len(sessions))
	}

	for _, session := range sessions {
		log.Printf("Worker: Processing stuck session %d (last updated: %v)", session.ID, session.UpdatedAt)
		if err := w.transcriptionService.ProcessSession(session.ID); err != nil {
			log.Printf("Worker: Failed to process session %d: %v", session.ID, err)
		}
	}
}
