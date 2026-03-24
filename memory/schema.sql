CREATE TABLE IF NOT EXISTS sessions (
    session_id TEXT PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS emotion_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    raw_text TEXT,
    cleaned_text TEXT,
    primary_emotion TEXT,
    secondary_emotions TEXT,
    confidence REAL,
    valence TEXT,
    context_type TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);

CREATE TABLE IF NOT EXISTS recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT,
    primary_emotion TEXT,
    intervention_type TEXT,
    item_id TEXT,
    item_type TEXT,
    item_title TEXT,
    feedback_score INTEGER DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(session_id)
);

CREATE TABLE IF NOT EXISTS learning_weights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    primary_emotion TEXT,
    item_type TEXT,
    avg_score REAL DEFAULT 3.0,
    total_feedback INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(primary_emotion, item_type)
);