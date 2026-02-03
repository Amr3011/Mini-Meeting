package models

import "time"

type User struct {
	ID                     uint       `gorm:"primaryKey" json:"id"`
	Email                  string     `gorm:"unique;not null" json:"email"`
	Password               *string    `gorm:"" json:"-"`
	Name                   string     `gorm:"not null" json:"name"`
	Role                   string     `gorm:"default:'user';not null" json:"role"`
	Provider               Provider   `gorm:"default:'local';not null" json:"provider"`
	ProviderID             string     `gorm:"index" json:"-"`
	AvatarURL              string     `gorm:"" json:"avatar_url"`
	EmailVerified          bool       `gorm:"default:false" json:"email_verified"`
	VerificationCode       string     `gorm:"size:6" json:"-"`
	VerificationCodeExpiry *time.Time `json:"-"`
	PasswordResetCode      string     `gorm:"size:6" json:"-"`
	PasswordResetExpiry    *time.Time `json:"-"`
	CreatedAt              time.Time  `json:"created_at"`
	UpdatedAt              time.Time  `json:"updated_at"`
}

type CreateUserRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
	Name     string `json:"name" validate:"required"`
}

type UpdateUserRequest struct {
	Name string `json:"name" validate:"omitempty"`
}

type RegisterRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
	Name     string `json:"name" validate:"required"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type VerifyEmailRequest struct {
	Email string `json:"email" validate:"required,email"`
	Code  string `json:"code" validate:"required,len=6"`
}

type ResendCodeRequest struct {
	Email string `json:"email" validate:"required,email"`
}

type ForgotPasswordRequest struct {
	Email string `json:"email" validate:"required,email"`
}

type VerifyPasswordCodeRequest struct {
	Email string `json:"email" validate:"required,email"`
	Code  string `json:"code" validate:"required,len=6"`
}

type ResetPasswordRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Code     string `json:"code" validate:"required,len=6"`
	Password string `json:"password" validate:"required,min=6"`
}

type Provider string

const (
	ProviderLocal  Provider = "local"
	ProviderGoogle Provider = "google"
	ProviderGithub Provider = "github"
)
