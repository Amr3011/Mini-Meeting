package utils

import (
	"bytes"
	"embed"
	"fmt"
	"html/template"
	"math/rand"
	"net/smtp"
	"time"

	"mini-meeting/internal/config"
)

//go:embed templates/*.html
var templateFS embed.FS

type EmailService struct {
	config    *config.EmailConfig
	templates *template.Template
}

func NewEmailService(cfg *config.EmailConfig) *EmailService {
	// Load all email templates
	templates := template.Must(template.ParseFS(templateFS, "templates/*.html"))

	return &EmailService{
		config:    cfg,
		templates: templates,
	}
}

// GenerateVerificationCode generates a 6-digit verification code
func GenerateVerificationCode() string {
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	code := r.Intn(900000) + 100000 // Generates a number between 100000 and 999999
	return fmt.Sprintf("%d", code)
}

// SendVerificationEmail sends a verification code to the user's email
func (e *EmailService) SendVerificationEmail(to, code string) error {
	subject := "Email Verification Code"

	var body bytes.Buffer
	data := map[string]string{"Code": code}

	if err := e.templates.ExecuteTemplate(&body, "verification_email.html", data); err != nil {
		return fmt.Errorf("failed to execute template: %w", err)
	}

	return e.sendEmail(to, subject, body.String())
}

// SendPasswordResetEmail sends a password reset code to the user's email
func (e *EmailService) SendPasswordResetEmail(to, code string) error {
	subject := "Password Reset Code"
	var body bytes.Buffer
	data := map[string]string{"Code": code}
	if err := e.templates.ExecuteTemplate(&body, "reset_password_email.html", data); err != nil {
		return fmt.Errorf("failed to execute template: %w", err)
	}
	return e.sendEmail(to, subject, body.String())
}

func (e *EmailService) sendEmail(to, subject, body string) error {
	// Setup authentication
	auth := smtp.PlainAuth("", e.config.User, e.config.Password, e.config.Host)

	// Compose message
	message := []byte(
		"From: " + e.config.From + "\r\n" +
			"To: " + to + "\r\n" +
			"Subject: " + subject + "\r\n" +
			"MIME-version: 1.0;\r\n" +
			"Content-Type: text/html; charset=\"UTF-8\";\r\n" +
			"\r\n" +
			body + "\r\n")

	// Send email
	addr := fmt.Sprintf("%s:%s", e.config.Host, e.config.Port)
	err := smtp.SendMail(addr, auth, e.config.From, []string{to}, message)
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	return nil
}
