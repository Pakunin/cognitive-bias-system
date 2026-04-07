import re
from models.safety_model import score
from utils.context import PipelineContext

HIGH_RISK_KEYWORDS = [
    "kill myself", "want to die", "end my life", "suicide", "suicidal"
    "can't go on", "no reason to live", "better off dead",
    "want to disappear", "end it all", "harm myself",
    "self harm", "cut myself", "don't want to exist"
]

HIGH_RISK_PATTERNS = [
    r"end(ing)?\s+(my|this)\s+life",
    r"kill(ing)?\s+my(self)?",
    r"take\s+my\s+(own\s+)?life",
    r"(want|thinking)\s+(to|about)\s+(die|dying|suicide|ending)",
    r"(no|don'?t)\s+(want|reason)\s+to\s+(live|exist|be here)",
    r"better\s+off\s+(dead|gone|without me)",
    r"(harm|hurt)\s+my(self)?",
    r"wish\s+i\s+(was|were)\s+dead",
]

MEDIUM_RISK_KEYWORDS = [
    "hopeless", "worthless", "nobody cares", "all alone",
    "can't cope", "falling apart", "breaking down", "give up",
    "what's the point", "nothing matters", "exhausted",
    "can't take it anymore", "feel empty", "numb"
]

MEDIUM_RISK_PATTERNS = [
    r"(feel|feeling)\s+(hopeless|worthless|empty|numb)",
    r"can'?t\s+(cope|go on|take it|bear it)",
    r"(give|giving)\s+up",
    r"(no|nothing)\s+(point|matters|left)",
    r"(falling|breaking)\s+(apart|down)",
    r"(all\s+)?alone",
]

TOXIC_THRESHOLD = 0.80

class SafetyAgent:
    @staticmethod
    def _keyword_check(text: str) -> tuple[str, list]:
        triggered = []

        for phrase in HIGH_RISK_KEYWORDS:
            if phrase in text:
                triggered.append(phrase)
        
        for pattern in HIGH_RISK_PATTERNS:
            match = re.search(pattern, text)
            if match:
                triggered.append(match.group())

        if triggered:
            return "high", list(set(triggered))
        
        for phrase in MEDIUM_RISK_KEYWORDS:
            if phrase in text:
                triggered.append(phrase)

        for pattern in MEDIUM_RISK_PATTERNS:
            match = re.search(pattern, text)
            if match: 
                triggered.append(match.group())

        if triggered:
            return "medium", list(set(triggered))
        
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