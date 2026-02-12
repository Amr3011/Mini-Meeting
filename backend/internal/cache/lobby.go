package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"mini-meeting/pkg/cache"
)

const (
	// LobbyRequestKeyPrefix stores individual join requests
	LobbyRequestKeyPrefix = "lobby:request:"

	// LobbyMeetingRequestsKeyPrefix stores the set of request IDs per meeting
	LobbyMeetingRequestsKeyPrefix = "lobby:meeting:"

	// LobbyTokenKeyPrefix stores generated tokens for approved requests
	LobbyTokenKeyPrefix = "lobby:token:"

	// LobbyExpiration is the TTL for all lobby data (1 hour)
	LobbyExpiration = 1 * time.Hour
)

// LobbyRequestStatus represents the status of a lobby join request
type LobbyRequestStatus string

const (
	LobbyStatusPending  LobbyRequestStatus = "pending"
	LobbyStatusApproved LobbyRequestStatus = "approved"
	LobbyStatusRejected LobbyRequestStatus = "rejected"
)

// LobbyRequest represents a join request stored in Redis
type LobbyRequest struct {
	ID          string             `json:"id"`
	MeetingCode string             `json:"meeting_code"`
	UserID      uint               `json:"user_id,omitempty"`
	Name        string             `json:"name"`
	AvatarURL   string             `json:"avatar_url,omitempty"`
	Identity    string             `json:"identity"`
	Role        string             `json:"role"`
	Status      LobbyRequestStatus `json:"status"`
	CreatedAt   int64              `json:"created_at"`
}

// LobbyTokenData stores the token data for an approved request
type LobbyTokenData struct {
	Token    string `json:"token"`
	URL      string `json:"url"`
	RoomName string `json:"room_name"`
	Identity string `json:"identity"`
	UserName string `json:"user_name"`
}

// --- Key helpers ---

func lobbyRequestKey(requestID string) string {
	return fmt.Sprintf("%s%s", LobbyRequestKeyPrefix, requestID)
}

func lobbyMeetingRequestsKey(meetingCode string) string {
	return fmt.Sprintf("%s%s:requests", LobbyMeetingRequestsKeyPrefix, meetingCode)
}

func lobbyTokenKey(requestID string) string {
	return fmt.Sprintf("%s%s", LobbyTokenKeyPrefix, requestID)
}

// --- Operations ---

// StoreLobbyRequest stores a new join request in Redis
func StoreLobbyRequest(req *LobbyRequest) error {
	data, err := json.Marshal(req)
	if err != nil {
		return fmt.Errorf("failed to marshal lobby request: %w", err)
	}

	// Store the request data
	if err := cache.SetString(lobbyRequestKey(req.ID), string(data), LobbyExpiration); err != nil {
		return fmt.Errorf("failed to store lobby request: %w", err)
	}

	ctx := context.Background()

	// Add request ID to the meeting's request set
	if err := cache.Client.SAdd(ctx, lobbyMeetingRequestsKey(req.MeetingCode), req.ID).Err(); err != nil {
		return fmt.Errorf("failed to add request to meeting set: %w", err)
	}

	// Set expiration on the set key
	cache.Client.Expire(ctx, lobbyMeetingRequestsKey(req.MeetingCode), LobbyExpiration)

	return nil
}

// GetLobbyRequest retrieves a lobby request by ID
func GetLobbyRequest(requestID string) (*LobbyRequest, error) {
	data, err := cache.GetString(lobbyRequestKey(requestID))
	if err != nil {
		return nil, fmt.Errorf("lobby request not found: %s", requestID)
	}

	var req LobbyRequest
	if err := json.Unmarshal([]byte(data), &req); err != nil {
		return nil, fmt.Errorf("failed to unmarshal lobby request: %w", err)
	}

	return &req, nil
}

// UpdateLobbyRequestStatus updates the status of a lobby request
func UpdateLobbyRequestStatus(requestID string, status LobbyRequestStatus) error {
	req, err := GetLobbyRequest(requestID)
	if err != nil {
		return err
	}

	req.Status = status

	data, err := json.Marshal(req)
	if err != nil {
		return fmt.Errorf("failed to marshal lobby request: %w", err)
	}

	if err := cache.SetString(lobbyRequestKey(requestID), string(data), LobbyExpiration); err != nil {
		return fmt.Errorf("failed to update lobby request: %w", err)
	}

	// If rejected, remove from meeting's pending set
	if status == LobbyStatusRejected {
		cache.Client.SRem(context.Background(), lobbyMeetingRequestsKey(req.MeetingCode), requestID)
	}

	return nil
}

// GetPendingRequests returns all pending requests for a meeting
func GetPendingRequests(meetingCode string) ([]*LobbyRequest, error) {
	// Get all request IDs from the set
	ctx := context.Background()
	requestIDs, err := cache.Client.SMembers(ctx, lobbyMeetingRequestsKey(meetingCode)).Result()
	if err != nil {
		return nil, fmt.Errorf("failed to get meeting requests: %w", err)
	}

	var pending []*LobbyRequest
	for _, id := range requestIDs {
		req, err := GetLobbyRequest(id)
		if err != nil {
			// Request expired or was deleted, remove from set
			cache.Client.SRem(ctx, lobbyMeetingRequestsKey(meetingCode), id)
			continue
		}

		if req.Status == LobbyStatusPending {
			pending = append(pending, req)
		}
	}

	return pending, nil
}

// StoreLobbyToken stores a generated token for an approved request
func StoreLobbyToken(requestID string, tokenData *LobbyTokenData) error {
	data, err := json.Marshal(tokenData)
	if err != nil {
		return fmt.Errorf("failed to marshal token data: %w", err)
	}

	return cache.SetString(lobbyTokenKey(requestID), string(data), LobbyExpiration)
}

// GetLobbyToken retrieves the stored token for an approved request
func GetLobbyToken(requestID string) (*LobbyTokenData, error) {
	data, err := cache.GetString(lobbyTokenKey(requestID))
	if err != nil {
		return nil, fmt.Errorf("token not found for request: %s", requestID)
	}

	var tokenData LobbyTokenData
	if err := json.Unmarshal([]byte(data), &tokenData); err != nil {
		return nil, fmt.Errorf("failed to unmarshal token data: %w", err)
	}

	return &tokenData, nil
}

// CleanupLobbyRequest removes all data associated with a request
func CleanupLobbyRequest(requestID string) error {
	req, err := GetLobbyRequest(requestID)
	if err == nil {
		cache.Client.SRem(context.Background(), lobbyMeetingRequestsKey(req.MeetingCode), requestID)
	}

	cache.Delete(lobbyRequestKey(requestID))
	cache.Delete(lobbyTokenKey(requestID))

	return nil
}
