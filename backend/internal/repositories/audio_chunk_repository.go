package repositories

import (
	"mini-meeting/internal/models"

	"gorm.io/gorm"
)

type AudioChunkRepository struct {
	db *gorm.DB
}

func NewAudioChunkRepository(db *gorm.DB) *AudioChunkRepository {
	return &AudioChunkRepository{db: db}
}

func (r *AudioChunkRepository) Create(chunk *models.AudioChunk) error {
	return r.db.Create(chunk).Error
}

func (r *AudioChunkRepository) FindBySessionID(sessionID uint) ([]models.AudioChunk, error) {
	var chunks []models.AudioChunk
	err := r.db.Where("session_id = ?", sessionID).
		Order("user_identity ASC, chunk_index ASC").
		Find(&chunks).Error
	return chunks, err
}

func (r *AudioChunkRepository) FindBySessionAndUser(sessionID uint, userIdentity string) ([]models.AudioChunk, error) {
	var chunks []models.AudioChunk
	err := r.db.Where("session_id = ? AND user_identity = ?", sessionID, userIdentity).
		Order("chunk_index ASC").
		Find(&chunks).Error
	return chunks, err
}

func (r *AudioChunkRepository) CountBySessionID(sessionID uint) (int64, error) {
	var count int64
	err := r.db.Model(&models.AudioChunk{}).Where("session_id = ?", sessionID).Count(&count).Error
	return count, err
}

func (r *AudioChunkRepository) DeleteBySessionID(sessionID uint) error {
	return r.db.Where("session_id = ?", sessionID).Delete(&models.AudioChunk{}).Error
}
