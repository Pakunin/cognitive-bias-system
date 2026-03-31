import json
import os
from models.emotion_model import classify
from utils.context import PipelineContext

def _load_emotion_mapping():
    path = os.path.join(os.path.dirname(__file__), "../data/emotion_mapping.json")
    with open(path, "r") as f:
        return json.load(f)

EMOTION_MAPPING = _load_emotion_mapping()

class EmotionAgent:
    @staticmethod
    def run(ctx: PipelineContext):
        raw_scores = classify(ctx.cleaned_text)

        # sort by score descending
        sorted_scores = sorted(raw_scores, key=lambda x: x["score"], reverse=True)

        # primary emotion
        primary = sorted_scores[0]
        primary_label = primary["label"].lower()
        primary_score = primary["score"]

        # secondary emotions — anything above 0.10 threshold, excluding primary
        secondary = [
            item["label"].lower()
            for item in sorted_scores[1:]
            if item["score"] > 0.10
        ]

        # look up plutchik mapping
        mapping = EMOTION_MAPPING.get(primary_label, {
            "plutchik": primary_label,
            "valence": "neutral",
            "energy": "medium"
        })

        ctx.primary_emotion = mapping["plutchik"]
        ctx.confidence = round(primary_score, 4)
        ctx.secondary_emotions = secondary
        ctx.valence = mapping["valence"]
        ctx.energy_level = mapping["energy"]