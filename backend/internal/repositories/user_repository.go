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

func (r *UserRepository) FindAll() ([]models.User, error) {
	var users []models.User
	err := r.db.Find(&users).Error
	return users, err
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
		Updates(map[string]interface{}{
			"verification_code":        code,
			"verification_code_expiry": expiry,
		}).Error
}

func (r *UserRepository) VerifyEmail(email string) error {
	return r.db.Model(&models.User{}).
		Where("email = ?", email).
		Updates(map[string]interface{}{
			"email_verified":           true,
			"verification_code":        "",
			"verification_code_expiry": nil,
		}).Error
}

func (r *UserRepository) UpdatePasswordResetCode(email, code string, expiry time.Time) error {
	return r.db.Model(&models.User{}).
		Where("email = ?", email).
		Updates(map[string]interface{}{
			"password_reset_code":   code,
			"password_reset_expiry": expiry,
		}).Error
}

func (r *UserRepository) UpdatePassword(email, hashedPassword string) error {
	return r.db.Model(&models.User{}).
		Where("email = ?", email).
		Updates(map[string]interface{}{
			"password":              hashedPassword,
			"password_reset_code":   "",
			"password_reset_expiry": nil,
		}).Error
}
