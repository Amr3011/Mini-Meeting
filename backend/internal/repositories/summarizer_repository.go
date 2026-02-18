package repositories

import (
	"mini-meeting/internal/models"
	"time"

	"gorm.io/gorm"
)

type SummarizerRepository struct {
	db *gorm.DB
}

func NewSummarizerRepository(db *gorm.DB) *SummarizerRepository {
	return &SummarizerRepository{db: db}
}

// Session operations

func (r *SummarizerRepository) CreateSession(session *models.SummarizerSession) error {
	return r.db.Create(session).Error
}

func (r *SummarizerRepository) FindSessionByID(id uint) (*models.SummarizerSession, error) {
	var session models.SummarizerSession
	err := r.db.Preload("Meeting").First(&session, id).Error
	if err != nil {
		return nil, err
	}
	return &session, nil
}

func (r *SummarizerRepository) FindActiveSessionByMeetingID(meetingID uint) (*models.SummarizerSession, error) {
	var session models.SummarizerSession
	err := r.db.Where("meeting_id = ? AND status = ?", meetingID, models.StatusStarted).
		First(&session).Error
	if err != nil {
		return nil, err
	}
	return &session, nil
}

func (r *SummarizerRepository) UpdateSessionStatus(id uint, status models.SummarizerSessionStatus, error *string, endedAt *time.Time) error {
	updates := map[string]interface{}{
		"status":     status,
		"updated_at": time.Now(),
	}
	if error != nil {
		updates["error"] = error
	}
	if endedAt != nil {
		updates["ended_at"] = endedAt
	}
	return r.db.Model(&models.SummarizerSession{}).Where("id = ?", id).Updates(updates).Error
}

func (r *SummarizerRepository) FindSessionsByMeetingID(meetingID uint) ([]models.SummarizerSession, error) {
	var sessions []models.SummarizerSession
	err := r.db.Where("meeting_id = ?", meetingID).Order("created_at DESC").Find(&sessions).Error
	return sessions, err
}

func (r *SummarizerRepository) FindStuckSessions(status models.SummarizerSessionStatus, cutoffTime time.Time) ([]models.SummarizerSession, error) {
	var sessions []models.SummarizerSession
	err := r.db.Where("status = ? AND updated_at < ?", status, cutoffTime).Find(&sessions).Error
	return sessions, err
}

// Audio chunk operations

func (r *SummarizerRepository) CreateAudioChunk(chunk *models.AudioChunk) error {
	return r.db.Create(chunk).Error
}

func (r *SummarizerRepository) FindChunksBySessionID(sessionID uint) ([]models.AudioChunk, error) {
	var chunks []models.AudioChunk
	err := r.db.Where("session_id = ?", sessionID).
		Order("user_identity ASC, chunk_index ASC").
		Find(&chunks).Error
	return chunks, err
}

func (r *SummarizerRepository) FindChunksBySessionAndUser(sessionID uint, userIdentity string) ([]models.AudioChunk, error) {
	var chunks []models.AudioChunk
	err := r.db.Where("session_id = ? AND user_identity = ?", sessionID, userIdentity).
		Order("chunk_index ASC").
		Find(&chunks).Error
	return chunks, err
}

func (r *SummarizerRepository) CountChunksBySessionID(sessionID uint) (int64, error) {
	var count int64
	err := r.db.Model(&models.AudioChunk{}).Where("session_id = ?", sessionID).Count(&count).Error
	return count, err
}

func (r *SummarizerRepository) DeleteChunksBySessionID(sessionID uint) error {
	return r.db.Where("session_id = ?", sessionID).Delete(&models.AudioChunk{}).Error
}

// Transcript operations

func (r *SummarizerRepository) CreateTranscript(transcript *models.Transcript) error {
	return r.db.Create(transcript).Error
}

func (r *SummarizerRepository) FindTranscriptsBySessionID(sessionID uint) ([]models.Transcript, error) {
	var transcripts []models.Transcript
	err := r.db.Where("session_id = ?", sessionID).Order("start_time ASC").Find(&transcripts).Error
	return transcripts, err
}

func (r *SummarizerRepository) DeleteTranscriptsBySessionID(sessionID uint) error {
	return r.db.Where("session_id = ?", sessionID).Delete(&models.Transcript{}).Error
}

func (r *SummarizerRepository) UpdateSessionTranscript(id uint, transcript string) error {
	return r.db.Model(&models.SummarizerSession{}).Where("id = ?", id).Update("transcript", transcript).Error
}

func (r *SummarizerRepository) UpdateSessionSummary(id uint, summary string) error {
	return r.db.Model(&models.SummarizerSession{}).Where("id = ?", id).Update("summary", summary).Error
}
