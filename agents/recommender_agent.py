"""
recommender_agent.py

Recommender Agent for the Cognitive Bias Detection System.
Selects personalized debiasing strategies based on detected biases,
emotional state, risk level, and user history.
"""
from __future__ import annotations

import json
import random
import logging
from pathlib import Path
from typing import Optional

from typing import TYPE_CHECKING

# Import only for type checking
if TYPE_CHECKING:
    from utils.context import PipelineContext

class MyClass:
    # Use quotes around the type if not imported at top-level
    def __init__(self, context: "PipelineContext") -> None:                
        self.context = context

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
DATA_DIR = Path(__file__).resolve().parent.parent / "data"
RECOMMENDATIONS_PATH = DATA_DIR / "recommendations.json"


# ---------------------------------------------------------------------------
# Loader
# ---------------------------------------------------------------------------
def _load_recommendations() -> dict:
    """Load the recommendations catalogue from disk."""
    try:
        with open(RECOMMENDATIONS_PATH, "r", encoding="utf-8") as fh:
            return json.load(fh)
    except FileNotFoundError:
        logger.error("recommendations.json not found at %s", RECOMMENDATIONS_PATH)
        return {}
    except json.JSONDecodeError as exc:
        logger.error("Failed to parse recommendations.json: %s", exc)
        return {}


# ---------------------------------------------------------------------------
# Core scoring helpers
# ---------------------------------------------------------------------------
def _score_recommendation(
    rec: dict,
    bias_type: str,
    emotion: str,
    risk_level: str,
    seen_ids: set[str],
) -> float:
    """
    Compute a priority score for a single recommendation entry.

    Scoring factors
    ---------------
    +3.0  – directly targets the detected bias
    +2.0  – suitable for the current primary emotion
    +1.5  – appropriate for the current risk level
    -2.0  – already shown to the user in this session
    ±rand – small noise to break ties and add variety
    """
    score = 0.0

    # Bias match
    target_biases: list[str] = rec.get("target_biases", [])
    if bias_type and bias_type.lower() in [b.lower() for b in target_biases]:
        score += 3.0
    elif "general" in [b.lower() for b in target_biases]:
        score += 0.5

    # Emotion match
    suitable_emotions: list[str] = rec.get("suitable_emotions", [])
    if emotion and emotion.lower() in [e.lower() for e in suitable_emotions]:
        score += 2.0
    elif not suitable_emotions:          # emotion-agnostic recommendations
        score += 1.0

    # Risk level match
    suitable_risk: list[str] = rec.get("suitable_risk_levels", [])
    if risk_level and risk_level.lower() in [r.lower() for r in suitable_risk]:
        score += 1.5
    elif not suitable_risk:
        score += 0.75

    # Penalise repetition within a session
    if rec.get("id") in seen_ids:
        score -= 2.0

    # Small random jitter
    score += random.uniform(0.0, 0.3)

    return score


def _rank_recommendations(
    catalogue: dict,
    bias_type: str,
    emotion: str,
    risk_level: str,
    seen_ids: set[str],
    top_n: int = 3,
) -> list[dict]:
    """Return the top-N scored recommendations from the catalogue."""
    all_recs: list[dict] = []

    # Catalogue may be structured as {"recommendations": [...]} or directly as
    # a list, or as a dict of bias_type → [...] — handle all three.
    if isinstance(catalogue, list):
        all_recs = catalogue
    elif "recommendations" in catalogue:
        all_recs = catalogue["recommendations"]
    else:
        # bias-keyed dict: flatten everything
        for recs in catalogue.values():
            if isinstance(recs, list):
                all_recs.extend(recs)

    if not all_recs:
        logger.warning("Recommendation catalogue is empty.")
        return []

    scored = [
        (
            _score_recommendation(rec, bias_type, emotion, risk_level, seen_ids),
            rec,
        )
        for rec in all_recs
    ]
    scored.sort(key=lambda x: x[0], reverse=True)
    return [rec for _, rec in scored[:top_n]]


# ---------------------------------------------------------------------------
# Fallback
# ---------------------------------------------------------------------------
def _build_fallback_recommendation(bias_type: str) -> dict:
    """Generic recommendation when the catalogue yields nothing useful."""
    return {
        "id": "fallback_001",
        "title": "Pause and Reflect",
        "description": (
            "Take a moment to slow down before making a decision. "
            "Ask yourself: What am I assuming here? What evidence am I ignoring?"
        ),
        "technique": "Cognitive pause",
        "target_biases": ["general"],
        "action_steps": [
            "Write down your current belief or decision.",
            "List three reasons it might be wrong.",
            "Seek one outside perspective before proceeding.",
        ],
        "estimated_time_minutes": 5,
        "difficulty": "easy",
        "source": "fallback",
    }


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
def run_recommender_agent(context: PipelineContext) -> PipelineContext:
    """
    Main entry point called by the orchestrator.

    Reads from context
    ------------------
    context.bias_type        : str  – primary detected cognitive bias
    context.emotion          : str  – primary emotion (from emotion_agent)
    context.risk_level       : str  – 'low' | 'medium' | 'high' (from safety_agent)
    context.seen_rec_ids     : set  – IDs already shown this session (optional)
    context.decision_context : str  – additional decision metadata (optional)

    Writes to context
    -----------------
    context.recommendations  : list[dict]
    context.primary_rec      : dict   – highest-ranked single recommendation
    context.rec_rationale    : str    – human-readable explanation of the choice
    """
    logger.info("RecommenderAgent: starting recommendation selection.")

    # ── Pull inputs from context ──────────────────────────────────────────
    bias_type: str = getattr(context, "bias_type", "") or ""
    emotion: str = getattr(context, "emotion", "") or ""
    risk_level: str = getattr(context, "risk_level", "low") or "low"
    seen_ids: set[str] = getattr(context, "seen_rec_ids", set()) or set()

    logger.debug(
        "Inputs — bias: %s | emotion: %s | risk: %s | seen: %s",
        bias_type, emotion, risk_level, seen_ids,
    )

    # ── Load catalogue ────────────────────────────────────────────────────
    catalogue = _load_recommendations()

    # ── Rank ──────────────────────────────────────────────────────────────
    top_recs = _rank_recommendations(
        catalogue,
        bias_type=bias_type,
        emotion=emotion,
        risk_level=risk_level,
        seen_ids=seen_ids,
        top_n=3,
    )

    if not top_recs:
        logger.warning("No catalogue matches; using fallback recommendation.")
        fallback = _build_fallback_recommendation(bias_type)
        top_recs = [fallback]

    primary_rec = top_recs[0]

    # ── Build rationale ───────────────────────────────────────────────────
    rationale = _build_rationale(primary_rec, bias_type, emotion, risk_level)

    # ── Write back to context ─────────────────────────────────────────────
    context.recommendations = top_recs
    context.primary_rec = primary_rec
    context.rec_rationale = rationale

    # Track shown IDs to avoid repetition in subsequent turns
    if not hasattr(context, "seen_rec_ids") or context.seen_rec_ids is None:
        context.seen_rec_ids = set()
    context.seen_rec_ids.add(primary_rec.get("id", ""))

    logger.info(
        "RecommenderAgent: selected '%s' (id=%s).",
        primary_rec.get("title", "?"),
        primary_rec.get("id", "?"),
    )
    return context


def _build_rationale(
    rec: dict,
    bias_type: str,
    emotion: str,
    risk_level: str,
) -> str:
    """Compose a short, user-facing explanation for why this recommendation was chosen."""
    parts: list[str] = []

    if bias_type:
        parts.append(f"a detected **{bias_type}** bias")
    if emotion:
        parts.append(f"your current emotional state (**{emotion}**)")
    if risk_level and risk_level != "low":
        parts.append(f"the **{risk_level}** risk level of this decision")

    if parts:
        context_str = ", ".join(parts)
        return (
            f"Based on {context_str}, the recommended strategy is "
            f"**{rec.get('title', 'the following technique')}**. "
            f"{rec.get('description', '')}"
        )
    return (
        f"The recommended strategy is **{rec.get('title', 'the following technique')}**. "
        f"{rec.get('description', '')}"
    )


# ---------------------------------------------------------------------------
# Standalone helper — useful for testing / CLI introspection
# ---------------------------------------------------------------------------
def get_recommendations_for(
    bias_type: str,
    emotion: str = "",
    risk_level: str = "low",
    seen_ids: Optional[set] = None,
    top_n: int = 3,
) -> list[dict]:
    """
    Stateless helper that returns ranked recommendations without a full
    PipelineContext — handy for unit tests and the CLI.
    """
    catalogue = _load_recommendations()
    return _rank_recommendations(
        catalogue,
        bias_type=bias_type,
        emotion=emotion,
        risk_level=risk_level,
        seen_ids=seen_ids or set(),
        top_n=top_n,
    )
