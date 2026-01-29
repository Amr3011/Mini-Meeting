package routes

import (
	"mini-meeting/internal/handlers"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App, userHandler *handlers.UserHandler) {
	// API routes
	api := app.Group("/api/v1")

	// User routes
	users := api.Group("/users")
	users.Post("/", userHandler.CreateUser)
	users.Get("/", userHandler.GetAllUsers)
	users.Get("/:id", userHandler.GetUser)
	users.Patch("/:id", userHandler.UpdateUser)
	users.Delete("/:id", userHandler.DeleteUser)
}
