package workers

import (
	"fmt"
	"mini-meeting/internal/models"
	"mini-meeting/internal/repositories"
	"mini-meeting/internal/services"
	"time"
)

type SummarizationWorker struct {
	repo              *repositories.SummarizerRepository
	summarizerService *services.SummarizerService
	interval          time.Duration
	stuckThreshold    time.Duration
}

func NewSummarizationWorker(
	repo *repositories.SummarizerRepository,
	summarizerService *services.SummarizerService,
	interval time.Duration,
	stuckThreshold time.Duration,
) *SummarizationWorker {
	return &SummarizationWorker{
		repo:              repo,
		summarizerService: summarizerService,
		interval:          interval,
		stuckThreshold:    stuckThreshold,
	}
}

// Start begins the worker loop
func (w *SummarizationWorker) Start() {
	ticker := time.NewTicker(w.interval)
	defer ticker.Stop()

	for range ticker.C {
		w.processStuckSessions()
	}
}

// processStuckSessions finds and processes sessions stuck in NORMALIZED status
func (w *SummarizationWorker) processStuckSessions() {
	cutoffTime := time.Now().Add(-w.stuckThreshold)

	// Find sessions that are NORMALIZED but haven't been updated recently
	sessions, err := w.repo.FindStuckSessions(models.StatusNormalized, cutoffTime)
	if err != nil {
		fmt.Printf("SummarizationWorker: Error finding stuck sessions: %v\n", err)
		return
	}

	if len(sessions) == 0 {
		return
	}

	fmt.Printf("SummarizationWorker: Found %d stuck NORMALIZED sessions\n", len(sessions))

	for _, session := range sessions {
		// Skip if already has summary
		if session.Summary != nil && *session.Summary != "" {
			continue
		}

		fmt.Printf("SummarizationWorker: Processing session %d\n", session.ID)

		if err := w.summarizerService.ProcessSummarization(session.ID); err != nil {
			fmt.Printf("SummarizationWorker: Failed to summarize session %d: %v\n", session.ID, err)
		}
	}
}
