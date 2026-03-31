import re
from models.safety_model import score
from utils.context import PipelineContext

HIGH_RISK_KEYWORDS = [
    "kill myself", "want to die", "end my life", "suicide",
    "can't go on", "no reason to live", "better off dead",
    "want to disappear", "end it all", "harm myself",
    "self harm", "cut myself", "don't want to exist"
]

MEDIUM_RISK_KEYWORDS = [
    "hopeless", "worthless", "nobody cares", "all alone",
    "can't cope", "falling apart", "breaking down", "give up",
    "what's the point", "nothing matters", "exhausted",
    "can't take it anymore", "feel empty", "numb"
]

TOXIC_THRESHOLD = 0.80

class SafetyAgent:
    @staticmethod
    def _keyword_check(text: str) -> tuple[str, list]:
        triggered = []

        for phrase in HIGH_RISK_KEYWORDS:
            if phrase in text:
                triggered.append(phrase)

        if triggered:
            return "high", triggered
        
        for phrase in MEDIUM_RISK_KEYWORDS:
            if phrase in text:
                triggered.append(phrase)

        if triggered:
            return "medium", triggered
        
        return "low", []
    
    @staticmethod
    def _model_check(text: str) -> tuple[str, list]:
        scores = score(text)
        toxic_score = scores.get("toxic", 0.0)

        if toxic_score >= TOXIC_THRESHOLD:
            return "high", [f"toxic-bert score: {toxic_score:.2f}"]
        elif toxic_score >= 0.50:
            return "medium", [f"toxic-bert score: {toxic_score:.2f}"]
        
        return "low", []
    
    @staticmethod
    def run(ctx: PipelineContext):
        text = ctx.cleaned_text

        keyword_risk, keyword_signals = SafetyAgent._keyword_check(text)

        if keyword_risk == "high":
            ctx.risk_level = "high"
            ctx.safe_to_proceed = False
            ctx.triggered_signals = keyword_signals
            return
        
        model_risk, model_signals = SafetyAgent._model_check(text)

        all_signals = keyword_signals + model_signals

        risk_priority = {"low": 0, "medium": 1, "high": 2}
        final_risk = max(keyword_risk, model_risk, key=lambda r: risk_priority[r])

        ctx.risk_level = final_risk
        ctx.triggered_signals = all_signals
        ctx.safe_to_proceed = final_risk != "high"