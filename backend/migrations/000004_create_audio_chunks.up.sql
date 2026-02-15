-- Create audio_chunks table for tracking audio chunk metadata
CREATE TABLE IF NOT EXISTS audio_chunks (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES summarizer_sessions(id) ON DELETE CASCADE,
    user_identity VARCHAR(255) NOT NULL,
    chunk_index INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    start_timestamp TIMESTAMP NOT NULL,
    end_timestamp TIMESTAMP NOT NULL,
    duration_seconds DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_session FOREIGN KEY (session_id) REFERENCES summarizer_sessions(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_audio_chunks_session_id ON audio_chunks(session_id);
CREATE INDEX idx_audio_chunks_user_identity ON audio_chunks(user_identity);
