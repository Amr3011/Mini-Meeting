package handlers

import (
	"mini-meeting/internal/config"
	"mini-meeting/internal/models"
	"mini-meeting/internal/services"
	"mini-meeting/pkg/utils"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	userService *services.UserService
	config      *config.Config
}

func NewAuthHandler(userService *services.UserService, cfg *config.Config) *AuthHandler {
	return &AuthHandler{
		userService: userService,
		config:      cfg,
	}
}

// Register creates a new user account
// POST /api/v1/auth/register
func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var req models.RegisterRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Check if email already exists
	existingUser, err := h.userService.GetUserByEmail(req.Email)
	if err == nil && existingUser != nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": "Email already exists",
		})
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to hash password",
		})
	}

	// Create user
	createReq := &models.CreateUserRequest{
		Email:    req.Email,
		Password: string(hashedPassword),
		Name:     req.Name,
	}

	user, err := h.userService.CreateUser(createReq)
	if err != nil {
		if err.Error() == "email already exists" {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{
				"error": "Email already exists",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// Generate JWT token
	token, err := utils.GenerateToken(user.ID, user.Email, h.config.JWT.Secret, h.config.JWT.Expiration)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate token",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "User registered successfully",
		"data": models.AuthResponse{
			Token: token,
			User:  *user,
		},
	})
}

// Login authenticates a user and returns a JWT token
// POST /api/v1/auth/login
func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req models.LoginRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Get user by email
	user, err := h.userService.GetUserByEmail(req.Email)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid email or password",
		})
	}

	// Compare passwords
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid email or password",
		})
	}

	// Generate JWT token
	token, err := utils.GenerateToken(user.ID, user.Email, h.config.JWT.Secret, h.config.JWT.Expiration)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate token",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Login successful",
		"data": models.AuthResponse{
			Token: token,
			User:  *user,
		},
	})
}
