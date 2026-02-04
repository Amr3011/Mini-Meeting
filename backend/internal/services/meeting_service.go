package services

import (
	"crypto/rand"
	"errors"
	"mini-meeting/internal/models"
	"mini-meeting/internal/repositories"

	"gorm.io/gorm"
)

type MeetingService struct {
	repo *repositories.MeetingRepository
}

func NewMeetingService(repo *repositories.MeetingRepository) *MeetingService {
	return &MeetingService{repo: repo}
}

// generateMeetingCode generates a unique meeting code in format "xxx-xxxx-xxx"
func (s *MeetingService) generateMeetingCode() (string, error) {
	const charset = "abcdefghijklmnopqrstuvwxyz"
	const maxAttempts = 10

	for attempt := 0; attempt < maxAttempts; attempt++ {
		code := make([]byte, 12) // 3 + 1 + 4 + 1 + 3 = 12 characters

		// Generate random characters
		randomBytes := make([]byte, 10)
		if _, err := rand.Read(randomBytes); err != nil {
			return "", err
		}

		// Build the code with format xxx-xxxx-xxx
		for i := 0; i < 3; i++ {
			code[i] = charset[randomBytes[i]%byte(len(charset))]
		}
		code[3] = '-'
		for i := 0; i < 4; i++ {
			code[4+i] = charset[randomBytes[3+i]%byte(len(charset))]
		}
		code[8] = '-'
		for i := 0; i < 3; i++ {
			code[9+i] = charset[randomBytes[7+i]%byte(len(charset))]
		}

		meetingCode := string(code)

		// Check if code already exists
		exists, err := s.repo.ExistsByCode(meetingCode)
		if err != nil {
			return "", err
		}

		if !exists {
			return meetingCode, nil
		}
	}

	return "", errors.New("failed to generate unique meeting code")
}

func (s *MeetingService) CreateMeeting(creatorID uint) (*models.Meeting, error) {
	// Generate unique meeting code
	meetingCode, err := s.generateMeetingCode()
	if err != nil {
		return nil, err
	}

	meeting := &models.Meeting{
		CreatorID:   creatorID,
		MeetingCode: meetingCode,
	}

	if err := s.repo.Create(meeting); err != nil {
		return nil, err
	}

	return meeting, nil
}

func (s *MeetingService) GetMeetingByID(id uint) (*models.Meeting, error) {
	meeting, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("meeting not found")
		}
		return nil, err
	}
	return meeting, nil
}

func (s *MeetingService) GetMeetingByCode(code string) (*models.Meeting, error) {
	meeting, err := s.repo.FindByCode(code)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("meeting not found")
		}
		return nil, err
	}
	return meeting, nil
}

func (s *MeetingService) GetMeetingsByCreatorID(creatorID uint) ([]models.Meeting, error) {
	return s.repo.FindByCreatorID(creatorID)
}

func (s *MeetingService) GetAllMeetings() ([]models.Meeting, error) {
	return s.repo.FindAll()
}

func (s *MeetingService) DeleteMeeting(id uint, userID uint) error {
	meeting, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("meeting not found")
		}
		return err
	}

	// Check if user is the creator
	if meeting.CreatorID != userID {
		return errors.New("unauthorized: you can only delete your own meetings")
	}

	return s.repo.Delete(id)
}
