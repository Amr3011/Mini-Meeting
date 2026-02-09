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
)

type AuthHandler struct {
	userService    *services.UserService
	config         *config.Config
	oauthProviders map[string]oauth.OAuthProvider
}

func NewAuthHandler(userService *services.UserService, cfg *config.Config) *AuthHandler {
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
		oauthProviders: oauthProviders,
	}
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
		if err.Error() == "account_exists_different_provider" {
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
