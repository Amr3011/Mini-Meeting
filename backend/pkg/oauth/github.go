package oauth

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
)

type GithubProvider struct {
	config      OAuthConfig
	authURL     string
	tokenURL    string
	userInfoURL string
	emailURL    string
}

func NewGithubProvider(config OAuthConfig) *GithubProvider {
	return &GithubProvider{
		config:      config,
		authURL:     "https://github.com/login/oauth/authorize",
		tokenURL:    "https://github.com/login/oauth/access_token",
		userInfoURL: "https://api.github.com/user",
		emailURL:    "https://api.github.com/user/emails",
	}
}

func (gh *GithubProvider) GetProviderName() string {
	return "github"
}

func (gh *GithubProvider) GetAuthURL(state string) string {
	params := url.Values{}
	params.Add("client_id", gh.config.ClientID)
	params.Add("redirect_uri", gh.config.RedirectURL)
	params.Add("scope", strings.Join(gh.config.Scopes, " "))
	params.Add("state", state)

	return fmt.Sprintf("%s?%s", gh.authURL, params.Encode())
}

func (gh *GithubProvider) ExchangeCode(code string) (*OAuthToken, error) {
	data := url.Values{}
	data.Set("client_id", gh.config.ClientID)
	data.Set("client_secret", gh.config.ClientSecret)
	data.Set("code", code)
	data.Set("redirect_uri", gh.config.RedirectURL)

	req, err := http.NewRequest("POST", gh.tokenURL, strings.NewReader(data.Encode()))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Accept", "application/json")
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	client := &http.Client{}
	resp, err := client.Do(req)
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

func (gh *GithubProvider) GetUserInfo(accessToken string) (*OAuthUser, error) {
	// Get user profile
	req, err := http.NewRequest("GET", gh.userInfoURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Accept", "application/json")

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

	var githubUser struct {
		ID        int64  `json:"id"`
		Login     string `json:"login"`
		Name      string `json:"name"`
		Email     string `json:"email"`
		AvatarURL string `json:"avatar_url"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&githubUser); err != nil {
		return nil, fmt.Errorf("failed to decode user info: %w", err)
	}

	// If email is not public, fetch from emails endpoint
	email := githubUser.Email
	if email == "" {
		email, err = gh.getPrimaryEmail(accessToken)
		if err != nil {
			return nil, fmt.Errorf("failed to get email: %w", err)
		}
	}

	// Use login as name if name is not provided
	name := githubUser.Name
	if name == "" {
		name = githubUser.Login
	}

	return &OAuthUser{
		ID:        fmt.Sprintf("%d", githubUser.ID),
		Email:     email,
		Name:      name,
		AvatarURL: githubUser.AvatarURL,
		Verified:  true, // GitHub emails are considered verified
	}, nil
}

func (gh *GithubProvider) getPrimaryEmail(accessToken string) (string, error) {
	req, err := http.NewRequest("GET", gh.emailURL, nil)
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Accept", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to get emails: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("get emails failed: %s", string(body))
	}

	var emails []struct {
		Email      string `json:"email"`
		Primary    bool   `json:"primary"`
		Verified   bool   `json:"verified"`
		Visibility string `json:"visibility"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&emails); err != nil {
		return "", fmt.Errorf("failed to decode emails: %w", err)
	}

	// Find primary verified email
	for _, e := range emails {
		if e.Primary && e.Verified {
			return e.Email, nil
		}
	}

	// Find any verified email
	for _, e := range emails {
		if e.Verified {
			return e.Email, nil
		}
	}

	return "", fmt.Errorf("no verified email found")
}
