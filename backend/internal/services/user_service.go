package services

import (
	"errors"
	"mini-meeting/internal/models"
	"mini-meeting/internal/repositories"
	"strings"
	"time"

	"golang.org/x/crypto/bcrypt"
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

func (s *UserService) CreateUser(req *models.CreateUserRequest) (*models.User, error) {
	// Check if email already exists
	email := strings.ToLower(req.Email)
	existingUser, err := s.repo.FindByEmail(email)
	if err == nil && existingUser != nil {
		return nil, errors.New("email already exists")
	}
	// Ignore error if it's just "not found"
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	user := &models.User{
		Email:    email,
		Password: &req.Password,
		Name:     req.Name,
		Role:     "user",
		Provider: models.ProviderLocal,
	}

	if err := s.repo.Create(user); err != nil {
		return nil, err
	}

	return user, nil
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

func (s *UserService) GetAllUsers() ([]models.User, error) {
	return s.repo.FindAll()
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

func (s *UserService) SetVerificationCode(email, code string) error {
	email = strings.ToLower(email)
	expiry := time.Now().Add(10 * time.Minute)
	return s.repo.UpdateVerificationCode(email, code, expiry)
}

func (s *UserService) VerifyEmail(email, code string) error {
	email = strings.ToLower(email)
	user, err := s.repo.FindByEmail(email)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("user not found")
		}
		return err
	}

	if user.EmailVerified {
		return errors.New("email already verified")
	}

	if user.VerificationCode == "" {
		return errors.New("no verification code set")
	}

	if user.VerificationCode != code {
		return errors.New("invalid verification code")
	}

	if user.VerificationCodeExpiry == nil || time.Now().After(*user.VerificationCodeExpiry) {
		return errors.New("verification code expired")
	}

	return s.repo.VerifyEmail(email)
}

func (s *UserService) SetPasswordResetCode(email, code string) error {
	email = strings.ToLower(email)
	user, err := s.repo.FindByEmail(email)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("user not found")
		}
		return err
	}

	if !user.EmailVerified {
		return errors.New("email not verified")
	}

	expiry := time.Now().Add(10 * time.Minute)
	return s.repo.UpdatePasswordResetCode(email, code, expiry)
}

func (s *UserService) VerifyPasswordResetCode(email, code string) error {
	email = strings.ToLower(email)
	user, err := s.repo.FindByEmail(email)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("user not found")
		}
		return err
	}

	if user.PasswordResetCode == "" {
		return errors.New("no password reset code set")
	}

	if user.PasswordResetCode != code {
		return errors.New("invalid reset code")
	}

	if user.PasswordResetExpiry == nil || time.Now().After(*user.PasswordResetExpiry) {
		return errors.New("reset code expired")
	}

	return nil
}

func (s *UserService) ResetPassword(email, code, newPassword string) error {
	email = strings.ToLower(email)
	user, err := s.repo.FindByEmail(email)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("user not found")
		}
		return err
	}

	if user.PasswordResetCode == "" {
		return errors.New("no password reset code set")
	}

	if user.PasswordResetCode != code {
		return errors.New("invalid reset code")
	}

	if user.PasswordResetExpiry == nil || time.Now().After(*user.PasswordResetExpiry) {
		return errors.New("reset code expired")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	return s.repo.UpdatePassword(email, string(hashedPassword))
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
		if existingUser.Provider == models.ProviderLocal {
			// Suggest linking accounts - return error with specific message
			return nil, errors.New("account_exists_local")
		} else if existingUser.Provider != provider {
			// Already linked to another OAuth provider
			return nil, errors.New("account_exists_different_provider")
		}
	}

	// Create new OAuth user
	user = &models.User{
		Email:         email,
		Name:          name,
		Provider:      provider,
		ProviderID:    providerID,
		AvatarURL:     avatarURL,
		Role:          "user",
		EmailVerified: true,
		Password:      nil,
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
