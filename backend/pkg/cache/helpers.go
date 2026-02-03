package cache

import (
	"fmt"
	"time"
)

// Common cache key prefixes and patterns
const (
	// User related
	UserPrefix        = "user:"
	UserSessionPrefix = "session:"
	UserTokenPrefix   = "token:"
	UserVerifyPrefix  = "verify:"
	UserResetPrefix   = "reset:"

	// Meeting related
	MeetingPrefix     = "meeting:"
	MeetingRoomPrefix = "room:"

	// Rate limiting
	RateLimitPrefix = "ratelimit:"

	// Temporary data
	TempPrefix = "temp:"
)

// Common expiration times
const (
	ShortExpiration  = 5 * time.Minute
	MediumExpiration = 30 * time.Minute
	LongExpiration   = 24 * time.Hour
	WeekExpiration   = 7 * 24 * time.Hour
)

// Key builders for consistent key naming

// UserKey generates a cache key for user data
func UserKey(userID string) string {
	return fmt.Sprintf("%s%s", UserPrefix, userID)
}

// UserSessionKey generates a cache key for user session
func UserSessionKey(sessionID string) string {
	return fmt.Sprintf("%s%s", UserSessionPrefix, sessionID)
}

// UserTokenKey generates a cache key for user token
func UserTokenKey(token string) string {
	return fmt.Sprintf("%s%s", UserTokenPrefix, token)
}

// UserVerifyKey generates a cache key for email verification
func UserVerifyKey(token string) string {
	return fmt.Sprintf("%s%s", UserVerifyPrefix, token)
}

// UserResetKey generates a cache key for password reset
func UserResetKey(token string) string {
	return fmt.Sprintf("%s%s", UserResetPrefix, token)
}

// MeetingKey generates a cache key for meeting data
func MeetingKey(meetingID string) string {
	return fmt.Sprintf("%s%s", MeetingPrefix, meetingID)
}

// MeetingRoomKey generates a cache key for meeting room data
func MeetingRoomKey(roomID string) string {
	return fmt.Sprintf("%s%s", MeetingRoomPrefix, roomID)
}

// RateLimitKey generates a cache key for rate limiting
func RateLimitKey(identifier string) string {
	return fmt.Sprintf("%s%s", RateLimitPrefix, identifier)
}

// TempKey generates a cache key for temporary data
func TempKey(key string) string {
	return fmt.Sprintf("%s%s", TempPrefix, key)
}

// CacheService provides high-level caching operations
type CacheService struct{}

// NewCacheService creates a new cache service
func NewCacheService() *CacheService {
	return &CacheService{}
}

// CacheUser caches user data
func (s *CacheService) CacheUser(userID string, userData interface{}, expiration time.Duration) error {
	return Set(UserKey(userID), userData, expiration)
}

// GetUser retrieves cached user data
func (s *CacheService) GetUser(userID string, dest interface{}) error {
	return Get(UserKey(userID), dest)
}

// DeleteUser removes cached user data
func (s *CacheService) DeleteUser(userID string) error {
	return Delete(UserKey(userID))
}

// CacheSession caches session data
func (s *CacheService) CacheSession(sessionID string, sessionData interface{}, expiration time.Duration) error {
	return Set(UserSessionKey(sessionID), sessionData, expiration)
}

// GetSession retrieves cached session data
func (s *CacheService) GetSession(sessionID string, dest interface{}) error {
	return Get(UserSessionKey(sessionID), dest)
}

// DeleteSession removes cached session data
func (s *CacheService) DeleteSession(sessionID string) error {
	return Delete(UserSessionKey(sessionID))
}

// CacheVerificationToken caches email verification token
func (s *CacheService) CacheVerificationToken(token string, email string, expiration time.Duration) error {
	return SetString(UserVerifyKey(token), email, expiration)
}

// GetVerificationToken retrieves email from verification token
func (s *CacheService) GetVerificationToken(token string) (string, error) {
	return GetString(UserVerifyKey(token))
}

// DeleteVerificationToken removes verification token
func (s *CacheService) DeleteVerificationToken(token string) error {
	return Delete(UserVerifyKey(token))
}

// CacheResetToken caches password reset token
func (s *CacheService) CacheResetToken(token string, email string, expiration time.Duration) error {
	return SetString(UserResetKey(token), email, expiration)
}

// GetResetToken retrieves email from reset token
func (s *CacheService) GetResetToken(token string) (string, error) {
	return GetString(UserResetKey(token))
}

// DeleteResetToken removes reset token
func (s *CacheService) DeleteResetToken(token string) error {
	return Delete(UserResetKey(token))
}

// CheckRateLimit checks if the rate limit has been exceeded
func (s *CacheService) CheckRateLimit(identifier string, limit int64, window time.Duration) (bool, error) {
	key := RateLimitKey(identifier)

	count, err := Increment(key)
	if err != nil {
		return false, err
	}

	// Set expiration on first request
	if count == 1 {
		if err := Expire(key, window); err != nil {
			return false, err
		}
	}

	return count <= limit, nil
}

// GetRateLimitCount gets current rate limit count
func (s *CacheService) GetRateLimitCount(identifier string) (int64, error) {
	key := RateLimitKey(identifier)
	val, err := GetString(key)
	if err != nil {
		return 0, err
	}

	var count int64
	fmt.Sscanf(val, "%d", &count)
	return count, nil
}

// ResetRateLimit resets the rate limit counter
func (s *CacheService) ResetRateLimit(identifier string) error {
	return Delete(RateLimitKey(identifier))
}

// CacheTemp stores temporary data
func (s *CacheService) CacheTemp(key string, value interface{}, expiration time.Duration) error {
	return Set(TempKey(key), value, expiration)
}

// GetTemp retrieves temporary data
func (s *CacheService) GetTemp(key string, dest interface{}) error {
	return Get(TempKey(key), dest)
}

// DeleteTemp removes temporary data
func (s *CacheService) DeleteTemp(key string) error {
	return Delete(TempKey(key))
}

// InvalidatePattern deletes all keys matching a pattern
func (s *CacheService) InvalidatePattern(pattern string) error {
	keys, err := Keys(pattern)
	if err != nil {
		return err
	}

	if len(keys) > 0 {
		return Delete(keys...)
	}

	return nil
}

// InvalidateUserCache invalidates all user-related cache
func (s *CacheService) InvalidateUserCache(userID string) error {
	pattern := fmt.Sprintf("%s*", UserKey(userID))
	return s.InvalidatePattern(pattern)
}
