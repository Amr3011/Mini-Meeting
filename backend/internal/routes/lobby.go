package routes

import (
	"mini-meeting/internal/handlers"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v2"
)

func setupLobbyRoutes(
	app *fiber.App,
	api fiber.Router,
	lobbyHandler *handlers.LobbyHandler,
	lobbyWSHandler *handlers.LobbyWSHandler,
) {
	// Public lobby routes (guests request / cancel)
	publicLobby := api.Group("/lobby")
	publicLobby.Post("/request", lobbyHandler.RequestToJoin)
	publicLobby.Delete("/request", lobbyHandler.CancelRequest)

	// WebSocket upgrade middleware
	app.Use("/ws", func(c *fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})

	// WebSocket lobby routes
	app.Get("/ws/lobby/visitor", websocket.New(lobbyWSHandler.HandleVisitor))
	app.Get("/ws/lobby/admin", websocket.New(lobbyWSHandler.HandleAdmin))
}
