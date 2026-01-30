package routes

import (
	"mini-meeting/internal/config"
	"mini-meeting/internal/handlers"
	"mini-meeting/internal/middleware"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App, userHandler *handlers.UserHandler, authHandler *handlers.AuthHandler, cfg *config.Config) {
	// API routes
	api := app.Group("/api/v1")

	// Auth routes (public)
	auth := api.Group("/auth")
	auth.Post("/register", authHandler.Register)
	auth.Post("/login", authHandler.Login)
	auth.Post("/verify-email", authHandler.VerifyEmail)
	auth.Post("/resend-code", authHandler.ResendVerificationCode)
	auth.Post("/forgot-password", authHandler.ForgotPassword)
	auth.Post("/verify-password-code", authHandler.VerifyPasswordCode)
	auth.Patch("/reset-password", authHandler.ResetPassword)

	// User routes (protected)
	users := api.Group("/users", middleware.AuthMiddleware(cfg))
	users.Get("/me", userHandler.GetMe)      // Get current user
	users.Patch("/me", userHandler.UpdateMe) // Update current user

	// Admin-only routes
	users.Post("/", middleware.AdminMiddleware(), userHandler.CreateUser)      // Admin only
	users.Get("/", middleware.AdminMiddleware(), userHandler.GetAllUsers)      // Admin only
	users.Get("/:id", middleware.AdminMiddleware(), userHandler.GetUser)       // Admin only
	users.Patch("/:id", middleware.AdminMiddleware(), userHandler.UpdateUser)  // Admin only
	users.Delete("/:id", middleware.AdminMiddleware(), userHandler.DeleteUser) // Admin only
}
