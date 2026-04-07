from utils.context import PipelineContext
from agents.observer_agent import ObserverAgent
from agents.emotion_agent import EmotionAgent
from agents.safety_agent import SafetyAgent
from agents.recommender_agent import RecommenderAgent
from agents.feedback_agent import FeedbackAgent
from agents.learning_agent import LearningAgent
from agents.escalation_agent import EscalationAgent
from memory.history import log_emotion, log_recommendation, get_user_history

observer = ObserverAgent()
feedback_agent = FeedbackAgent()

def run(user_text: str, session_id: str) -> PipelineContext:
    ctx = PipelineContext(raw_input=user_text, session_id=session_id)

    ctx.user_history = get_user_history(session_id)

    observer.run(ctx)

    EmotionAgent.run(ctx)

    SafetyAgent.run(ctx)

    if not ctx.safe_to_proceed:
        EscalationAgent.run(ctx)
        log_emotion(ctx)
        return ctx
    
    RecommenderAgent.run(ctx)
    log_emotion(ctx)
    log_recommendation(ctx)
    
    return ctx

def process_feedback(ctx: PipelineContext, score: int) -> PipelineContext:
    ctx.feedback_score = score
    FeedbackAgent.run(ctx)
    LearningAgent.run(ctx)
    return ctx