package oauth

import (
	"fmt"
	"mini-meeting/internal/models"
)

// OAuthProvider defines the interface for OAuth providers
type OAuthProvider interface {
	GetAuthURL(state string) string
	ExchangeCode(code string) (*OAuthToken, error)
	GetUserInfo(token string) (*OAuthUser, error)
	GetProviderName() string
}

// Factory function to create OAuth providers
func NewProvider(providerName models.Provider, config OAuthConfig) (OAuthProvider, error) {
	switch providerName {
	case models.ProviderGoogle:
		return NewGoogleProvider(config), nil
	case models.ProviderGithub:
		return NewGithubProvider(config), nil
	default:
		return nil, fmt.Errorf("unsupported OAuth provider: %s", providerName)
	}
}
