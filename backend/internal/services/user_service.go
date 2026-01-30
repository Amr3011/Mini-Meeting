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
	repo *repositories.UserRepository
}

func NewUserService(repo *repositories.UserRepository) *UserService {
	return &UserService{repo: repo}
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
		Password: req.Password, // Password should already be hashed by caller
		Name:     req.Name,
		Role:     "user", // Always create as regular user
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
	if req.Email != "" {
		if user.EmailVerified {
			return nil, errors.New("cannot update email after verification")
		}
		user.Email = strings.ToLower(req.Email)
	}
	if req.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			return nil, err
		}
		user.Password = string(hashedPassword)
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
