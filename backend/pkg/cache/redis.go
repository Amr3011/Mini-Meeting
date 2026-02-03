package cache

import (
	"context"
	"encoding/json"
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

// Set stores a key-value pair with expiration time
func Set(key string, value interface{}, expiration time.Duration) error {
	data, err := json.Marshal(value)
	if err != nil {
		return fmt.Errorf("failed to marshal value: %w", err)
	}

	return Client.Set(ctx, key, data, expiration).Err()
}

// SetString stores a string value with expiration time
func SetString(key string, value string, expiration time.Duration) error {
	return Client.Set(ctx, key, value, expiration).Err()
}

// Get retrieves a value and unmarshals it into the provided interface
func Get(key string, dest interface{}) error {
	data, err := Client.Get(ctx, key).Bytes()
	if err != nil {
		if err == redis.Nil {
			return fmt.Errorf("key not found: %s", key)
		}
		return fmt.Errorf("failed to get value: %w", err)
	}

	if err := json.Unmarshal(data, dest); err != nil {
		return fmt.Errorf("failed to unmarshal value: %w", err)
	}

	return nil
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

// Exists checks if a key exists
func Exists(key string) (bool, error) {
	count, err := Client.Exists(ctx, key).Result()
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// Expire sets expiration time for a key
func Expire(key string, expiration time.Duration) error {
	return Client.Expire(ctx, key, expiration).Err()
}

// TTL returns the remaining time to live of a key
func TTL(key string) (time.Duration, error) {
	return Client.TTL(ctx, key).Result()
}

// Increment increments the integer value of a key by one
func Increment(key string) (int64, error) {
	return Client.Incr(ctx, key).Result()
}

// IncrementBy increments the integer value of a key by the given amount
func IncrementBy(key string, value int64) (int64, error) {
	return Client.IncrBy(ctx, key, value).Result()
}

// Decrement decrements the integer value of a key by one
func Decrement(key string) (int64, error) {
	return Client.Decr(ctx, key).Result()
}

// DecrementBy decrements the integer value of a key by the given amount
func DecrementBy(key string, value int64) (int64, error) {
	return Client.DecrBy(ctx, key, value).Result()
}

// SetNX sets a key if it doesn't exist (atomic operation)
func SetNX(key string, value interface{}, expiration time.Duration) (bool, error) {
	data, err := json.Marshal(value)
	if err != nil {
		return false, fmt.Errorf("failed to marshal value: %w", err)
	}

	return Client.SetNX(ctx, key, data, expiration).Result()
}

// GetDel gets and deletes a key atomically
func GetDel(key string, dest interface{}) error {
	data, err := Client.GetDel(ctx, key).Bytes()
	if err != nil {
		if err == redis.Nil {
			return fmt.Errorf("key not found: %s", key)
		}
		return fmt.Errorf("failed to get value: %w", err)
	}

	if err := json.Unmarshal(data, dest); err != nil {
		return fmt.Errorf("failed to unmarshal value: %w", err)
	}

	return nil
}

// FlushDB removes all keys from the current database
func FlushDB() error {
	return Client.FlushDB(ctx).Err()
}

// Keys returns all keys matching a pattern
func Keys(pattern string) ([]string, error) {
	return Client.Keys(ctx, pattern).Result()
}

// MSet sets multiple key-value pairs at once
func MSet(pairs map[string]interface{}) error {
	args := make([]interface{}, 0, len(pairs)*2)
	for k, v := range pairs {
		data, err := json.Marshal(v)
		if err != nil {
			return fmt.Errorf("failed to marshal value for key %s: %w", k, err)
		}
		args = append(args, k, data)
	}

	return Client.MSet(ctx, args...).Err()
}

// MGet gets multiple values at once
func MGet(keys ...string) ([]interface{}, error) {
	return Client.MGet(ctx, keys...).Result()
}

// HashSet sets a field in a hash
func HashSet(key, field string, value interface{}) error {
	data, err := json.Marshal(value)
	if err != nil {
		return fmt.Errorf("failed to marshal value: %w", err)
	}

	return Client.HSet(ctx, key, field, data).Err()
}

// HashGet gets a field from a hash
func HashGet(key, field string, dest interface{}) error {
	data, err := Client.HGet(ctx, key, field).Bytes()
	if err != nil {
		if err == redis.Nil {
			return fmt.Errorf("field not found: %s", field)
		}
		return fmt.Errorf("failed to get value: %w", err)
	}

	if err := json.Unmarshal(data, dest); err != nil {
		return fmt.Errorf("failed to unmarshal value: %w", err)
	}

	return nil
}

// HashGetAll gets all fields and values from a hash
func HashGetAll(key string) (map[string]string, error) {
	return Client.HGetAll(ctx, key).Result()
}

// HashDelete deletes one or more fields from a hash
func HashDelete(key string, fields ...string) error {
	return Client.HDel(ctx, key, fields...).Err()
}

// HashExists checks if a field exists in a hash
func HashExists(key, field string) (bool, error) {
	return Client.HExists(ctx, key, field).Result()
}

// ListPush adds elements to the head of a list
func ListPush(key string, values ...interface{}) error {
	return Client.LPush(ctx, key, values...).Err()
}

// ListPop removes and returns the first element of a list
func ListPop(key string) (string, error) {
	return Client.LPop(ctx, key).Result()
}

// ListRange gets a range of elements from a list
func ListRange(key string, start, stop int64) ([]string, error) {
	return Client.LRange(ctx, key, start, stop).Result()
}

// ListLength gets the length of a list
func ListLength(key string) (int64, error) {
	return Client.LLen(ctx, key).Result()
}

// SetAdd adds members to a set
func SetAdd(key string, members ...interface{}) error {
	return Client.SAdd(ctx, key, members...).Err()
}

// SetMembers gets all members of a set
func SetMembers(key string) ([]string, error) {
	return Client.SMembers(ctx, key).Result()
}

// SetIsMember checks if a value is a member of a set
func SetIsMember(key string, member interface{}) (bool, error) {
	return Client.SIsMember(ctx, key, member).Result()
}

// SetRemove removes members from a set
func SetRemove(key string, members ...interface{}) error {
	return Client.SRem(ctx, key, members...).Err()
}

// SetCardinality gets the number of members in a set
func SetCardinality(key string) (int64, error) {
	return Client.SCard(ctx, key).Result()
}

// Publish publishes a message to a channel
func Publish(channel string, message interface{}) error {
	data, err := json.Marshal(message)
	if err != nil {
		return fmt.Errorf("failed to marshal message: %w", err)
	}

	return Client.Publish(ctx, channel, data).Err()
}

// Subscribe subscribes to one or more channels
func Subscribe(channels ...string) *redis.PubSub {
	return Client.Subscribe(ctx, channels...)
}

// GetClient returns the Redis client for custom operations
func GetClient() *redis.Client {
	return Client
}
