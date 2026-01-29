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
}

type ServerConfig struct {
	Port string
	Env  string
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

func Load() (*Config, error) {
	// Load .env file if it exists
	_ = godotenv.Load()

	config := &Config{
		Server: ServerConfig{
			Port: getEnv("PORT", "3000"),
			Env:  getEnv("ENV", "development"),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", "root"),
			DBName:   getEnv("DB_NAME", "mini_meeting"),
		},
		JWT: JWTConfig{
			Secret:     getEnv("JWT_SECRET", "your-secret-key-change-this-in-production"),
			Expiration: getEnv("JWT_EXPIRATION", "24h"),
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
