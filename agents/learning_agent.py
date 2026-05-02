# from memory.db import get_connection
# from utils.context import PipelineContext

# class LearningAgent:

#     @staticmethod
#     def run(ctx: PipelineContext):
#         if not hasattr(ctx, "effectiveness_score"):
#             return ctx

#         if not ctx.recommendations:
#             return ctx

#         rec = ctx.recommendations[0]

#         emotion = ctx.primary_emotion
#         item_type = rec.get("type", "unknown")  # IMPORTANT: should match the db
#         score = ctx.effectiveness_score * 5  # convert to 1–5 scale

#         conn = get_connection()
#         cursor = conn.cursor()

#         # Check existing
#         row = cursor.execute("""
#             SELECT avg_score, total_feedback
#             FROM learning_weights
#             WHERE primary_emotion=? AND item_type=?
#         """, (emotion, item_type)).fetchone()

#         if row:
#             old_avg, count = row

#             new_avg = (old_avg * count + score) / (count + 1)

#             cursor.execute("""
#                 UPDATE learning_weights
#                 SET avg_score=?, total_feedback=?, updated_at=CURRENT_TIMESTAMP
#                 WHERE primary_emotion=? AND item_type=?
#             """, (new_avg, count + 1, emotion, item_type))

#         else:
#             cursor.execute("""
#                 INSERT INTO learning_weights
#                 (primary_emotion, item_type, avg_score, total_feedback)
#                 VALUES (?, ?, ?, 1)
#             """, (emotion, item_type, score))

#         conn.commit()
#         conn.close()

from memory.db import get_connection
from memory.history import log_query_feedback
from utils.context import PipelineContext

class LearningAgent:
    @staticmethod
    def run(ctx: PipelineContext):
        if not ctx.effectiveness_score:
            return
        if not ctx.recommendations:
            return

        rec = ctx.recommendations[0]
        emotion = ctx.primary_emotion
        item_type = rec.get("type", "unknown")
        score = ctx.effectiveness_score * 5
        user_id = ctx.session_id

        # update avg score in learning_weights
        conn = get_connection()
        cursor = conn.cursor()
        row = cursor.execute("""
            SELECT avg_score, total_feedback FROM learning_weights
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

        # log query terms with this feedback score
        # so next session knows which terms led to good/bad results
        if item_type == "video" and hasattr(ctx, "last_video_query_terms"):
            log_query_feedback(
                user_id, emotion, "video",
                ctx.last_video_query_terms,
                ctx.feedback_score
            )
        elif item_type == "music" and hasattr(ctx, "last_music_query_terms"):
            log_query_feedback(
                user_id, emotion, "music",
                ctx.last_music_query_terms,
                ctx.feedback_score
            )