package services

import (
	"errors"
	"mini-meeting/internal/models"
	"mini-meeting/internal/repositories"
	"strings"

	"gorm.io/gorm"
)

type UserService struct {
	repo        *repositories.UserRepository
	meetingRepo *repositories.MeetingRepository
}

func NewUserService(repo *repositories.UserRepository, meetingRepo *repositories.MeetingRepository) *UserService {
	return &UserService{
		repo:        repo,
		meetingRepo: meetingRepo,
	}
}

func (s *UserService) GetUserByID(id uint) (*models.User, error) {
	user, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}
	return user, nil
}

func (s *UserService) GetUserByEmail(email string) (*models.User, error) {
	email = strings.ToLower(email)
	user, err := s.repo.FindByEmail(email)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}
	return user, nil
}

func (s *UserService) GetAllUsersPaginated(page, pageSize int, search string) (*models.PaginatedUsersResponse, error) {
	// Set default values
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 10
	}

	users, total, err := s.repo.FindAllPaginated(page, pageSize, search)
	if err != nil {
		return nil, err
	}

	// Calculate total pages
	totalPages := int(total) / pageSize
	if int(total)%pageSize > 0 {
		totalPages++
	}

	return &models.PaginatedUsersResponse{
		Data:       users,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	}, nil
}

func (s *UserService) UpdateUser(id uint, req *models.UpdateUserRequest) (*models.User, error) {
	user, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	// Protect admin from being modified to regular user
	// Role cannot be changed through this endpoint
	if user.Role == "admin" && id == 1 {
		return nil, errors.New("cannot modify admin user")
	}

	// Update fields if provided
	if req.Name != "" {
		user.Name = req.Name
	}

	if err := s.repo.Update(user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *UserService) DeleteUser(id uint) error {
	// Check if user exists
	user, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("user not found")
		}
		return err
	}

	// Protect admin from deletion
	if user.Role == "admin" {
		return errors.New("cannot delete admin user")
	}

	// Delete all meetings created by this user
	if err := s.meetingRepo.DeleteByCreatorID(id); err != nil {
		return err
	}

	return s.repo.Delete(id)
}

func (s *UserService) FindOrCreateOAuthUser(provider models.Provider, providerID string, email string, name string, avatarURL string) (*models.User, error) {
	email = strings.ToLower(email)

	// First, try to find user by provider and provider ID
	user, err := s.repo.FindByProvider(provider, providerID)
	if err == nil && user != nil {
		// Update avatar URL if it changed
		if user.AvatarURL != avatarURL {
			user.AvatarURL = avatarURL
			s.repo.Update(user)
		}
		return user, nil
	}

	// Check if a user with this email already exists
	existingUser, err := s.repo.FindByEmail(email)
	if err == nil && existingUser != nil {
		// User exists with same email but different provider
		if existingUser.Provider != provider {
			// Already linked to another OAuth provider
			return nil, errors.New("account_exists_different_provider")
		}
	}

	// Create new OAuth user
	user = &models.User{
		Email:      email,
		Name:       name,
		Provider:   provider,
		ProviderID: providerID,
		AvatarURL:  avatarURL,
		Role:       "user",
	}

	if err := s.repo.Create(user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *UserService) LinkOAuthProvider(userID uint, provider models.Provider, providerID string, avatarURL string) error {
	user, err := s.repo.FindByID(userID)
	if err != nil {
		return errors.New("user not found")
	}

	// Check if already linked to this provider
	if user.Provider == provider && user.ProviderID == providerID {
		return nil // Already linked
	}

	// Check if provider is already in use by another account
	existingUser, err := s.repo.FindByProvider(provider, providerID)
	if err == nil && existingUser != nil && existingUser.ID != userID {
		return errors.New("provider already linked to another account")
	}

	// Update provider info
	return s.repo.UpdateProviderInfo(userID, provider, providerID, avatarURL)
}

func (s *UserService) GetUserByProvider(provider models.Provider, providerID string) (*models.User, error) {
	user, err := s.repo.FindByProvider(provider, providerID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, err
	}
	return user, nil
}
