package oauth

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
)

type GoogleProvider struct {
	config      OAuthConfig
	authURL     string
	tokenURL    string
	userInfoURL string
}

func NewGoogleProvider(config OAuthConfig) *GoogleProvider {
	return &GoogleProvider{
		config:      config,
		authURL:     "https://accounts.google.com/o/oauth2/v2/auth",
		tokenURL:    "https://oauth2.googleapis.com/token",
		userInfoURL: "https://www.googleapis.com/oauth2/v2/userinfo",
	}
}

func (g *GoogleProvider) GetProviderName() string {
	return "google"
}

func (g *GoogleProvider) GetAuthURL(state string) string {
	params := url.Values{}
	params.Add("client_id", g.config.ClientID)
	params.Add("redirect_uri", g.config.RedirectURL)
	params.Add("response_type", "code")
	params.Add("scope", strings.Join(g.config.Scopes, " "))
	params.Add("state", state)
	params.Add("access_type", "offline")
	params.Add("prompt", "consent")

	return fmt.Sprintf("%s?%s", g.authURL, params.Encode())
}

func (g *GoogleProvider) ExchangeCode(code string) (*OAuthToken, error) {
	data := url.Values{}
	data.Set("client_id", g.config.ClientID)
	data.Set("client_secret", g.config.ClientSecret)
	data.Set("code", code)
	data.Set("redirect_uri", g.config.RedirectURL)
	data.Set("grant_type", "authorization_code")

	resp, err := http.Post(g.tokenURL, "application/x-www-form-urlencoded", strings.NewReader(data.Encode()))
	if err != nil {
		return nil, fmt.Errorf("failed to exchange code: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("token exchange failed: %s", string(body))
	}

	var token OAuthToken
	if err := json.NewDecoder(resp.Body).Decode(&token); err != nil {
		return nil, fmt.Errorf("failed to decode token: %w", err)
	}

	return &token, nil
}

func (g *GoogleProvider) GetUserInfo(accessToken string) (*OAuthUser, error) {
	req, err := http.NewRequest("GET", g.userInfoURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+accessToken)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to get user info: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("get user info failed: %s", string(body))
	}

	var googleUser struct {
		ID      string `json:"id"`
		Email   string `json:"email"`
		Name    string `json:"name"`
		Picture string `json:"picture"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&googleUser); err != nil {
		return nil, fmt.Errorf("failed to decode user info: %w", err)
	}

	return &OAuthUser{
		ID:        googleUser.ID,
		Email:     googleUser.Email,
		Name:      googleUser.Name,
		AvatarURL: googleUser.Picture,
	}, nil
}
