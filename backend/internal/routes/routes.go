package routes

import (
	"mini-meeting/internal/config"
	"mini-meeting/internal/handlers"
	"mini-meeting/internal/middleware"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App, userHandler *handlers.UserHandler, authHandler *handlers.AuthHandler, meetingHandler *handlers.MeetingHandler, livekitHandler *handlers.LiveKitHandler, cfg *config.Config) {
	// API routes
	api := app.Group("/api/v1")

	// Auth routes (public) - OAuth only
	auth := api.Group("/auth")
	auth.Get("/:provider", authHandler.OAuthLogin)
	auth.Get("/:provider/callback", authHandler.OAuthCallback)

	// User routes (protected)
	users := api.Group("/users", middleware.AuthMiddleware(cfg))
	users.Get("/me", userHandler.GetMe)
	users.Patch("/me", userHandler.UpdateMe)

	// Admin-only routes
	users.Get("/", middleware.AdminMiddleware(), userHandler.GetAllUsers)
	users.Get("/:id", middleware.AdminMiddleware(), userHandler.GetUser)
	users.Delete("/:id", middleware.AdminMiddleware(), userHandler.DeleteUser)

	// Public meeting routes (accessible to guests)
	publicMeetings := api.Group("/meetings")
	publicMeetings.Get("/code/:code", meetingHandler.GetMeetingByCode)

	// Protected meeting routes (require authentication)
	meetings := api.Group("/meetings", middleware.AuthMiddleware(cfg))
	meetings.Post("/", meetingHandler.CreateMeeting)
	meetings.Get("/my", meetingHandler.GetMyMeetings)
	meetings.Get("/:id", meetingHandler.GetMeeting)
	meetings.Delete("/:id", meetingHandler.DeleteMeeting)

	// Admin-only meeting routes
	meetings.Get("/", middleware.AdminMiddleware(), meetingHandler.GetAllMeetings)

	// Public LiveKit routes (accessible to guests for joining meetings)
	publicLiveKit := api.Group("/livekit")
	publicLiveKit.Post("/token", livekitHandler.GenerateToken)

	// Protected LiveKit routes (require authentication)
	livekit := api.Group("/livekit", middleware.AuthMiddleware(cfg))
	livekit.Get("/participants", livekitHandler.ListParticipants)
	livekit.Post("/remove-participant", livekitHandler.RemoveParticipant)
}
