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
// roomName should be the meeting code from the database
// identity is the user ID as string
// userName is the display name for the participant
// userRole is the user's role (admin, user, etc.)
// metadata can include user name, avatar, etc.
func (s *LiveKitService) CreateJoinToken(
	roomName string,
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
		Room:           roomName,
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

	at.AddGrant(grant)

	// Token valid for 24 hours
	at.SetValidFor(24 * time.Hour)

	token, err := at.ToJWT()
	if err != nil {
		return "", fmt.Errorf("failed to generate token: %w", err)
	}

	return token, nil
}

// RemoveParticipant removes a participant from a room (kick)
func (s *LiveKitService) RemoveParticipant(roomName string, participantIdentity string) error {
	_, err := s.roomService.RemoveParticipant(context.Background(), &livekit.RoomParticipantIdentity{
		Room:     roomName,
		Identity: participantIdentity,
	})
	if err != nil {
		return fmt.Errorf("failed to remove participant: %w", err)
	}
	return nil
}

// ListParticipants lists all participants in a room
func (s *LiveKitService) ListParticipants(roomName string) ([]*livekit.ParticipantInfo, error) {
	response, err := s.roomService.ListParticipants(context.Background(), &livekit.ListParticipantsRequest{
		Room: roomName,
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
func (s *LiveKitService) DeleteRoom(roomName string) error {
	_, err := s.roomService.DeleteRoom(context.Background(), &livekit.DeleteRoomRequest{
		Room: roomName,
	})
	if err != nil {
		return fmt.Errorf("failed to delete room: %w", err)
	}
	return nil
}

// MuteParticipantTrack mutes a specific track for a participant
func (s *LiveKitService) MuteParticipantTrack(roomName string, participantIdentity string, trackSid string, muted bool) error {
	_, err := s.roomService.MutePublishedTrack(context.Background(), &livekit.MuteRoomTrackRequest{
		Room:     roomName,
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
func (s *LiveKitService) UpdateParticipantMetadata(roomName string, participantIdentity string, metadata string) error {
	_, err := s.roomService.UpdateParticipant(context.Background(), &livekit.UpdateParticipantRequest{
		Room:     roomName,
		Identity: participantIdentity,
		Metadata: metadata,
	})
	if err != nil {
		return fmt.Errorf("failed to update participant metadata: %w", err)
	}
	return nil
}

// UpdateRoomMetadata updates room metadata
func (s *LiveKitService) UpdateRoomMetadata(roomName string, metadata string) error {
	_, err := s.roomService.UpdateRoomMetadata(context.Background(), &livekit.UpdateRoomMetadataRequest{
		Room:     roomName,
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
