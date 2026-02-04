package cache

import (
	"fmt"
	"time"

	"mini-meeting/pkg/cache"
)

const (
	// OAuthStateKeyPrefix is the prefix for OAuth state keys in Redis
	OAuthStateKeyPrefix = "oauth:state:"

	// OAuthStateExpiration is the TTL for OAuth state (5 minutes)
	OAuthStateExpiration = 5 * time.Minute
)

// oauthStateKey generates a Redis key for the given OAuth state
func oauthStateKey(state string) string {
	return fmt.Sprintf("%s%s", OAuthStateKeyPrefix, state)
}

// StoreOAuthState stores the OAuth state with the associated provider in Redis
func StoreOAuthState(state, provider string) error {
	return cache.SetString(oauthStateKey(state), provider, OAuthStateExpiration)
}

// GetOAuthState retrieves the provider associated with the given OAuth state
func GetOAuthState(state string) (string, error) {
	return cache.GetString(oauthStateKey(state))
}

// DeleteOAuthState removes the OAuth state from Redis
func DeleteOAuthState(state string) error {
	return cache.Delete(oauthStateKey(state))
}
