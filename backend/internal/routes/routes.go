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

	// Auth routes (public)
	auth := api.Group("/auth")
	auth.Post("/register", authHandler.Register)
	auth.Post("/login", authHandler.Login)
	auth.Post("/verify-email", authHandler.VerifyEmail)
	auth.Post("/resend-code", authHandler.ResendVerificationCode)
	auth.Post("/forgot-password", authHandler.ForgotPassword)
	auth.Post("/verify-password-code", authHandler.VerifyPasswordCode)
	auth.Patch("/reset-password", authHandler.ResetPassword)

	// OAuth routes (public)
	auth.Get("/:provider", authHandler.OAuthLogin)
	auth.Get("/:provider/callback", authHandler.OAuthCallback)

	// User routes (protected)
	users := api.Group("/users", middleware.AuthMiddleware(cfg))
	users.Get("/me", userHandler.GetMe)
	users.Patch("/me", userHandler.UpdateMe)

	// Admin-only routes
	users.Post("/", middleware.AdminMiddleware(), userHandler.CreateUser)
	users.Get("/", middleware.AdminMiddleware(), userHandler.GetAllUsers)
	users.Get("/:id", middleware.AdminMiddleware(), userHandler.GetUser)
	users.Patch("/:id", middleware.AdminMiddleware(), userHandler.UpdateUser)
	users.Delete("/:id", middleware.AdminMiddleware(), userHandler.DeleteUser)

	// Meeting routes (protected)
	meetings := api.Group("/meetings", middleware.AuthMiddleware(cfg))
	meetings.Post("/", meetingHandler.CreateMeeting)
	meetings.Get("/my", meetingHandler.GetMyMeetings)
	meetings.Get("/code/:code", meetingHandler.GetMeetingByCode)
	meetings.Get("/:id", meetingHandler.GetMeeting)
	meetings.Delete("/:id", meetingHandler.DeleteMeeting)

	// Admin-only meeting routes
	meetings.Get("/", middleware.AdminMiddleware(), meetingHandler.GetAllMeetings)

	// LiveKit routes (protected)
	livekit := api.Group("/livekit", middleware.AuthMiddleware(cfg))
	livekit.Post("/token", livekitHandler.GenerateToken)
	livekit.Get("/participants", livekitHandler.ListParticipants)
	livekit.Post("/remove-participant", livekitHandler.RemoveParticipant)
}
