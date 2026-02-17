package routes

import (
	"mini-meeting/internal/config"
	"mini-meeting/internal/handlers"
	"mini-meeting/internal/middleware"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App, userHandler *handlers.UserHandler, authHandler *handlers.AuthHandler, meetingHandler *handlers.MeetingHandler, livekitHandler *handlers.LiveKitHandler, lobbyHandler *handlers.LobbyHandler, lobbyWSHandler *handlers.LobbyWSHandler, summarizerHandler *handlers.SummarizerHandler, cfg *config.Config) {
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

	// Summarizer routes (protected)
	meetings.Post("/:id/summarizer/start", summarizerHandler.StartSummarizer)
	meetings.Post("/:id/summarizer/stop", summarizerHandler.StopSummarizer)

	// Admin-only meeting routes
	meetings.Get("/", middleware.AdminMiddleware(), meetingHandler.GetAllMeetings)

	// Public LiveKit routes (accessible to guests for joining meetings)
	publicLiveKit := api.Group("/livekit")
	publicLiveKit.Post("/token", livekitHandler.GenerateToken)

	// Protected LiveKit routes (require authentication)
	livekit := api.Group("/livekit", middleware.AuthMiddleware(cfg))
	livekit.Get("/participants", livekitHandler.ListParticipants)
	livekit.Post("/remove-participant", livekitHandler.RemoveParticipant)
	livekit.Post("/mute-participant", livekitHandler.MuteParticipant)
	livekit.Post("/end-meeting", livekitHandler.EndMeeting)

	// Public lobby routes (HTTP — request to join + cancel)
	publicLobby := api.Group("/lobby")
	publicLobby.Post("/request", lobbyHandler.RequestToJoin)
	publicLobby.Delete("/request", lobbyHandler.CancelRequest)

	// Protected lobby routes (admin only — approve/reject via HTTP fallback)
	lobby := api.Group("/lobby", middleware.AuthMiddleware(cfg))
	lobby.Post("/respond", lobbyHandler.RespondToRequest)

	// WebSocket lobby routes
	app.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})
	app.Get("/ws/lobby/visitor", websocket.New(lobbyWSHandler.HandleVisitor))
	app.Get("/ws/lobby/admin", websocket.New(lobbyWSHandler.HandleAdmin))
}
