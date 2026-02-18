-- Create summarizer_sessions table for tracking meeting summarization sessions
CREATE TABLE IF NOT EXISTS summarizer_sessions (
    id SERIAL PRIMARY KEY,
    meeting_id INTEGER NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'STARTED',
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_meeting FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_summarizer_sessions_meeting_id ON summarizer_sessions(meeting_id);
CREATE INDEX IF NOT EXISTS idx_summarizer_sessions_status ON summarizer_sessions(status);
