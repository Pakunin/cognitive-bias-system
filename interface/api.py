# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# from pipeline.orchestrator import run, process_feedback
# from memory.history import (
#     create_session, save_user_preferences,
#     get_user_preferences, get_user_history
# )
# from memory.db import init_db

# app = FastAPI()

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:3000"],  # Next.js dev server
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# @app.on_event("startup")
# def startup():
#     init_db()

# # --- Auth (simple, no JWT for now) ---
# class SignupRequest(BaseModel):
#     name: str
#     email: str
#     password: str

# class LoginRequest(BaseModel):
#     email: str
#     password: str

# @app.post("/auth/signup")
# def signup(body: SignupRequest):
#     session_id = create_session()
#     return {
#         "user_id": session_id,
#         "name": body.name,
#         "email": body.email
#     }

# @app.post("/auth/login")
# def login(body: LoginRequest):
#     # simple mock — replace with real auth later
#     session_id = create_session()
#     return {
#         "user_id": session_id,
#         "name": "User",
#         "email": body.email
#     }

# # --- Onboarding survey ---
# class PreferencesRequest(BaseModel):
#     user_id: str
#     music_genres: list[str] = []
#     video_topics: list[str] = []
#     avoid_topics: list[str] = []
#     content_language: str = "english"
#     intervention_horizon: str = "short_term"
#     energy_preference: str = "any"

# @app.post("/preferences")
# def save_preferences(body: PreferencesRequest):
#     save_user_preferences(body.user_id, body.dict())
#     return {"status": "saved"}

# @app.get("/preferences/{user_id}")
# def get_preferences(user_id: str):
#     prefs = get_user_preferences(user_id)
#     return prefs

# # --- Main pipeline ---
# class AnalyzeRequest(BaseModel):
#     user_id: str
#     text: str

# @app.post("/analyze")
# def analyze(body: AnalyzeRequest):
#     ctx = run(body.text, body.user_id)

#     if not ctx.safe_to_proceed:
#         return {
#             "safe_to_proceed": False,
#             "escalation_message": ctx.escalation_message,
#             "escalation_resources": ctx.escalation_resources,
#         }

#     return {
#         "safe_to_proceed": True,
#         "primary_emotion": ctx.primary_emotion,
#         "confidence": ctx.confidence,
#         "secondary_emotions": ctx.secondary_emotions,
#         "valence": ctx.valence,
#         "energy_level": ctx.energy_level,
#         "intervention_type": ctx.intervention_type,
#         "recommendations": ctx.recommendations,
#     }

# # --- Feedback ---
# class FeedbackRequest(BaseModel):
#     user_id: str
#     score: int
#     recommendations: list[dict]
#     primary_emotion: str
#     intervention_type: str

# @app.post("/feedback")
# def feedback(body: FeedbackRequest):
#     from utils.context import PipelineContext
#     from dataclasses import field

#     ctx = PipelineContext(
#         session_id=body.user_id,
#         primary_emotion=body.primary_emotion,
#         intervention_type=body.intervention_type,
#         recommendations=body.recommendations,
#         feedback_score=body.score
#     )
#     process_feedback(ctx, body.score)
#     return {"status": "ok", "effectiveness": ctx.effectiveness_score}

# # --- History ---
# @app.get("/history/{user_id}")
# def history(user_id: str):
#     entries = get_user_history(user_id)
#     return {"history": entries}

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import hashlib
import uuid

from pipeline.orchestrator import run, process_feedback
from memory.history import (
    create_session, save_user_preferences,
    get_user_preferences, get_user_history
)
from memory.db import get_connection, init_db

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()
    _init_users_table()

def _init_users_table():
    conn = get_connection()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    conn.commit()
    conn.close()

def _hash(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


# --- Auth ---
class SignupRequest(BaseModel):
    username: str
    password: str

class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/auth/signup")
def signup(body: SignupRequest):
    if len(body.username.strip()) < 3:
        raise HTTPException(400, detail="Username must be at least 3 characters.")
    if len(body.password) < 6:
        raise HTTPException(400, detail="Password must be at least 6 characters.")

    conn = get_connection()
    existing = conn.execute(
        "SELECT user_id FROM users WHERE username = ?", (body.username.lower(),)
    ).fetchone()

    if existing:
        conn.close()
        return {"error": "Username already taken. Please choose another."}

    user_id = str(uuid.uuid4())
    conn.execute(
        "INSERT INTO users (user_id, username, password_hash) VALUES (?, ?, ?)",
        (user_id, body.username.lower(), _hash(body.password))
    )
    # also create a session entry
    conn.execute("INSERT INTO sessions (session_id) VALUES (?)", (user_id,))
    conn.commit()
    conn.close()

    return {"user_id": user_id, "name": body.username}

@app.post("/auth/login")
def login(body: LoginRequest):
    conn = get_connection()
    row = conn.execute(
        "SELECT user_id, username FROM users WHERE username = ? AND password_hash = ?",
        (body.username.lower(), _hash(body.password))
    ).fetchone()
    conn.close()

    if not row:
        return {"error": "Incorrect username or password."}

    return {"user_id": row["user_id"], "name": row["username"]}


# --- Preferences ---
class PreferencesRequest(BaseModel):
    user_id: str
    music_genres: list = []
    video_topics: list = []
    avoid_topics: list = []
    preferred_content: list = []
    content_language: str = "english"
    intervention_horizon: str = "short_term"
    energy_preference: str = "any"
    age_group: str = ""
    gender: str = ""

@app.post("/preferences")
def save_prefs(body: PreferencesRequest):
    save_user_preferences(body.user_id, body.dict())
    return {"status": "saved"}

@app.get("/preferences/{user_id}")
def get_prefs(user_id: str):
    return get_user_preferences(user_id)


# --- Main pipeline ---
class AnalyzeRequest(BaseModel):
    user_id: str
    text: str

@app.post("/analyze")
def analyze(body: AnalyzeRequest):
    ctx = run(body.text, body.user_id)

    if not ctx.safe_to_proceed:
        return {
            "safe_to_proceed": False,
            "escalation_message": ctx.escalation_message,
            "escalation_resources": ctx.escalation_resources,
        }

    return {
        "safe_to_proceed": True,
        "primary_emotion": ctx.primary_emotion,
        "confidence": ctx.confidence,
        "secondary_emotions": ctx.secondary_emotions,
        "valence": ctx.valence,
        "energy_level": ctx.energy_level,
        "intervention_type": ctx.intervention_type,
        "recommendations": ctx.recommendations,
    }


# --- Feedback ---
class FeedbackRequest(BaseModel):
    user_id: str
    score: int
    recommendations: list
    primary_emotion: str
    intervention_type: str = ""

@app.post("/feedback")
def feedback(body: FeedbackRequest):
    from utils.context import PipelineContext
    ctx = PipelineContext(
        session_id=body.user_id,
        primary_emotion=body.primary_emotion,
        intervention_type=body.intervention_type,
        recommendations=body.recommendations,
        feedback_score=body.score
    )
    process_feedback(ctx, body.score)
    return {"status": "ok", "effectiveness": ctx.effectiveness_score}


# --- History ---
@app.get("/history/{user_id}")
def history(user_id: str):
    entries = get_user_history(user_id)
    return {"history": entries}
