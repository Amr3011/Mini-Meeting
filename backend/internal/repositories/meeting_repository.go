package repositories

import (
	"mini-meeting/internal/models"

	"gorm.io/gorm"
)

type MeetingRepository struct {
	db *gorm.DB
}

func NewMeetingRepository(db *gorm.DB) *MeetingRepository {
	return &MeetingRepository{db: db}
}

func (r *MeetingRepository) Create(meeting *models.Meeting) error {
	return r.db.Create(meeting).Error
}

func (r *MeetingRepository) FindByID(id uint) (*models.Meeting, error) {
	var meeting models.Meeting
	err := r.db.Preload("Creator").First(&meeting, id).Error
	if err != nil {
		return nil, err
	}
	return &meeting, nil
}

func (r *MeetingRepository) FindByCode(code string) (*models.Meeting, error) {
	var meeting models.Meeting
	err := r.db.Preload("Creator").Where("meeting_code = ?", code).First(&meeting).Error
	if err != nil {
		return nil, err
	}
	return &meeting, nil
}

func (r *MeetingRepository) FindByCreatorID(creatorID uint) ([]models.Meeting, error) {
	var meetings []models.Meeting
	err := r.db.Where("creator_id = ?", creatorID).Order("created_at DESC").Find(&meetings).Error
	return meetings, err
}

func (r *MeetingRepository) FindAll() ([]models.Meeting, error) {
	var meetings []models.Meeting
	err := r.db.Preload("Creator").Order("created_at DESC").Find(&meetings).Error
	return meetings, err
}

func (r *MeetingRepository) Update(meeting *models.Meeting) error {
	return r.db.Save(meeting).Error
}

func (r *MeetingRepository) Delete(id uint) error {
	return r.db.Delete(&models.Meeting{}, id).Error
}

func (r *MeetingRepository) ExistsByCode(code string) (bool, error) {
	var count int64
	err := r.db.Model(&models.Meeting{}).Where("meeting_code = ?", code).Count(&count).Error
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *MeetingRepository) DeleteByCreatorID(creatorID uint) error {
	return r.db.Where("creator_id = ?", creatorID).Delete(&models.Meeting{}).Error
}
