from dataclasses import dataclass, field
from typing import Optional

@dataclass
class PipelineContext:
    # set at pipeline start
    raw_input: str = ""
    session_id: str = ""
            
    # observer agent writes these
    cleaned_text: str = ""
    keywords: list = field(default_factory=list)
    context_type: str = "general"          # general | journal | distress
    intent: str = "mixed"
    emotion_hints: list = field(default_factory=list)
    observer_confidence: float = 0.0

    # emotion agent writes these
    primary_emotion: str = ""
    secondary_emotions: list = field(default_factory=list)
    confidence: float = 0.0
    valence: str = "neutral"               # positive | negative | neutral
    energy_level: str = "medium"           # low | medium | high

    # safety agent writes these
    risk_level: str = "low"                # low | medium | high
    safe_to_proceed: bool = True
    triggered_signals: list = field(default_factory=list)

    # decision agent writes this
    intervention_type: str = ""

    # recommender agent writes these
    recommendations: list = field(default_factory=list)

    # escalation agent writes these
    escalation_message: str = ""
    escalation_resources: list = field(default_factory=list)

    # feedback agent writes this
    feedback_score: Optional[int] = None