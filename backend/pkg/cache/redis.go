package cache

import (
	"context"
	"fmt"
	"log"
	"time"

	"mini-meeting/internal/config"

	"github.com/redis/go-redis/v9"
)

var (
	Client *redis.Client
	ctx    = context.Background()
)

// Connect initializes Redis connection
func Connect(cfg *config.RedisConfig) error {
	Client = redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", cfg.Host, cfg.Port),
		Username: cfg.Username,
		Password: cfg.Password,
		DB:       0, // Default database
	})

	// Test connection
	if err := Client.Ping(ctx).Err(); err != nil {
		return fmt.Errorf("failed to connect to Redis: %w", err)
	}

	log.Println("Redis connection established")
	return nil
}

// Close closes the Redis connection
func Close() error {
	if Client != nil {
		return Client.Close()
	}
	return nil
}

// SetString stores a string value with expiration time
func SetString(key string, value string, expiration time.Duration) error {
	return Client.Set(ctx, key, value, expiration).Err()
}

// GetString retrieves a string value
func GetString(key string) (string, error) {
	val, err := Client.Get(ctx, key).Result()
	if err != nil {
		if err == redis.Nil {
			return "", fmt.Errorf("key not found: %s", key)
		}
		return "", fmt.Errorf("failed to get value: %w", err)
	}
	return val, nil
}

// Delete removes one or more keys
func Delete(keys ...string) error {
	return Client.Del(ctx, keys...).Err()
}
