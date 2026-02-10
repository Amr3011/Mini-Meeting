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

type Provider string

const (
	ProviderGoogle Provider = "google"
	ProviderGithub Provider = "github"
)
