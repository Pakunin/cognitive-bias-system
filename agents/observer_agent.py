"""
Observer Agent - Perception & State Formation

This agent:
- Cleans raw input
- Extracts keywords
- Detects intent
- Classifies context
- Extracts emotion hints
- Builds structured state for downstream agents"""


import re
from collections import Counter
from utils.context import PipelineContext

# basic stopwords list (kept lightweight)
STOPWORDS = {
    "i", "am", "is", "are", "was", "were", "the", "a", "an", "and",
    "or", "but", "to", "of", "in", "on", "for", "with", "about",
    "this", "that", "it", "be", "as", "at", "by", "from"
}


class ObserverAgent:
    CONTEXT_KEYWORDS = {
        "academic": ["exam", "study", "college", "assignment", "marks", "grade"],
        "personal": ["family", "friend", "relationship", "life", "home"],
        "financial": ["money", "loan", "salary", "expense", "debt"],
        "health": ["health", "sleep", "tired", "stress", "anxiety"],
        "career": ["job", "internship", "career", "interview", "resume"]
    }

        # Emotion hint keywords
    EMOTION_KEYWORDS = [
        "stress", "anxiety", "confused", "happy", "sad",
        "angry", "overwhelmed", "excited", "worried"
    ]

    # 1. Preprocess Input
    @staticmethod
    def preprocess_input(text: str) -> str:
        text = text.lower()
        text = re.sub(r"[^a-zA-Z\s]", "", text)  # remove punctuation
        text = re.sub(r"\s+", " ", text).strip()
        return text

    # 2. Keyword Extraction
    @staticmethod
    def extract_keywords(text: str):
        words = text.split()
        filtered = [w for w in words if w not in STOPWORDS]
        freq = Counter(filtered)
        keywords = [word for word, _ in freq.most_common(5)]
        return keywords

    # 3. Intent Detection
    @staticmethod
    def detect_intent(text: str) -> str:
        if "?" in text:
            return "question"

        decision_words = ["should", "what to do", "decide", "choose"]
        venting_words = ["tired", "stressed", "fed up", "frustrated"]

        if any(word in text for word in decision_words):
            return "decision"
        elif any(word in text for word in venting_words):
            return "venting"
        else:
            return "mixed"

    # 4. Context Classification
    @staticmethod
    def classify_context(text: str):
        contexts = []

        for context, keywords in ObserverAgent.CONTEXT_KEYWORDS.items():
            if any(word in text for word in keywords):
                contexts.append(context)

        return contexts if contexts else ["general"]

    # 5. Emotion Hint Extraction
    @staticmethod
    def extract_emotion_hints(text: str):
        hints = [word for word in ObserverAgent.EMOTION_KEYWORDS if word in text]
        return hints

    # 6. Confidence Score
    @staticmethod
    def calculate_confidence(keywords, contexts, intent):
        score = 0.0

        # keyword clarity
        score += min(len(keywords) * 0.1, 0.4)

        # context detection
        score += min(len(contexts) * 0.2, 0.4)

        # intent certainty
        if intent != "mixed":
            score += 0.2

        return round(score, 2)

    # 7. Build State
    @staticmethod
    def build_state(text: str):
        clean_text = ObserverAgent.preprocess_input(text)
        keywords = ObserverAgent.extract_keywords(clean_text)
        intent = ObserverAgent.detect_intent(text)  # keep original for '?' detection
        contexts = ObserverAgent.classify_context(clean_text)
        emotion_hints = ObserverAgent.extract_emotion_hints(clean_text)
        confidence = ObserverAgent.calculate_confidence(keywords, contexts, intent)

        return {
            "clean_text": clean_text,
            "keywords": keywords,
            "intent": intent,
            "contexts": contexts,
            "emotion_hints": emotion_hints,
            "confidence_score": confidence
        }

    # Main Public Method
    @staticmethod
    def process(user_input: str) -> dict:
        return ObserverAgent.build_state(user_input)


# # Testing
# if __name__ == "__main__":
#     agent = ObserverAgent()

#     test_input = "I'm really stressed about my exams and don't know what to do"
#     result = agent.process(test_input)

#     from pprint import pprint
#     pprint(result)
    @staticmethod
    def run(ctx: PipelineContext):
        state = ObserverAgent.process(ctx.raw_input)

        ctx.cleaned_text = state["clean_text"]
        ctx.keywords = state["keywords"]
        ctx.context_type = state["contexts"][0] if state["contexts"] else "general"
        ctx.intent = state["intent"]
        ctx.emotion_hints = state["emotion_hints"]
        ctx.observer_confidence = state["confidence_score"]