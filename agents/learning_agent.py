from memory.db import get_connection


class LearningAgent:

    def run(self, ctx):
        """
        Reads:
            ctx.primary_emotion
            ctx.recommendations
            ctx.effectiveness_score
        """

        if not hasattr(ctx, "effectiveness_score"):
            return ctx

        if not ctx.recommendations:
            return ctx

        rec = ctx.recommendations[0]

        emotion = ctx.primary_emotion
        item_type = rec.get("id")  # IMPORTANT: should match the db
        score = ctx.effectiveness_score * 5  # convert to 1–5 scale

        conn = get_connection()
        cursor = conn.cursor()

        # Check existing
        row = cursor.execute("""
            SELECT avg_score, total_feedback
            FROM learning_weights
            WHERE primary_emotion=? AND item_type=?
        """, (emotion, item_type)).fetchone()

        if row:
            old_avg, count = row

            new_avg = (old_avg * count + score) / (count + 1)

            cursor.execute("""
                UPDATE learning_weights
                SET avg_score=?, total_feedback=?, updated_at=CURRENT_TIMESTAMP
                WHERE primary_emotion=? AND item_type=?
            """, (new_avg, count + 1, emotion, item_type))

        else:
            cursor.execute("""
                INSERT INTO learning_weights
                (primary_emotion, item_type, avg_score, total_feedback)
                VALUES (?, ?, ?, 1)
            """, (emotion, item_type, score))

        conn.commit()
        conn.close()

        return ctx