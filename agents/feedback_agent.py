from memory.history import update_feedback


class FeedbackAgent:

    def __init__(self):
        self.emotion_valence = {
            "joy": 0.9, "trust": 0.7, "anticipation": 0.6,
            "surprise": 0.5, "neutral": 0.5,
            "fear": 0.3, "sadness": 0.2,
            "disgust": 0.2, "anger": 0.3
        }

    def run(self, ctx):
        """
        Reads:
            ctx.primary_emotion
            ctx.feedback_score (int 1–5)
            ctx.recommendations (list)
        Writes:
            ctx.effectiveness_score (float)
        """

        if ctx.feedback_score is None:
            return ctx  # nothing to process

        # Assume last recommendation was given
        last_rec = ctx.recommendations[0] if ctx.recommendations else None
        if not last_rec:
            return ctx

        item_id = last_rec.get("id")

        # 1. Normalize rating
        rating_score = ctx.feedback_score / 5

        # 2. Assume emotion improved slightly if rating >=3
        delta = 0.2 if ctx.feedback_score >= 3 else -0.2

        # 3. Simple effectiveness
        effectiveness = (0.7 * rating_score + 0.3 * (0.5 + delta))

        # 4. Store feedback in DB
        update_feedback(ctx.session_id, item_id, ctx.feedback_score)

        # 5. Attach to context
        ctx.effectiveness_score = round(effectiveness, 3)

        return ctx