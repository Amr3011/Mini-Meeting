package types

import "mini-meeting/internal/models"

// UpdateUserRequest represents the request to update user information
type UpdateUserRequest struct {
	Name string `json:"name" validate:"omitempty"`
}

// AuthResponse represents the authentication response containing token and user info
type AuthResponse struct {
	Token string      `json:"token"`
	User  models.User `json:"user"`
}

// PaginatedUsersResponse represents a paginated list of users
type PaginatedUsersResponse struct {
	Data       []models.User `json:"data"`
	Total      int64         `json:"total"`
	Page       int           `json:"page"`
	PageSize   int           `json:"page_size"`
	TotalPages int           `json:"total_pages"`
}
