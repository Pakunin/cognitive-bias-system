from transformers import pipeline

_classifier = None

def get_classifier():
    global _classifier
    if _classifier is None:
        print("[SafetyModel] Loading model...")
        _classifier = pipeline(
            "text-classification",
            model="unitary/toxic-bert",
            top_k=None
        )
        print("[SafetyModel] Model loaded.")
    return _classifier

def score(text: str) -> dict:
    classifier = get_classifier()
    results = classifier(text)

    if isinstance(results[0], list):
        results = results[0]

    scores = {item["label"].lower(): item["score"] for item in results}
    return scores