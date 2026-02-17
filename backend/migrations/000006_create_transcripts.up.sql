CREATE TABLE transcripts (
    id SERIAL PRIMARY KEY,
    session_id INTEGER NOT NULL REFERENCES summarizer_sessions(id) ON DELETE CASCADE,
    user_identity TEXT NOT NULL,
    text TEXT NOT NULL,
    start_time DOUBLE PRECISION NOT NULL,
    end_time DOUBLE PRECISION NOT NULL,
    chunk_id INTEGER REFERENCES audio_chunks(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transcripts_session_id ON transcripts(session_id);
CREATE INDEX idx_transcripts_user_identity ON transcripts(user_identity);
