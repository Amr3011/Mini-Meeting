package routes

import (
	"mini-meeting/internal/config"
	"mini-meeting/internal/handlers"
	"mini-meeting/internal/middleware"

	"github.com/gofiber/fiber/v2"
)

func setupMeetingRoutes(
	api fiber.Router,
	meetingHandler *handlers.MeetingHandler,
	summarizerHandler *handlers.SummarizerHandler,
	cfg *config.Config,
) {
	// Public — guest accessible
	publicMeetings := api.Group("/meetings")
	publicMeetings.Get("/code/:code", meetingHandler.GetMeetingByCode)

	// Protected meeting routes
	meetings := api.Group("/meetings", middleware.AuthMiddleware(cfg))
	meetings.Post("/", meetingHandler.CreateMeeting)
	meetings.Get("/my", meetingHandler.GetMyMeetings)
	meetings.Get("/:id", meetingHandler.GetMeeting)
	meetings.Delete("/:id", meetingHandler.DeleteMeeting)

	// Summarizer sub-routes (under meetings)
	meetings.Post("/:id/summarizer/start", summarizerHandler.StartSummarizer)
	meetings.Post("/:id/summarizer/stop", summarizerHandler.StopSummarizer)

	// Admin-only
	meetings.Get("/", middleware.AdminMiddleware(), meetingHandler.GetAllMeetings)

	// Session management routes (authenticated)
	sessions := api.Group("/sessions", middleware.AuthMiddleware(cfg))
	sessions.Get("/", summarizerHandler.GetSessions)
	sessions.Get("/:id", summarizerHandler.GetSession)
	sessions.Delete("/:id", summarizerHandler.DeleteSession)
}
