from utils.context import PipelineContext
from agents.observer_agent import ObserverAgent
from agents.emotion_agent import EmotionAgent
from agents.safety_agent import SafetyAgent
from agents.recommender_agent import RecommenderAgent
from agents.feedback_agent import FeedbackAgent
from agents.learning_agent import LearningAgent
from agents.escalation_agent import EscalationAgent
from memory.history import log_emotion, log_recommendation, get_user_history, get_learning_weights, get_user_preferences

observer = ObserverAgent()
feedback_agent = FeedbackAgent()

EMOTION_TO_INTERVENTION = {
    "sadness":  "uplifting",
    "anger":    "calming",
    "fear":     "grounding",
    "disgust":  "uplifting",
    "joy":      "engaging",
    "surprise": "engaging",
    "neutral":  "reflective"
}

def run(user_text: str, session_id: str) -> PipelineContext:
    ctx = PipelineContext(raw_input=user_text, session_id=session_id)
    ctx.user_history = get_user_history(session_id)
    ctx.learning_weights = get_learning_weights(session_id)
    ctx.user_prefs = get_user_preferences(session_id)  # add this

    observer.run(ctx)
    EmotionAgent.run(ctx)
    SafetyAgent.run(ctx)

    if not ctx.safe_to_proceed:
        EscalationAgent.run(ctx)
        log_emotion(ctx)
        return ctx

    ctx.intervention_type = EMOTION_TO_INTERVENTION.get(
        ctx.primary_emotion, "reflective"
    )

    RecommenderAgent.run(ctx)
    log_emotion(ctx)
    log_recommendation(ctx)

    return ctx

def process_feedback(ctx: PipelineContext, score: int) -> PipelineContext:
    ctx.feedback_score = score
    FeedbackAgent.run(ctx)
    LearningAgent.run(ctx)
    return ctx