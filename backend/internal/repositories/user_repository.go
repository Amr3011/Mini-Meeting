package repositories

import (
	"mini-meeting/internal/models"
	"time"

	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(user *models.User) error {
	return r.db.Create(user).Error
}

func (r *UserRepository) FindByID(id uint) (*models.User, error) {
	var user models.User
	err := r.db.First(&user, id).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) FindByEmail(email string) (*models.User, error) {
	var user models.User
	err := r.db.Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) FindAllPaginated(page, pageSize int, search string) ([]models.User, int64, error) {
	var users []models.User
	var total int64

	// Build query
	query := r.db.Model(&models.User{})

	// Apply search filter if provided
	if search != "" {
		searchPattern := "%" + search + "%"
		query = query.Where("name ILIKE ? OR email ILIKE ?", searchPattern, searchPattern)
	}

	// Count total users with filter
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Calculate offset
	offset := (page - 1) * pageSize

	// Fetch paginated users
	err := query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&users).Error
	if err != nil {
		return nil, 0, err
	}

	return users, total, nil
}

func (r *UserRepository) Update(user *models.User) error {
	return r.db.Save(user).Error
}

func (r *UserRepository) Delete(id uint) error {
	return r.db.Delete(&models.User{}, id).Error
}

func (r *UserRepository) UpdateVerificationCode(email, code string, expiry time.Time) error {
	return r.db.Model(&models.User{}).
		Where("email = ?", email).
		Updates(VerificationCodeUpdate{
			VerificationCode:       code,
			VerificationCodeExpiry: &expiry,
		}).Error
}

func (r *UserRepository) VerifyEmail(email string) error {
	return r.db.Model(&models.User{}).
		Where("email = ?", email).
		Updates(EmailVerificationUpdate{
			EmailVerified:          true,
			VerificationCode:       "",
			VerificationCodeExpiry: nil,
		}).Error
}

func (r *UserRepository) UpdatePasswordResetCode(email, code string, expiry time.Time) error {
	return r.db.Model(&models.User{}).
		Where("email = ?", email).
		Updates(PasswordResetCodeUpdate{
			PasswordResetCode:   code,
			PasswordResetExpiry: &expiry,
		}).Error
}

func (r *UserRepository) UpdatePassword(email, hashedPassword string) error {
	return r.db.Model(&models.User{}).
		Where("email = ?", email).
		Updates(PasswordUpdate{
			Password:            hashedPassword,
			PasswordResetCode:   "",
			PasswordResetExpiry: nil,
		}).Error
}

func (r *UserRepository) FindByProvider(provider models.Provider, providerID string) (*models.User, error) {
	var user models.User
	err := r.db.Where("provider = ? AND provider_id = ?", provider, providerID).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) FindByEmailAndProvider(email string, provider models.Provider) (*models.User, error) {
	var user models.User
	err := r.db.Where("email = ? AND provider = ?", email, provider).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) UpdateProviderInfo(userID uint, provider models.Provider, providerID string, avatarURL string) error {
	return r.db.Model(&models.User{}).
		Where("id = ?", userID).
		Updates(ProviderInfoUpdate{
			Provider:   provider,
			ProviderID: providerID,
			AvatarURL:  avatarURL,
		}).Error
}

// Update structs for type safety
type VerificationCodeUpdate struct {
	VerificationCode       string     `gorm:"column:verification_code"`
	VerificationCodeExpiry *time.Time `gorm:"column:verification_code_expiry"`
}

type EmailVerificationUpdate struct {
	EmailVerified          bool       `gorm:"column:email_verified"`
	VerificationCode       string     `gorm:"column:verification_code"`
	VerificationCodeExpiry *time.Time `gorm:"column:verification_code_expiry"`
}

type PasswordResetCodeUpdate struct {
	PasswordResetCode   string     `gorm:"column:password_reset_code"`
	PasswordResetExpiry *time.Time `gorm:"column:password_reset_expiry"`
}

type PasswordUpdate struct {
	Password            string     `gorm:"column:password"`
	PasswordResetCode   string     `gorm:"column:password_reset_code"`
	PasswordResetExpiry *time.Time `gorm:"column:password_reset_expiry"`
}

type ProviderInfoUpdate struct {
	Provider   models.Provider `gorm:"column:provider"`
	ProviderID string          `gorm:"column:provider_id"`
	AvatarURL  string          `gorm:"column:avatar_url"`
}
