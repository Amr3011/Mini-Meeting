package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"mini-meeting/internal/config"
	"net/http"
	"time"
)

const brevoAPIURL = "https://api.brevo.com/v3/smtp/email"

// EmailService handles sending transactional emails via Brevo REST API.
type EmailService struct {
	cfg        *config.BrevoConfig
	httpClient *http.Client
}

// NewEmailService creates a new EmailService instance.
func NewEmailService(cfg *config.Config) *EmailService {
	return &EmailService{
		cfg: &cfg.Brevo,
		httpClient: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

// brevoEmailRequest mirrors the Brevo transactional email API payload.
type brevoEmailRequest struct {
	Sender      brevoContact   `json:"sender"`
	To          []brevoContact `json:"to"`
	Subject     string         `json:"subject"`
	HTMLContent string         `json:"htmlContent"`
	TextContent string         `json:"textContent"`
}

type brevoContact struct {
	Email string `json:"email"`
	Name  string `json:"name,omitempty"`
}

// SendSessionReadyEmail sends a "your session is ready" notification to the user.
func (s *EmailService) SendSessionReadyEmail(toEmail, toName string, sessionID uint) error {
	if s.cfg.APIKey == "" {
		return fmt.Errorf("Brevo API key is not configured")
	}

	sessionURL := fmt.Sprintf("https://mini-meeting.vercel.app/sessions/%d", sessionID)

	htmlBody := fmt.Sprintf(`<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 32px;">
  <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 32px;">
    <h2 style="color: #1a1a2e; margin-top: 0;">Your meeting summary is ready 🎉</h2>
    <p style="color: #444; line-height: 1.6;">
      Hi %s,<br><br>
      Your meeting session has been fully processed. The transcript and AI-generated summary are now available.
    </p>
    <a href="%s"
       style="display: inline-block; margin-top: 16px; padding: 12px 24px;
              background: #6c63ff; color: #ffffff; text-decoration: none;
              border-radius: 6px; font-weight: bold;">
      View Session
    </a>
    <p style="color: #888; font-size: 12px; margin-top: 32px;">
      Or copy this link: %s
    </p>
  </div>
</body>
</html>`, toName, sessionURL, sessionURL)

	textBody := fmt.Sprintf(
		"Hi %s,\n\nYour meeting session is ready. View it here:\n%s\n\nMini Meeting",
		toName, sessionURL,
	)

	payload := brevoEmailRequest{
		Sender: brevoContact{
			Email: s.cfg.SenderEmail,
			Name:  s.cfg.SenderName,
		},
		To: []brevoContact{
			{Email: toEmail, Name: toName},
		},
		Subject:     "Your meeting summary is ready 🎉",
		HTMLContent: htmlBody,
		TextContent: textBody,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal email payload: %w", err)
	}

	req, err := http.NewRequest(http.MethodPost, brevoAPIURL, bytes.NewBuffer(body))
	if err != nil {
		return fmt.Errorf("failed to create HTTP request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("api-key", s.cfg.APIKey)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("failed to send request to Brevo: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("Brevo API returned status %d: %s", resp.StatusCode, string(respBody))
	}

	fmt.Printf("EmailService: session-ready email sent to %s for session %d\n", toEmail, sessionID)
	return nil
}
