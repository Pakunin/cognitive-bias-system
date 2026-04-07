EMOTION_SEARCH_TERMS = {
    "sadness":  ["comforting", "healing", "gentle", "uplifting"],
    "anger":    ["calming", "release", "peaceful", "soothing"],
    "fear":     ["reassuring", "grounding", "calm", "safe"],
    "joy":      ["energetic", "happy", "celebratory", "feel good"],
    "disgust":  ["cleansing", "fresh start", "motivating"],
    "surprise": ["exciting", "interesting", "engaging"],
    "neutral":  ["focus", "ambient", "mindful"]
}

INTERVENTION_SEARCH_TERMS = {
    "calming":    "meditation relaxation stress relief",
    "uplifting":  "mood boost positive energy happy",
    "grounding":  "mindfulness breathing grounding anxiety",
    "reflective": "journaling self reflection introspection",
    "engaging":   "focus productivity motivation"
}

def build_query(
    user_text: str,
    emotion: str,
    intervention_type: str,
    media_type: str = "any"
) -> str:
    emotion_terms = EMOTION_SEARCH_TERMS.get(emotion, ["relaxing"])
    intervention_terms = INTERVENTION_SEARCH_TERMS.get(intervention_type, "")
    
    # pick one emotion term to keep query focused
    import random
    emotion_term = random.choice(emotion_terms)
    
    if media_type == "music":
        return f"{emotion_term} music playlist {intervention_terms}"
    elif media_type == "video":
        return f"{emotion_term} {intervention_terms} guide"
    else:
        return f"{emotion_term} {intervention_terms}"