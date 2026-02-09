package models

import "time"

type User struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	Email      string    `gorm:"unique;not null" json:"email"`
	Name       string    `gorm:"not null" json:"name"`
	Role       string    `gorm:"default:'user';not null" json:"role"`
	Provider   Provider  `gorm:"not null" json:"provider"`
	ProviderID string    `gorm:"index" json:"-"`
	AvatarURL  string    `gorm:"" json:"avatar_url"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type UpdateUserRequest struct {
	Name string `json:"name" validate:"omitempty"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type Provider string

const (
	ProviderGoogle Provider = "google"
	ProviderGithub Provider = "github"
)

type PaginatedUsersResponse struct {
	Data       []User `json:"data"`
	Total      int64  `json:"total"`
	Page       int    `json:"page"`
	PageSize   int    `json:"page_size"`
	TotalPages int    `json:"total_pages"`
}
