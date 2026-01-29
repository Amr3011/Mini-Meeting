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

	// User routes (protected)
	users := api.Group("/users", middleware.AuthMiddleware(cfg))
	users.Post("/", userHandler.CreateUser)
	users.Get("/", userHandler.GetAllUsers)
	users.Get("/:id", userHandler.GetUser)
	users.Patch("/:id", userHandler.UpdateUser)
	users.Delete("/:id", userHandler.DeleteUser)
}
