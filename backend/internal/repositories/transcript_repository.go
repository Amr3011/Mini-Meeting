package repositories

import (
	"mini-meeting/internal/models"

	"gorm.io/gorm"
)

type TranscriptRepository struct {
	db *gorm.DB
}

func NewTranscriptRepository(db *gorm.DB) *TranscriptRepository {
	return &TranscriptRepository{db: db}
}

func (r *TranscriptRepository) Create(transcript *models.Transcript) error {
	return r.db.Create(transcript).Error
}

func (r *TranscriptRepository) FindBySessionID(sessionID uint) ([]models.Transcript, error) {
	var transcripts []models.Transcript
	err := r.db.Where("session_id = ?", sessionID).Order("start_time ASC").Find(&transcripts).Error
	return transcripts, err
}

func (r *TranscriptRepository) DeleteBySessionID(sessionID uint) error {
	return r.db.Where("session_id = ?", sessionID).Delete(&models.Transcript{}).Error
}
