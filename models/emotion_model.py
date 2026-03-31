from transformers import pipeline

_classifier = None

def get_classifier():
    global _classifier
    if _classifier is None:
        print("[EmotionModel] Loading model...")
        _classifier = pipeline(
            "text-classification",
            model="j-hartmann/emotion-english-distilroberta-base",
            return_all_scores=True,
            top_k=None
        )
        print("[EmotionModel] Model loaded.")
    return _classifier

def classify(text: str) -> list:
    classifier = get_classifier()
    results = classifier(text)

    if isinstance(results[0], list):
        return results[0]
    return results