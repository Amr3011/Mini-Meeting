package routes

import (
	"mini-meeting/internal/config"
	"mini-meeting/internal/handlers"
	"mini-meeting/internal/middleware"

	"github.com/gofiber/fiber/v2"
)

func setupLiveKitRoutes(api fiber.Router, livekitHandler *handlers.LiveKitHandler, cfg *config.Config) {
	// Public — needed for guests joining a meeting
	publicLiveKit := api.Group("/livekit")
	publicLiveKit.Post("/token", livekitHandler.GenerateToken)
	publicLiveKit.Get("/participants/count", livekitHandler.GetParticipantCount)

	// Protected — host/admin controls
	livekit := api.Group("/livekit", middleware.AuthMiddleware(cfg))
	livekit.Get("/participants", livekitHandler.ListParticipants)
	livekit.Post("/remove-participant", livekitHandler.RemoveParticipant)
	livekit.Post("/mute-participant", livekitHandler.MuteParticipant)
	livekit.Post("/end-meeting", livekitHandler.EndMeeting)
}
