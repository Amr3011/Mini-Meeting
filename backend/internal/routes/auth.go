package routes

import (
	"mini-meeting/internal/handlers"

	"github.com/gofiber/fiber/v2"
)

func setupAuthRoutes(api fiber.Router, authHandler *handlers.AuthHandler) {
	auth := api.Group("/auth")
	auth.Get("/:provider", authHandler.OAuthLogin)
	auth.Get("/:provider/callback", authHandler.OAuthCallback)
}
