package services

import (
	"context"
	"fmt"
	"mini-meeting/internal/config"
	"mini-meeting/internal/models"
	"mini-meeting/internal/repositories"
	"time"
)

// SummarizationRequest represents the payload for OpenRouter summarization
type SummarizationRequest struct {
	Transcript  string  `json:"transcript"`
	Temperature float64 `json:"temperature"`
}

// SummarizationResponse represents the response from OpenRouter summarization
type SummarizationResponse struct {
	Summary      string `json:"summary"`
	ModelUsed    string `json:"model_used"`
	PromptTokens int    `json:"prompt_tokens"`
	OutputTokens int    `json:"output_tokens"`
	TotalTokens  int    `json:"total_tokens"`
}

type SummarizationService struct {
	repo              *repositories.SummarizerRepository
	userRepo          *repositories.UserRepository
	openRouterService *OpenRouterService
	emailService      *EmailService
	cfg               *config.Config
}

func NewSummarizationService(
	repo *repositories.SummarizerRepository,
	userRepo *repositories.UserRepository,
	openRouterService *OpenRouterService,
	emailService *EmailService,
	cfg *config.Config,
) *SummarizationService {
	return &SummarizationService{
		repo:              repo,
		userRepo:          userRepo,
		openRouterService: openRouterService,
		emailService:      emailService,
		cfg:               cfg,
	}
}

// ProcessSummarization generates an AI-powered summary from a normalized transcript
func (s *SummarizationService) ProcessSummarization(sessionID uint) error {
	// 1. Get session and validate status
	session, err := s.repo.FindSessionByID(sessionID)
	if err != nil {
		return fmt.Errorf("failed to get session: %w", err)
	}

	if session.Status != models.StatusNormalized {
		// If already summarized, that's fine
		if session.Summary != nil && *session.Summary != "" {
			return nil
		}
		return fmt.Errorf("session is not in NORMALIZED state (current: %s)", session.Status)
	}

	// 2. Get the normalized transcript
	if session.Transcript == nil || *session.Transcript == "" {
		return fmt.Errorf("no normalized transcript found for session %d", sessionID)
	}

	transcript := *session.Transcript

	fmt.Printf("Starting summarization for session %d (transcript length: %d chars)\n", sessionID, len(transcript))

	// 3. Call OpenRouter to generate summary
	ctx := context.Background()
	req := SummarizationRequest{
		Transcript:  transcript,
		Temperature: 0.3, // Lower temperature for more focused, consistent summaries
	}

	resp, err := s.openRouterService.GenerateSummary(ctx, req)
	if err != nil {
		// Update session with error
		errMsg := fmt.Sprintf("Failed to generate summary: %v", err)
		s.repo.UpdateSessionStatus(sessionID, models.StatusNormalized, &errMsg, nil)
		return fmt.Errorf("failed to generate summary: %w", err)
	}

	fmt.Printf("Summary generated for session %d (model: %s, tokens: %d)\n",
		sessionID, resp.ModelUsed, resp.TotalTokens)

	// 4. Update session status to SUMMARIZED
	now := time.Now()
	if err := s.repo.UpdateSessionStatus(sessionID, models.StatusSummarized, nil, &now); err != nil {
		return fmt.Errorf("failed to update session status: %w", err)
	}

	// 5. Save the summary to the session
	if err := s.repo.UpdateSessionSummary(sessionID, resp.Summary); err != nil {
		return fmt.Errorf("failed to update session summary: %w", err)
	}

	fmt.Printf("Successfully summarized session %d (summary length: %d chars)\n",
		sessionID, len(resp.Summary))

	// 6. Fire email notification (non-blocking)
	go func() {
		user, err := s.userRepo.FindByID(session.UserID)
		if err != nil {
			fmt.Printf("EmailNotification: failed to fetch user for session %d: %v\n", sessionID, err)
			return
		}
		if err := s.emailService.SendSessionReadyEmail(user.Email, user.Name, sessionID); err != nil {
			fmt.Printf("EmailNotification: failed to send email for session %d: %v\n", sessionID, err)
		}
	}()

	return nil
}
