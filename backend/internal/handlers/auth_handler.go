package handlers

import (
	"crypto/rand"
	"encoding/base64"
	"fmt"

	"mini-meeting/internal/cache"
	"mini-meeting/internal/config"
	"mini-meeting/internal/models"
	"mini-meeting/internal/services"
	"mini-meeting/pkg/oauth"
	"mini-meeting/pkg/utils"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	userService    *services.UserService
	config         *config.Config
	emailService   *utils.EmailService
	oauthProviders map[string]oauth.OAuthProvider
}

func NewAuthHandler(userService *services.UserService, cfg *config.Config, emailService *utils.EmailService) *AuthHandler {
	// Initialize OAuth providers
	oauthProviders := make(map[string]oauth.OAuthProvider)

	// Initialize Google provider if configured
	if cfg.OAuth.Google.ClientID != "" {
		googleConfig := oauth.OAuthConfig{
			ClientID:     cfg.OAuth.Google.ClientID,
			ClientSecret: cfg.OAuth.Google.ClientSecret,
			RedirectURL:  cfg.OAuth.Google.RedirectURL,
			Scopes:       []string{"openid", "profile", "email"},
		}
		oauthProviders["google"] = oauth.NewGoogleProvider(googleConfig)
		fmt.Printf("✓ Google OAuth provider initialized\n")
	} else {
		fmt.Printf("⚠ Google OAuth not configured (ClientID empty)\n")
	}

	// Initialize GitHub provider if configured
	if cfg.OAuth.Github.ClientID != "" {
		githubConfig := oauth.OAuthConfig{
			ClientID:     cfg.OAuth.Github.ClientID,
			ClientSecret: cfg.OAuth.Github.ClientSecret,
			RedirectURL:  cfg.OAuth.Github.RedirectURL,
			Scopes:       []string{"user:email"},
		}
		oauthProviders["github"] = oauth.NewGithubProvider(githubConfig)
		fmt.Printf("✓ GitHub OAuth provider initialized\n")
	} else {
		fmt.Printf("⚠ GitHub OAuth not configured (ClientID empty)\n")
	}

	fmt.Printf("Total OAuth providers initialized: %d\n", len(oauthProviders))

	return &AuthHandler{
		userService:    userService,
		config:         cfg,
		emailService:   emailService,
		oauthProviders: oauthProviders,
	}
}

// Register creates a new user account
// POST /api/v1/auth/register
func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var req models.RegisterRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Check if email already exists
	existingUser, err := h.userService.GetUserByEmail(req.Email)
	if err == nil && existingUser != nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": "Email already exists",
		})
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to hash password",
		})
	}

	// Create user
	createReq := &models.CreateUserRequest{
		Email:    req.Email,
		Password: string(hashedPassword),
		Name:     req.Name,
	}

	user, err := h.userService.CreateUser(createReq)
	if err != nil {
		if err.Error() == "email already exists" {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{
				"error": "Email already exists",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Generate and send verification code
	code := utils.GenerateVerificationCode()
	err = h.userService.SetVerificationCode(user.Email, code)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to set verification code",
		})
	}

	err = h.emailService.SendVerificationEmail(user.Email, code)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to send verification email",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Verification code sent successfully",
		"data": fiber.Map{
			"email": user.Email,
		},
	})
}

// Login authenticates a user and returns a JWT token
// POST /api/v1/auth/login
func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req models.LoginRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Get user by email
	user, err := h.userService.GetUserByEmail(req.Email)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid email or password",
		})
	}

	// Check if user has a password (local auth)
	if user.Password == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": fmt.Sprintf("This account is linked with %s. Please use %s login.", user.Provider, user.Provider),
		})
	}

	// Check if email is verified
	if !user.EmailVerified {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "Email not verified. Please verify your email first.",
		})
	}

	// Compare passwords
	err = bcrypt.CompareHashAndPassword([]byte(*user.Password), []byte(req.Password))
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid email or password",
		})
	}

	// Generate JWT token
	token, err := utils.GenerateToken(user.ID, user.Email, user.Role, h.config.JWT.Secret, h.config.JWT.Expiration)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate token",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Login successful",
		"data": models.AuthResponse{
			Token: token,
			User:  *user,
		},
	})
}

// VerifyEmail verifies user's email with the provided code
// POST /api/v1/auth/verify-email
func (h *AuthHandler) VerifyEmail(c *fiber.Ctx) error {
	var req models.VerifyEmailRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	err := h.userService.VerifyEmail(req.Email, req.Code)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Email verified successfully",
	})
}

// ResendVerificationCode resends the verification code to user's email
// POST /api/v1/auth/resend-code
func (h *AuthHandler) ResendVerificationCode(c *fiber.Ctx) error {
	var req models.ResendCodeRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Get user by email
	user, err := h.userService.GetUserByEmail(req.Email)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	if user.EmailVerified {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Email already verified",
		})
	}

	// Generate and send new verification code
	code := utils.GenerateVerificationCode()
	err = h.userService.SetVerificationCode(user.Email, code)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to set verification code",
		})
	}

	err = h.emailService.SendVerificationEmail(user.Email, code)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to send verification email",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Verification code sent successfully",
	})
}

// ForgotPassword initiates password reset by sending a code to user's email
// POST /api/v1/auth/forgot-password
func (h *AuthHandler) ForgotPassword(c *fiber.Ctx) error {
	var req models.ForgotPasswordRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Get user by email
	user, err := h.userService.GetUserByEmail(req.Email)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	// Check if user registered via OAuth (no password to reset)
	if user.Password == nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": fmt.Sprintf("This account is linked with %s. Please use %s login.", user.Provider, user.Provider),
		})
	}

	// Generate and send password reset code
	code := utils.GenerateVerificationCode()
	err = h.userService.SetPasswordResetCode(user.Email, code)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	err = h.emailService.SendPasswordResetEmail(user.Email, code)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to send password reset email",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Password reset code sent successfully",
	})
}

// VerifyPasswordCode verifies the password reset code
// POST /api/v1/auth/verify-password-code
func (h *AuthHandler) VerifyPasswordCode(c *fiber.Ctx) error {
	var req models.VerifyPasswordCodeRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	err := h.userService.VerifyPasswordResetCode(req.Email, req.Code)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Password reset code verified successfully",
	})
}

// ResetPassword resets the user's password with a verified code
// PATCH /api/v1/auth/reset-password
func (h *AuthHandler) ResetPassword(c *fiber.Ctx) error {
	var req models.ResetPasswordRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	err := h.userService.ResetPassword(req.Email, req.Code, req.Password)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Password reset successfully",
	})
}

func (h *AuthHandler) OAuthLogin(c *fiber.Ctx) error {
	// Get provider from route parameter
	provider := c.Params("provider")

	oauthProvider, exists := h.oauthProviders[provider]
	if !exists {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Unsupported OAuth provider",
		})
	}

	// Generate random state for CSRF protection
	state, err := generateRandomState()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate state",
		})
	}

	// Store state in Redis with 5-minute expiration
	err = cache.StoreOAuthState(state, provider)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to store OAuth state",
		})
	}

	// Also set state in cookie for reference
	c.Cookie(&fiber.Cookie{
		Name:     "oauth_state",
		Value:    state,
		HTTPOnly: true,
		Secure:   h.config.Server.Env == "production",
		SameSite: "Lax",
		MaxAge:   300, // 5 minutes
	})

	// Redirect to OAuth provider
	authURL := oauthProvider.GetAuthURL(state)
	return c.Redirect(authURL, fiber.StatusTemporaryRedirect)
}

func (h *AuthHandler) OAuthCallback(c *fiber.Ctx) error {
	// Get provider from route parameter
	provider := c.Params("provider")

	code := c.Query("code")
	state := c.Query("state")

	// Validate state (CSRF protection)
	storedState := c.Cookies("oauth_state")
	if state == "" || state != storedState {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid state parameter",
		})
	}

	// Validate state from Redis
	storedProvider, err := cache.GetOAuthState(state)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "OAuth state expired or invalid",
		})
	}

	// Verify provider matches
	if storedProvider != provider {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Provider mismatch",
		})
	}

	// Clear state from Redis and cookie
	cache.DeleteOAuthState(state)
	c.Cookie(&fiber.Cookie{
		Name:   "oauth_state",
		Value:  "",
		MaxAge: -1,
	})

	oauthProvider, exists := h.oauthProviders[provider]
	if !exists {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Unsupported OAuth provider",
		})
	}

	// Exchange code for token
	token, err := oauthProvider.ExchangeCode(code)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to exchange code for token",
		})
	}

	// Get user info from provider
	oauthUser, err := oauthProvider.GetUserInfo(token.AccessToken)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get user information",
		})
	}

	// Find or create user
	user, err := h.userService.FindOrCreateOAuthUser(
		models.Provider(provider),
		oauthUser.ID,
		oauthUser.Email,
		oauthUser.Name,
		oauthUser.AvatarURL,
	)

	if err != nil {
		// Handle specific error cases
		if err.Error() == "account_exists_local" {
			// Redirect to frontend with error
			return c.Redirect(fmt.Sprintf("%s/auth/oauth-error?error=account_exists_local&email=%s&provider=%s",
				h.config.Server.FrontendURL, oauthUser.Email, provider), fiber.StatusTemporaryRedirect)
		} else if err.Error() == "account_exists_different_provider" {
			return c.Redirect(fmt.Sprintf("%s/auth/oauth-error?error=account_exists_different_provider&email=%s",
				h.config.Server.FrontendURL, oauthUser.Email), fiber.StatusTemporaryRedirect)
		}

		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create or find user",
		})
	}

	// Generate JWT token
	jwtToken, err := utils.GenerateToken(user.ID, user.Email, user.Role, h.config.JWT.Secret, h.config.JWT.Expiration)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate token",
		})
	}

	// Redirect to frontend with token
	return c.Redirect(fmt.Sprintf("%s/auth/oauth-success?token=%s", h.config.Server.FrontendURL, jwtToken),
		fiber.StatusTemporaryRedirect)
}

func generateRandomState() (string, error) {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}
