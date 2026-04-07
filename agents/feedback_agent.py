from memory.history import update_feedback
from utils.context import PipelineContext


class FeedbackAgent:

    EMOTION_VALENCE = {
        "joy": 0.9, "trust": 0.7, "anticipation": 0.6,
        "surprise": 0.5, "neutral": 0.5,
        "fear": 0.3, "sadness": 0.2,
        "disgust": 0.2, "anger": 0.3
    }

    @staticmethod
    def run(ctx: PipelineContext):
        if ctx.feedback_score is None:
            return

        # assumes last recommendation was given
        last_rec = ctx.recommendations[0] if ctx.recommendations else None
        if not last_rec:
            return

        item_id = (
            last_rec.get("id") or
            last_rec.get("video_id") or
            last_rec.get("title", "unknown")
        )

        # 1. Normalize rating
        rating_score = ctx.feedback_score / 5

        # 2. Assume emotion improved slightly if rating >=3
        delta = 0.2 if ctx.feedback_score >= 3 else -0.2

        # 3. Simple effectiveness
        effectiveness = round(0.7 * rating_score + 0.3 * (0.5 + delta), 3)

        # 4. Store feedback in DB
        update_feedback(ctx.session_id, item_id, ctx.feedback_score)

        # 5. Attach to context
        ctx.effectiveness_score = round(effectiveness, 3)
