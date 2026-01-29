package middleware

import (
	"mini-meeting/internal/config"
	"mini-meeting/pkg/utils"
	"strings"

	"github.com/gofiber/fiber/v2"
)

// AuthMiddleware validates JWT tokens and adds user info to context
func AuthMiddleware(cfg *config.Config) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Get Authorization header
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Missing authorization header",
			})
		}

		// Check if it's a Bearer token
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid authorization header format",
			})
		}

		token := parts[1]

		// Validate token
		claims, err := utils.ValidateToken(token, cfg.JWT.Secret)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid or expired token",
			})
		}

		// Add user info to context
		c.Locals("userID", claims.UserID)
		c.Locals("email", claims.Email)

		return c.Next()
	}
}
