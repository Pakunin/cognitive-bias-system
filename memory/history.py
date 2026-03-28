import json
import uuid
from memory.db import get_connection

def create_session() -> str:
    session_id = str(uuid.uuid4())
    conn = get_connection()
    conn.execute("INSERT INTO sessions (session_id) VALUES (?)", (session_id,))
    conn.commit()
    conn.close()
    return session_id

def log_emotion(ctx):
    conn = get_connection()
    conn.execute("""
        INSERT INTO emotion_logs 
        (session_id, raw_text, cleaned_text, primary_emotion, 
         secondary_emotions, confidence, valence, context_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        ctx.session_id,
        ctx.raw_input,
        ctx.cleaned_text,
        ctx.primary_emotion,
        json.dumps(ctx.secondary_emotions),
        ctx.confidence,
        ctx.valence,
        ctx.context_type
    ))
    conn.commit()
    conn.close()

def log_recommendation(ctx, item):
    conn = get_connection()
    conn.execute("""
        INSERT INTO recommendations
        (session_id, primary_emotion, intervention_type, 
         item_id, item_type, item_title)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        ctx.session_id,
        ctx.primary_emotion,
        ctx.intervention_type,
        item["id"],
        item["type"],
        item["title"]
    ))
    conn.commit()
    conn.close()

def update_feedback(session_id: str, item_id: str, score: int):
    conn = get_connection()
    conn.execute("""
        UPDATE recommendations 
        SET feedback_score = ?
        WHERE session_id = ? AND item_id = ?
    """, (score, session_id, item_id))
    conn.commit()
    conn.close()

def get_user_history(session_id: str) -> list:
    conn = get_connection()
    rows = conn.execute("""
        SELECT primary_emotion, item_id, item_type, feedback_score
        FROM recommendations
        WHERE session_id = ?
        ORDER BY created_at DESC
        LIMIT 20
    """, (session_id,)).fetchall()
    conn.close()
    return [dict(row) for row in rows]