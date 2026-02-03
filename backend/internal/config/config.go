package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	JWT      JWTConfig
	Email    EmailConfig
	Admin    AdminConfig
	OAuth    OAuthConfig
}

type ServerConfig struct {
	Port        string
	Env         string
	FrontendURL string
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
}

type JWTConfig struct {
	Secret     string
	Expiration string
}

type EmailConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	From     string
	Support  string
}

type AdminConfig struct {
	Email    string
	Password string
}

type OAuthConfig struct {
	Google GoogleOAuthConfig
	Github GithubOAuthConfig
}

type GoogleOAuthConfig struct {
	ClientID     string
	ClientSecret string
	RedirectURL  string
}

type GithubOAuthConfig struct {
	ClientID     string
	ClientSecret string
	RedirectURL  string
}

func Load() (*Config, error) {
	// Load .env file if it exists
	_ = godotenv.Load()

	config := &Config{
		Server: ServerConfig{
			Port:        getEnv("PORT", "3000"),
			Env:         getEnv("ENV", "development"),
			FrontendURL: getEnv("FRONTEND_URL", "http://localhost:5173"),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", "root"),
			DBName:   getEnv("DB_NAME", "mini_meeting"),
		},
		JWT: JWTConfig{
			Secret:     getEnv("JWT_SECRET"),
			Expiration: getEnv("JWT_EXPIRATION"),
		},
		Email: EmailConfig{
			Host:     getEnv("EMAIL_HOST", "smtp.gmail.com"),
			Port:     getEnv("EMAIL_PORT", "587"),
			User:     getEnv("EMAIL_USER", ""),
			Password: getEnv("EMAIL_PASSWORD", ""),
			From:     getEnv("EMAIL_FROM", ""),
			Support:  getEnv("EMAIL_SUPPORT", ""),
		},
		Admin: AdminConfig{
			Email:    getEnv("ADMIN_EMAIL"),
			Password: getEnv("ADMIN_PASSWORD"),
		},
		OAuth: OAuthConfig{
			Google: GoogleOAuthConfig{
				ClientID:     getEnv("GOOGLE_CLIENT_ID"),
				ClientSecret: getEnv("GOOGLE_CLIENT_SECRET"),
				RedirectURL:  getEnv("GOOGLE_REDIRECT_URL"),
			},
			Github: GithubOAuthConfig{
				ClientID:     getEnv("GITHUB_CLIENT_ID"),
				ClientSecret: getEnv("GITHUB_CLIENT_SECRET"),
				RedirectURL:  getEnv("GITHUB_REDIRECT_URL"),
			},
		},
	}

	return config, nil
}

func (c *DatabaseConfig) DSN() string {
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s",
		c.Host, c.Port, c.User, c.Password, c.DBName,
	)
}

func getEnv(key string, defaultValue ...string) string {
	value := os.Getenv(key)
	if value == "" && len(defaultValue) > 0 {
		return defaultValue[0]
	}
	return value
}
