package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Server     ServerConfig
	Database   DatabaseConfig
	Redis      RedisConfig
	JWT        JWTConfig
	OAuth      OAuthConfig
	LiveKit    LiveKitConfig
	Summarizer SummarizerConfig
	Whisper    WhisperConfig
	OpenRouter OpenRouterConfig
	Brevo      BrevoConfig
}

type ServerConfig struct {
	Port        string
	Env         string
	FrontendURL string
}

type DatabaseConfig struct {
	URL      string
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
}

type RedisConfig struct {
	Host     string
	Port     string
	Username string
	Password string
}

type JWTConfig struct {
	Secret     string
	Expiration string
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

type LiveKitConfig struct {
	APIKey    string
	APISecret string
	URL       string
}

type SummarizerConfig struct {
	ChunkDurationSeconds int
	TempDir              string
	CleanupAfterHours    int
}

type WhisperConfig struct {
	URL            string
	Timeout        string
	MaxConcurrency int
}

type OpenRouterConfig struct {
	APIKey    string
	BaseURL   string
	Model     string
	Timeout   string
	MaxTokens int
}

type BrevoConfig struct {
	APIKey      string
	SenderEmail string
	SenderName  string
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
			URL:      getEnv("DATABASE_URL"),
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", "root"),
			DBName:   getEnv("DB_NAME", "mini_meeting"),
		},
		Redis: RedisConfig{
			Host:     getEnv("REDIS_HOST", "localhost"),
			Port:     getEnv("REDIS_PORT", "6379"),
			Username: getEnv("REDIS_USERNAME", "default"),
			Password: getEnv("REDIS_PASSWORD", ""),
		},
		JWT: JWTConfig{
			Secret:     getEnv("JWT_SECRET"),
			Expiration: getEnv("JWT_EXPIRATION"),
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
		LiveKit: LiveKitConfig{
			APIKey:    getEnv("LIVEKIT_API_KEY"),
			APISecret: getEnv("LIVEKIT_API_SECRET"),
			URL:       getEnv("LIVEKIT_URL", "ws://localhost:7880"),
		},
		Summarizer: SummarizerConfig{
			ChunkDurationSeconds: getEnvAsInt("SUMMARIZER_CHUNK_DURATION_SECONDS", 20),
			TempDir:              getEnv("SUMMARIZER_TEMP_DIR", "./tmp/summarizer"),
			CleanupAfterHours:    getEnvAsInt("SUMMARIZER_CLEANUP_AFTER_HOURS", 24),
		},
		Whisper: WhisperConfig{
			URL:            getEnv("WHISPER_URL", "http://localhost:9000"),
			Timeout:        getEnv("WHISPER_TIMEOUT", "120s"),
			MaxConcurrency: getEnvAsInt("WHISPER_MAX_CONCURRENCY", 2),
		},
		OpenRouter: OpenRouterConfig{
			APIKey:    getEnv("OPEN_ROUTER_API_KEY"),
			BaseURL:   getEnv("OPEN_ROUTER_BASE_URL", "https://openrouter.ai/api/v1"),
			Model:     getEnv("OPEN_ROUTER_MODEL", "meta-llama/llama-3.2-3b-instruct:free"),
			Timeout:   getEnv("OPEN_ROUTER_TIMEOUT", "300s"),
			MaxTokens: getEnvAsInt("OPEN_ROUTER_MAX_TOKENS", 4096),
		},
		Brevo: BrevoConfig{
			APIKey:      getEnv("BRAVO_API_KEY"),
			SenderEmail: getEnv("BREVO_SENDER_EMAIL", "noreply@mini-meeting.app"),
			SenderName:  getEnv("BREVO_SENDER_NAME", "Mini Meeting"),
		},
	}

	return config, nil
}

func (c *DatabaseConfig) DSN() string {
	// If DATABASE_URL is provided, use it directly
	if c.URL != "" {
		return c.URL
	}

	// Otherwise, construct DSN from individual parameters
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
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

func getEnvAsInt(key string, defaultValue int) int {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}

	var intValue int
	_, err := fmt.Sscanf(value, "%d", &intValue)
	if err != nil {
		return defaultValue
	}
	return intValue
}
