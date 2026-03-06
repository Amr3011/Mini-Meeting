package routes

import (
	"mini-meeting/internal/config"
	"mini-meeting/internal/handlers"
	"mini-meeting/internal/middleware"

	"github.com/gofiber/fiber/v2"
)

func setupUserRoutes(api fiber.Router, userHandler *handlers.UserHandler, cfg *config.Config) {
	users := api.Group("/users", middleware.AuthMiddleware(cfg))

	// Self-service routes
	users.Get("/me", userHandler.GetMe)
	users.Patch("/me", userHandler.UpdateMe)

	// Admin-only routes
	users.Get("/", middleware.AdminMiddleware(), userHandler.GetAllUsers)
	users.Get("/:id", middleware.AdminMiddleware(), userHandler.GetUser)
	users.Delete("/:id", middleware.AdminMiddleware(), userHandler.DeleteUser)
}
