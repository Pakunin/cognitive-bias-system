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

def log_recommendation(ctx):
    if not ctx.recommendations:
        return
    conn = get_connection()
    for item in ctx.recommendations:
        conn.execute("""
            INSERT INTO recommendations
            (session_id, primary_emotion, intervention_type, 
            item_id, item_type, item_title)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (
            ctx.session_id,
            ctx.primary_emotion,
            ctx.intervention_type,
            item.get("id") or item.get("title", "unknown"),
            item.get("type", "unknown"),
            item.get("title", "unknown")
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

def save_user_preferences(user_id: str, prefs: dict):
    import json
    conn = get_connection()
    conn.execute("""
        INSERT INTO user_preferences 
        (user_id, music_genres, video_topics, 
        avoid_topics, content_language, 
        intervention_horizon, energy_preference)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(user_id) DO UPDATE SET
            music_genres=excluded.music_genres,
            video_topics=excluded.video_topics,
            avoid_topics=excluded.avoid_topics,
            content_language=excluded.content_language,
            intervention_horizon=excluded.intervention_horizon,
            energy_preference=excluded.energy_preference
            
        """, (
            user_id,
            json.dumps(prefs.get("music_genres", [])),
            json.dumps(prefs.get("video_topics", [])),
            json.dumps(prefs.get("avoid_topics", [])),
            prefs.get("content_language", "english"),
            prefs.get("intervention_horizon", "short_term"),
            prefs.get("energy_preference", "any")
        ))
    conn.commit()
    conn.close()
    
def get_user_preferences(user_id: str) -> dict:
    import json
    conn = get_connection()
    row = conn.execute("""
        SELECT * FROM user_preferences WHERE user_id = ?
    """, (user_id,)).fetchone()
    conn.close()
    
    if not row:
        return {}
    
    return {
        "music_genres": json.loads(row["music_genres"] or "[]"),
        "video_topics": json.loads(row["video_topics"] or "[]"),
        "avoid_topics": json.loads(row["avoid_topics"] or "[]"),
        "content_language": row["content_language"],
        "intervention_horizon": row["intervention_horizon"],
        "energy_preference": row["energy_preference"]
    }
    
def log_query_feedback(user_id: str, emotion: str, 
                        media_type: str, query_terms: list, score: int):
    import json
    conn = get_connection()
    conn.execute("""
        INSERT INTO query_learning 
        (user_id, emotion, media_type, query_terms, feedback_score)
        VALUES (?, ?, ?, ?, ?)
    """, (user_id, emotion, media_type, json.dumps(query_terms), score))
    conn.commit()
    conn.close()

def get_good_query_terms(user_id: str, emotion: str, media_type: str) -> list:
    """Returns terms from queries that scored >= 4"""
    import json
    conn = get_connection()
    rows = conn.execute("""
        SELECT query_terms FROM query_learning
        WHERE user_id = ? AND emotion = ? 
        AND media_type = ? AND feedback_score >= 4
        ORDER BY created_at DESC
        LIMIT 5
    """, (user_id, emotion, media_type)).fetchall()
    conn.close()

    good_terms = []
    for row in rows:
        terms = json.loads(row["query_terms"])
        good_terms.extend(terms)

    # return unique terms sorted by frequency
    from collections import Counter
    counted = Counter(good_terms)
    return [term for term, _ in counted.most_common(3)]

def get_bad_query_terms(user_id: str, emotion: str, media_type: str) -> list:
    """Returns terms from queries that scored <= 2"""
    import json
    conn = get_connection()
    rows = conn.execute("""
        SELECT query_terms FROM query_learning
        WHERE user_id = ? AND emotion = ?
        AND media_type = ? AND feedback_score <= 2
        ORDER BY created_at DESC
        LIMIT 5
    """, (user_id, emotion, media_type)).fetchall()
    conn.close()

    bad_terms = []
    for row in rows:
        terms = json.loads(row["query_terms"])
        bad_terms.extend(terms)

    from collections import Counter
    counted = Counter(bad_terms)
    return [term for term, _ in counted.most_common(3)]

def get_learning_weights(session_id: str) -> dict:
    conn = get_connection()
    rows = conn.execute("""
        SELECT lw.primary_emotion, lw.item_type, lw.avg_score
        FROM learning_weights lw
        INNER JOIN sessions s ON s.session_id = ?
        WHERE lw.total_feedback > 0
        ORDER BY lw.avg_score DESC
    """, (session_id,)).fetchall()
    conn.close()
    
    weights = {}
    for row in rows:
        weights[(row["primary_emotion"], row["item_type"])] = row["avg_score"]
    return weights