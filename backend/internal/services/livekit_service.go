package services

import (
	"context"
	"fmt"
	"time"

	"mini-meeting/internal/config"

	"github.com/livekit/protocol/auth"
	"github.com/livekit/protocol/livekit"
	lksdk "github.com/livekit/server-sdk-go/v2"
)

type LiveKitService struct {
	roomService *lksdk.RoomServiceClient
	apiKey      string
	apiSecret   string
	url         string
}

func NewLiveKitService(cfg *config.Config) *LiveKitService {
	roomService := lksdk.NewRoomServiceClient(
		cfg.LiveKit.URL,
		cfg.LiveKit.APIKey,
		cfg.LiveKit.APISecret,
	)

	return &LiveKitService{
		roomService: roomService,
		apiKey:      cfg.LiveKit.APIKey,
		apiSecret:   cfg.LiveKit.APISecret,
		url:         cfg.LiveKit.URL,
	}
}

// CreateJoinToken creates a token with role-based permissions
// RoomCode should be the meeting code from the database
// identity is the user ID as string
// userName is the display name for the participant
// userRole is the user's role (admin, user, etc.)
// metadata can include user name, avatar, etc.
func (s *LiveKitService) CreateJoinToken(
	RoomCode string,
	identity string,
	userName string,
	userRole string,
	metadata string,
) (string, error) {
	at := auth.NewAccessToken(s.apiKey, s.apiSecret)

	// Set identity, name, and metadata
	at.SetIdentity(identity)
	at.SetName(userName)
	if metadata != "" {
		at.SetMetadata(metadata)
	}

	// Base grant - all users can join, publish, and subscribe
	grant := &auth.VideoGrant{
		RoomJoin:       true,
		Room:           RoomCode,
		CanPublish:     &[]bool{true}[0],
		CanSubscribe:   &[]bool{true}[0],
		CanPublishData: &[]bool{true}[0], // For chat/data messages
	}

	// Role-based permissions
	if userRole == "admin" {
		// Admin has full control
		canUpdateMetadata := true
		grant.CanUpdateOwnMetadata = &canUpdateMetadata
		// Admin can also be marked as room admin
		grant.RoomAdmin = true
	} else {
		// Regular users - more restricted
		canUpdateMetadata := false
		grant.CanUpdateOwnMetadata = &canUpdateMetadata
	}

	at.SetVideoGrant(grant)

	// Token valid for 24 hours
	at.SetValidFor(24 * time.Hour)

	token, err := at.ToJWT()
	if err != nil {
		return "", fmt.Errorf("failed to generate token: %w", err)
	}

	return token, nil
}

// RemoveParticipant removes a participant from a room (kick)
func (s *LiveKitService) RemoveParticipant(RoomCode string, participantIdentity string) error {
	_, err := s.roomService.RemoveParticipant(context.Background(), &livekit.RoomParticipantIdentity{
		Room:     RoomCode,
		Identity: participantIdentity,
	})
	if err != nil {
		return fmt.Errorf("failed to remove participant: %w", err)
	}
	return nil
}

// ListParticipants lists all participants in a room
func (s *LiveKitService) ListParticipants(RoomCode string) ([]*livekit.ParticipantInfo, error) {
	response, err := s.roomService.ListParticipants(context.Background(), &livekit.ListParticipantsRequest{
		Room: RoomCode,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to list participants: %w", err)
	}
	return response.Participants, nil
}

// ListRooms lists all active rooms
func (s *LiveKitService) ListRooms() ([]*livekit.Room, error) {
	response, err := s.roomService.ListRooms(context.Background(), &livekit.ListRoomsRequest{})
	if err != nil {
		return nil, fmt.Errorf("failed to list rooms: %w", err)
	}
	return response.Rooms, nil
}

// DeleteRoom deletes a room
func (s *LiveKitService) DeleteRoom(RoomCode string) error {
	_, err := s.roomService.DeleteRoom(context.Background(), &livekit.DeleteRoomRequest{
		Room: RoomCode,
	})
	if err != nil {
		return fmt.Errorf("failed to delete room: %w", err)
	}
	return nil
}

// MuteParticipantTrack mutes a specific track for a participant
func (s *LiveKitService) MuteParticipantTrack(RoomCode string, participantIdentity string, trackSid string, muted bool) error {
	_, err := s.roomService.MutePublishedTrack(context.Background(), &livekit.MuteRoomTrackRequest{
		Room:     RoomCode,
		Identity: participantIdentity,
		TrackSid: trackSid,
		Muted:    muted,
	})
	if err != nil {
		return fmt.Errorf("failed to mute track: %w", err)
	}
	return nil
}

// UpdateParticipantMetadata updates participant metadata
func (s *LiveKitService) UpdateParticipantMetadata(RoomCode string, participantIdentity string, metadata string) error {
	_, err := s.roomService.UpdateParticipant(context.Background(), &livekit.UpdateParticipantRequest{
		Room:     RoomCode,
		Identity: participantIdentity,
		Metadata: metadata,
	})
	if err != nil {
		return fmt.Errorf("failed to update participant metadata: %w", err)
	}
	return nil
}

// UpdateRoomMetadata updates room metadata
func (s *LiveKitService) UpdateRoomMetadata(RoomCode string, metadata string) error {
	_, err := s.roomService.UpdateRoomMetadata(context.Background(), &livekit.UpdateRoomMetadataRequest{
		Room:     RoomCode,
		Metadata: metadata,
	})
	if err != nil {
		return fmt.Errorf("failed to update room metadata: %w", err)
	}
	return nil
}

// GetURL returns the LiveKit WebSocket URL
func (s *LiveKitService) GetURL() string {
	return s.url
}

// CreateBotToken creates a token for the summarizer bot hidden from other participants with audio-only subscription
func (s *LiveKitService) CreateBotToken(RoomCode string, sessionID uint) (string, error) {
	at := auth.NewAccessToken(s.apiKey, s.apiSecret)

	// Bot identity and metadata
	botIdentity := fmt.Sprintf("summarizer-bot-%d", sessionID)
	at.SetIdentity(botIdentity)
	at.SetName("Summarizer Bot")
	at.SetMetadata(fmt.Sprintf(`{"type":"bot","session_id":%d}`, sessionID))

	// Bot can only subscribe to audio, cannot publish
	canPublish := false
	canSubscribe := true
	grant := &auth.VideoGrant{
		RoomJoin:     true,
		Room:         RoomCode,
		CanPublish:   &canPublish,
		CanSubscribe: &canSubscribe,
		Hidden:       true,
	}

	at.SetVideoGrant(grant)

	// Token valid for 24 hours
	at.SetValidFor(24 * time.Hour)

	token, err := at.ToJWT()
	if err != nil {
		return "", fmt.Errorf("failed to generate bot token: %w", err)
	}

	return token, nil
}
