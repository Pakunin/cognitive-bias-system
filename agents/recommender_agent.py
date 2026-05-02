# from models.youtube_model import search_videos
# from models.spotify_model import search_playlists
# from utils.query_builder import build_query
# from utils.context import PipelineContext
# import logging

# logger = logging.getLogger(__name__)

# class RecommenderAgent:
#     @staticmethod
#     def run(ctx: PipelineContext):
#         recommendations = []

#         # build queries
#         video_query = build_query(
#             ctx.cleaned_text,
#             ctx.primary_emotion,
#             ctx.intervention_type,
#             media_type="video"
#         )
#         music_query = build_query(
#             ctx.cleaned_text,
#             ctx.primary_emotion,
#             ctx.intervention_type,
#             media_type="music"
#         )

#         # fetch from YouTube
#         try:
#             videos = search_videos(video_query, max_results=2)
#             recommendations.extend(videos)
#         except Exception as e:
#             logger.error(f"YouTube search failed: {e}")

#         # fetch from Spotify
#         try:
#             playlists = search_playlists(music_query, max_results=2)
#             recommendations.extend(playlists)
#         except Exception as e:
#             logger.error(f"Spotify search failed: {e}")

#         # fallback if both fail
#         if not recommendations:
#             logger.warning("All API searches failed — using fallback.")
#             recommendations = [{
#                 "id": "fallback_001",
#                 "title": "Take a mindful break",
#                 "type": "activity",
#                 "description": "Step away for 5 minutes. Breathe slowly.",
#                 "url": "",
#                 "duration": "5 mins"
#             }]

#         ctx.recommendations = recommendations
#         ctx.primary_rec = recommendations[0]

from models.youtube_model import search_videos
from models.spotify_model import search_playlists
from utils.query_builder import build_query
from memory.history import (
    get_good_query_terms, get_bad_query_terms, log_query_feedback
)
from utils.context import PipelineContext
import logging

logger = logging.getLogger(__name__)

class RecommenderAgent:
    @staticmethod
    def run(ctx: PipelineContext):
        recommendations = []
        user_prefs = ctx.user_prefs        # loaded by orchestrator from survey
        user_id = ctx.session_id           # use session_id as user_id for now

        # get learned terms from past feedback
        good_video_terms = get_good_query_terms(user_id, ctx.primary_emotion, "video")
        good_music_terms = get_good_query_terms(user_id, ctx.primary_emotion, "music")
        bad_video_terms = get_bad_query_terms(user_id, ctx.primary_emotion, "video")
        bad_music_terms = get_bad_query_terms(user_id, ctx.primary_emotion, "music")

        video_query = build_query(
            ctx.cleaned_text,
            ctx.primary_emotion,
            ctx.intervention_type,
            media_type="video",
            user_prefs=user_prefs,
            learned_terms=good_video_terms
        )

        music_query = build_query(
            ctx.cleaned_text,
            ctx.primary_emotion,
            ctx.intervention_type,
            media_type="music",
            user_prefs=user_prefs,
            learned_terms=good_music_terms
        )

        # store queries on ctx so LearningAgent can log them
        ctx.last_video_query_terms = video_query.split()
        ctx.last_music_query_terms = music_query.split()

        logger.info(f"[Recommender] Video query: {video_query}")
        logger.info(f"[Recommender] Music query: {music_query}")

        try:
            videos = search_videos(video_query, max_results=2)
            # filter out bad terms from results
            videos = [
                v for v in videos
                if not any(
                    bad in v.get("title", "").lower()
                    for bad in bad_video_terms
                )
            ]
            recommendations.extend(videos)
        except Exception as e:
            logger.error(f"YouTube search failed: {e}")

        try:
            playlists = search_playlists(music_query, max_results=2)
            playlists = [
                p for p in playlists
                if not any(
                    bad in p.get("title", "").lower()
                    for bad in bad_music_terms
                )
            ]
            recommendations.extend(playlists)
        except Exception as e:
            logger.error(f"Spotify search failed: {e}")

        if not recommendations:
            recommendations = [{
                "id": "fallback_001",
                "title": "Take a mindful break",
                "type": "activity",
                "description": "Step away for 5 minutes. Breathe slowly.",
                "url": "",
                "duration": "5 mins"
            }]

        ctx.recommendations = recommendations
        ctx.primary_rec = recommendations[0]