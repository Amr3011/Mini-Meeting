package services

import (
	"bytes"
	"context"
	_ "embed"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"mini-meeting/internal/config"

	"github.com/tiktoken-go/tokenizer"
)

//go:embed prompts/meeting_summary_system.md
var systemPromptTemplate string

const (
	// MaxTokensPerRequest is the maximum tokens to send in a single request
	MaxTokensPerRequest = 8000
)

// OpenRouterService handles interactions with OpenRouter API for LLM-based summarization
type OpenRouterService struct {
	config     *config.OpenRouterConfig
	httpClient *http.Client
	tokenizer  tokenizer.Codec
}

// NewOpenRouterService creates a new OpenRouter service instance
func NewOpenRouterService(cfg *config.Config) *OpenRouterService {
	timeout, err := time.ParseDuration(cfg.OpenRouter.Timeout)
	if err != nil {
		timeout = 300 * time.Second // Default to 300 seconds (5 minutes) for free models
	}

	fmt.Printf("OpenRouter service initialized with timeout: %v, model: %s\n", timeout, cfg.OpenRouter.Model)

	// Initialize tokenizer (using cl100k_base encoding which works for most models)
	codec, err := tokenizer.Get(tokenizer.Cl100kBase)
	if err != nil {
		fmt.Printf("Warning: Failed to initialize tokenizer: %v\n", err)
	}

	return &OpenRouterService{
		config: &cfg.OpenRouter,
		httpClient: &http.Client{
			Timeout: timeout,
		},
		tokenizer: codec,
	}
}

// ChatMessage represents a message in the chat completion request
type ChatMessage struct {
	Role    string `json:"role"`    // "system", "user", or "assistant"
	Content string `json:"content"` // The message content
}

// ChatCompletionRequest represents the request to OpenRouter's chat completion API
type ChatCompletionRequest struct {
	Model       string        `json:"model"`
	Messages    []ChatMessage `json:"messages"`
	MaxTokens   int           `json:"max_tokens,omitempty"`
	Temperature float64       `json:"temperature,omitempty"`
}

// ChatCompletionResponse represents the response from OpenRouter's chat completion API
type ChatCompletionResponse struct {
	ID      string `json:"id"`
	Model   string `json:"model"`
	Choices []struct {
		Message ChatMessage `json:"message"`
		Index   int         `json:"index"`
	} `json:"choices"`
	Usage struct {
		PromptTokens     int `json:"prompt_tokens"`
		CompletionTokens int `json:"completion_tokens"`
		TotalTokens      int `json:"total_tokens"`
	} `json:"usage"`
}

// GenerateSummary generates a structured meeting summary from a transcript using OpenRouter
func (s *OpenRouterService) GenerateSummary(ctx context.Context, req SummarizationRequest) (*SummarizationResponse, error) {
	if s.config.APIKey == "" {
		return nil, fmt.Errorf("OpenRouter API key is not configured")
	}

	// Count tokens in the transcript
	tokenCount := s.countTokens(req.Transcript)
	fmt.Printf("Transcript token count: %d\n", tokenCount)

	// If transcript is too large, use chunking strategy
	if tokenCount > MaxTokensPerRequest {
		fmt.Printf("Transcript exceeds %d tokens, using chunking strategy\n", MaxTokensPerRequest)
		return s.ChunkAndSummarize(ctx, req.Transcript, req.Temperature)
	}

	// Otherwise, process normally
	return s.generateSummaryWithRetry(ctx, req)
}

// generateSummaryWithRetry handles retry logic for rate limiting
func (s *OpenRouterService) generateSummaryWithRetry(ctx context.Context, req SummarizationRequest) (*SummarizationResponse, error) {

	// Retry logic for rate limiting
	maxRetries := 3
	var lastErr error

	for attempt := 0; attempt < maxRetries; attempt++ {
		if attempt > 0 {
			// Exponential backoff: 5s, 15s, 30s
			backoff := time.Duration(5*(1<<uint(attempt-1))) * time.Second
			fmt.Printf("Rate limited, retrying in %v (attempt %d/%d)...\n", backoff, attempt+1, maxRetries)
			time.Sleep(backoff)
		}

		resp, err := s.attemptSummarization(ctx, req)
		if err == nil {
			return resp, nil
		}

		lastErr = err

		// Check if it's a rate limit error (429)
		if !isRateLimitError(err) {
			// Not a rate limit error, don't retry
			return nil, err
		}

		fmt.Printf("Rate limit error: %v\n", err)
	}

	return nil, fmt.Errorf("failed after %d retries: %w", maxRetries, lastErr)
}

// attemptSummarization makes a single attempt to generate a summary
func (s *OpenRouterService) attemptSummarization(ctx context.Context, req SummarizationRequest) (*SummarizationResponse, error) {

	// Build the prompt with structured instructions from the embedded template
	systemPrompt := systemPromptTemplate

	userPrompt := fmt.Sprintf("Please summarize the following meeting transcript:\n\n%s", req.Transcript)

	// Set default temperature if not provided
	temperature := req.Temperature
	if temperature == 0 {
		temperature = 0.3 // Lower temperature for more focused, consistent summaries
	}

	// Build the chat completion request
	chatReq := ChatCompletionRequest{
		Model: s.config.Model,
		Messages: []ChatMessage{
			{Role: "system", Content: systemPrompt},
			{Role: "user", Content: userPrompt},
		},
		MaxTokens:   s.config.MaxTokens,
		Temperature: temperature,
	}

	// Marshal request to JSON
	reqBody, err := json.Marshal(chatReq)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal request: %w", err)
	}

	// Create HTTP request
	endpoint := fmt.Sprintf("%s/chat/completions", s.config.BaseURL)
	httpReq, err := http.NewRequestWithContext(ctx, "POST", endpoint, bytes.NewBuffer(reqBody))
	if err != nil {
		return nil, fmt.Errorf("failed to create HTTP request: %w", err)
	}

	// Set headers
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Authorization", fmt.Sprintf("Bearer %s", s.config.APIKey))

	// Send request with timing
	fmt.Printf("Sending request to OpenRouter (model: %s, timeout: %v)...\n", s.config.Model, s.httpClient.Timeout)
	startTime := time.Now()

	resp, err := s.httpClient.Do(httpReq)
	if err != nil {
		elapsed := time.Since(startTime)
		return nil, fmt.Errorf("failed to send request to OpenRouter after %v: %w", elapsed, err)
	}
	defer resp.Body.Close()

	elapsed := time.Since(startTime)
	fmt.Printf("Received response from OpenRouter in %v (status: %d)\n", elapsed, resp.StatusCode)

	// Read response body
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	// Check for HTTP errors
	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("OpenRouter API returned status %d: %s", resp.StatusCode, string(respBody))
	}

	// Parse response
	var chatResp ChatCompletionResponse
	if err := json.Unmarshal(respBody, &chatResp); err != nil {
		return nil, fmt.Errorf("failed to unmarshal response: %w", err)
	}

	// Validate response
	if len(chatResp.Choices) == 0 {
		return nil, fmt.Errorf("no choices returned in response")
	}

	// Build and return the summarization response
	return &SummarizationResponse{
		Summary:      chatResp.Choices[0].Message.Content,
		ModelUsed:    chatResp.Model,
		PromptTokens: chatResp.Usage.PromptTokens,
		OutputTokens: chatResp.Usage.CompletionTokens,
		TotalTokens:  chatResp.Usage.TotalTokens,
	}, nil
}

// GenerateMultipleSummaries generates multiple types of summaries (executive, technical, action list)
// This is a more advanced feature that can be implemented later
func (s *OpenRouterService) GenerateMultipleSummaries(ctx context.Context, transcript string) (map[string]string, error) {
	// TODO: Implement multiple summary generation
	// This could generate:
	// - Executive summary (high-level overview)
	// - Technical summary (detailed technical discussion)
	// - Action list (just the action items)
	return nil, fmt.Errorf("not implemented yet")
}

// ChunkAndSummarize handles large transcripts by chunking them and generating summaries
func (s *OpenRouterService) ChunkAndSummarize(ctx context.Context, transcript string, temperature float64) (*SummarizationResponse, error) {
	fmt.Printf("Starting chunked summarization for large transcript\n")

	// Split transcript into chunks
	chunks := s.splitIntoChunks(transcript, MaxTokensPerRequest)
	fmt.Printf("Split transcript into %d chunks\n", len(chunks))

	// Summarize each chunk
	chunkSummaries := make([]string, 0, len(chunks))
	totalPromptTokens := 0
	totalOutputTokens := 0
	modelUsed := ""

	for i, chunk := range chunks {
		fmt.Printf("Summarizing chunk %d/%d...\n", i+1, len(chunks))

		req := SummarizationRequest{
			Transcript:  chunk,
			Temperature: temperature,
		}

		resp, err := s.generateSummaryWithRetry(ctx, req)
		if err != nil {
			return nil, fmt.Errorf("failed to summarize chunk %d: %w", i+1, err)
		}

		chunkSummaries = append(chunkSummaries, resp.Summary)
		totalPromptTokens += resp.PromptTokens
		totalOutputTokens += resp.OutputTokens
		modelUsed = resp.ModelUsed
	}

	// If we only had one chunk, return it directly
	if len(chunkSummaries) == 1 {
		return &SummarizationResponse{
			Summary:      chunkSummaries[0],
			ModelUsed:    modelUsed,
			PromptTokens: totalPromptTokens,
			OutputTokens: totalOutputTokens,
			TotalTokens:  totalPromptTokens + totalOutputTokens,
		}, nil
	}

	// Combine chunk summaries into a final summary
	fmt.Printf("Creating final summary from %d chunk summaries\n", len(chunkSummaries))
	combinedSummaries := strings.Join(chunkSummaries, "\n\n---\n\n")

	finalReq := SummarizationRequest{
		Transcript:  "Please create a comprehensive summary by combining these section summaries:\n\n" + combinedSummaries,
		Temperature: temperature,
	}

	finalResp, err := s.generateSummaryWithRetry(ctx, finalReq)
	if err != nil {
		return nil, fmt.Errorf("failed to create final summary: %w", err)
	}

	return &SummarizationResponse{
		Summary:      finalResp.Summary,
		ModelUsed:    modelUsed,
		PromptTokens: totalPromptTokens + finalResp.PromptTokens,
		OutputTokens: totalOutputTokens + finalResp.OutputTokens,
		TotalTokens:  totalPromptTokens + totalOutputTokens + finalResp.TotalTokens,
	}, nil
}

// countTokens counts the number of tokens in a text
func (s *OpenRouterService) countTokens(text string) int {
	if s.tokenizer == nil {
		// Fallback: rough estimate (1 token ≈ 4 characters)
		return len(text) / 4
	}

	_, tokens, _ := s.tokenizer.Encode(text)
	return len(tokens)
}

// splitIntoChunks splits a transcript into chunks based on token count
func (s *OpenRouterService) splitIntoChunks(transcript string, maxTokens int) []string {
	// Split by paragraphs first (double newline)
	paragraphs := strings.Split(transcript, "\n\n")

	chunks := make([]string, 0)
	currentChunk := ""
	currentTokens := 0

	for _, para := range paragraphs {
		paraTokens := s.countTokens(para)

		// If single paragraph exceeds max, split by sentences
		if paraTokens > maxTokens {
			// Split by sentences (looking for speaker labels like "[00:00:00] Name:")
			lines := strings.Split(para, "\n")
			for _, line := range lines {
				lineTokens := s.countTokens(line)

				if currentTokens+lineTokens > maxTokens && currentChunk != "" {
					// Save current chunk and start new one
					chunks = append(chunks, strings.TrimSpace(currentChunk))
					currentChunk = line
					currentTokens = lineTokens
				} else {
					if currentChunk != "" {
						currentChunk += "\n"
					}
					currentChunk += line
					currentTokens += lineTokens
				}
			}
		} else if currentTokens+paraTokens > maxTokens {
			// Save current chunk and start new one
			if currentChunk != "" {
				chunks = append(chunks, strings.TrimSpace(currentChunk))
			}
			currentChunk = para
			currentTokens = paraTokens
		} else {
			// Add to current chunk
			if currentChunk != "" {
				currentChunk += "\n\n"
			}
			currentChunk += para
			currentTokens += paraTokens
		}
	}

	// Add the last chunk
	if currentChunk != "" {
		chunks = append(chunks, strings.TrimSpace(currentChunk))
	}

	return chunks
}

// isRateLimitError checks if an error is a rate limit error (429)
func isRateLimitError(err error) bool {
	if err == nil {
		return false
	}
	errMsg := err.Error()
	// Check for status 429 or rate limit keywords
	return stringContains(errMsg, "status 429") ||
		stringContains(errMsg, "rate-limited") ||
		stringContains(errMsg, "rate limit")
}

// stringContains is a simple helper to check if a string contains a substring
func stringContains(s, substr string) bool {
	return len(s) >= len(substr) && indexOfSubstring(s, substr) >= 0
}

func indexOfSubstring(s, substr string) int {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return i
		}
	}
	return -1
}
