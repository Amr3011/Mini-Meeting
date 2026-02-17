package main

import (
	"fmt"
	"log"
	"time"

	"mini-meeting/internal/config"
	"mini-meeting/internal/database"
	"mini-meeting/internal/handlers"
	"mini-meeting/internal/repositories"
	"mini-meeting/internal/routes"
	"mini-meeting/internal/services"
	"mini-meeting/internal/workers"
	"mini-meeting/pkg/cache"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Connect to database
	if err := database.Connect(&cfg.Database); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Connect to Redis
	if err := cache.Connect(&cfg.Redis); err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}
	defer cache.Close()

	// Run migrations
	if err := database.Migrate(); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Initialize Fiber app
	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{
				"error": err.Error(),
			})
		},
	})

	// Middleware
	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(cors.New())

	// Initialize repositories
	userRepo := repositories.NewUserRepository(database.GetDB())
	meetingRepo := repositories.NewMeetingRepository(database.GetDB())
	summarizerRepo := repositories.NewSummarizerRepository(database.GetDB())

	// Initialize services
	userService := services.NewUserService(userRepo, meetingRepo)
	meetingService := services.NewMeetingService(meetingRepo)
	livekitService := services.NewLiveKitService(cfg)
	transcriptionService := services.NewTranscriptionService(summarizerRepo, cfg)
	summarizerService := services.NewSummarizerService(summarizerRepo, meetingRepo, livekitService, transcriptionService, cfg)

	// Initialize handlers
	userHandler := handlers.NewUserHandler(userService)
	authHandler := handlers.NewAuthHandler(userService, cfg)
	meetingHandler := handlers.NewMeetingHandler(meetingService, cfg)
	livekitHandler := handlers.NewLiveKitHandler(livekitService, meetingService, userService, summarizerService, cfg)
	lobbyHandler := handlers.NewLobbyHandler(livekitService, meetingService, userService, cfg)
	lobbyWSHandler := handlers.NewLobbyWSHandler(livekitService, meetingService, userService, cfg)
	summarizerHandler := handlers.NewSummarizerHandler(summarizerService)

	// Initialize workers
	// Run cleanup/safety net every 60 minutes
	transcriptionWorker := workers.NewTranscriptionWorker(summarizerRepo, transcriptionService, 60*time.Minute)
	transcriptionWorker.Start()

	// Setup routes
	routes.SetupRoutes(app, userHandler, authHandler, meetingHandler, livekitHandler, lobbyHandler, lobbyWSHandler, summarizerHandler, cfg)

	// Health check route
	app.Get("/api/v1/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"message": "Server is running",
		})
	})

	// Start server
	addr := fmt.Sprintf(":%s", cfg.Server.Port)
	log.Printf("Server starting on port %s...", cfg.Server.Port)
	if err := app.Listen(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
