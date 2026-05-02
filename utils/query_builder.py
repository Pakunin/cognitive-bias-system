import random

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
    media_type: str = "any",
    user_prefs: dict = None,
    learned_terms: list = None
) -> str:
    emotion_terms = EMOTION_SEARCH_TERMS.get(emotion, ["relaxing"])
    intervention_terms = INTERVENTION_SEARCH_TERMS.get(intervention_type, "mindful")
    emotion_term = random.choice(emotion_terms)
    
    # base query
    if media_type == "music":
        base = f"{emotion_term} music {intervention_terms}"
    elif media_type == "video":
        base = f"{emotion_term} {intervention_terms}"
    else:
        base = f"{emotion_term} {intervention_terms}"

    if not user_prefs:
        return base
    
    parts = [base]
    
    # adding customizations to query
    if media_type == "music":
        genres = user_prefs.get("music_genres", [])
        if genres:
            parts.append(random.choice(genres))  # add one genre term

    if media_type == "video":
        topics = user_prefs.get("video_topics", [])
        if topics:
            parts.append(random.choice(topics))  # add one topic term

    language = user_prefs.get("content_language", "english")
    if language != "any":
        parts.append(language)

    horizon = user_prefs.get("intervention_horizon", "short_term")
    if horizon == "short_term":
        parts.append("short")
    
    # add learned good terms
    if learned_terms:
        parts.extend(learned_terms[:2])  # max 2 learned terms

    query = " ".join(parts)
    return query
    