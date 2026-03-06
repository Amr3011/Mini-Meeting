package repositories

import (
	"mini-meeting/internal/models"
	"time"

	"gorm.io/gorm"
)

type SummarizerSessionRepository struct {
	db *gorm.DB
}

func NewSummarizerSessionRepository(db *gorm.DB) *SummarizerSessionRepository {
	return &SummarizerSessionRepository{db: db}
}

func (r *SummarizerSessionRepository) Create(session *models.SummarizerSession) error {
	return r.db.Create(session).Error
}

func (r *SummarizerSessionRepository) FindByID(id uint) (*models.SummarizerSession, error) {
	var session models.SummarizerSession
	err := r.db.Preload("Meeting").First(&session, id).Error
	if err != nil {
		return nil, err
	}
	return &session, nil
}

func (r *SummarizerSessionRepository) FindActiveByMeetingID(meetingID uint) (*models.SummarizerSession, error) {
	var session models.SummarizerSession
	err := r.db.Where("meeting_id = ? AND status = ?", meetingID, models.StatusStarted).
		First(&session).Error
	if err != nil {
		return nil, err
	}
	return &session, nil
}

func (r *SummarizerSessionRepository) UpdateStatus(id uint, status models.SummarizerSessionStatus, sessionError *string, endedAt *time.Time) error {
	updates := map[string]interface{}{
		"status":     status,
		"updated_at": time.Now(),
	}
	if sessionError != nil {
		updates["error"] = sessionError
	}
	if endedAt != nil {
		updates["ended_at"] = endedAt
	}
	return r.db.Model(&models.SummarizerSession{}).Where("id = ?", id).Updates(updates).Error
}

func (r *SummarizerSessionRepository) FindByMeetingID(meetingID uint) ([]models.SummarizerSession, error) {
	var sessions []models.SummarizerSession
	err := r.db.Where("meeting_id = ?", meetingID).Order("created_at DESC").Find(&sessions).Error
	return sessions, err
}

func (r *SummarizerSessionRepository) FindStuck(status models.SummarizerSessionStatus, cutoffTime time.Time) ([]models.SummarizerSession, error) {
	var sessions []models.SummarizerSession
	err := r.db.Where("status = ? AND updated_at < ?", status, cutoffTime).Find(&sessions).Error
	return sessions, err
}

func (r *SummarizerSessionRepository) FindAllByUserIDPaginated(userID uint, page, pageSize int) ([]models.SummarizerSession, int64, error) {
	var sessions []models.SummarizerSession
	var total int64

	query := r.db.Model(&models.SummarizerSession{}).Where("user_id = ?", userID)

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	err := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&sessions).Error
	if err != nil {
		return nil, 0, err
	}

	return sessions, total, nil
}

func (r *SummarizerSessionRepository) Delete(id uint) error {
	return r.db.Delete(&models.SummarizerSession{}, id).Error
}

func (r *SummarizerSessionRepository) UpdateTranscript(id uint, transcript string) error {
	return r.db.Model(&models.SummarizerSession{}).Where("id = ?", id).Update("transcript", transcript).Error
}

func (r *SummarizerSessionRepository) UpdateSummary(id uint, summary string) error {
	return r.db.Model(&models.SummarizerSession{}).Where("id = ?", id).Update("summary", summary).Error
}
