from pipeline.orchestrator import run, process_feedback
from memory.history import create_session
import os 
from transformers.utils import logging

def display_emotion(ctx):
    print(f"\n{'─'*40}")
    print(f"Emotion:   {ctx.primary_emotion.upper()} ({ctx.confidence:.0%} confidence)")
    if ctx.secondary_emotions:
        print(f"Also:      {', '.join(ctx.secondary_emotions)}")
    print(f"Valence:   {ctx.valence} | Energy: {ctx.energy_level}")
    print(f"{'─'*40}")

def display_recommendations(ctx):
    print("\nHere's what we recommend:\n")
    for i, rec in enumerate(ctx.recommendations, 1):
        media_type = rec.get("type", "").upper()
        title = rec.get("title", "Unknown")
        description = rec.get("description", "")[:100]
        url = rec.get("url", "")
        duration = rec.get("duration", "")

        print(f"  {i}. [{media_type}] {title}")
        if description:
            print(f"     {description}")
        if url:
            print(f"     Link: {url}")
        if duration:
            print(f"     Duration: {duration}")
        print()

def display_escalation(ctx):
    print(f"\n{'─'*40}")
    print(ctx.escalation_message)
    print(f"\nResources that can help:\n")
    for r in ctx.escalation_resources:
        print(f"  {r['name']}")
        print(f"  {r['contact']} | {r['available']}")
        print()
    print(f"{'─'*40}\n")

def get_feedback() -> int | None:
    try:
        raw = input("Did this help? Rate 1-5 (Enter to skip): ").strip()
        if not raw:
            return None
        score = int(raw)
        if 1 <= score <= 5:
            return score
        print("Please enter a number between 1 and 5.")
        return None
    except ValueError:
        return None

def start():
    session_id = create_session()

    os.environ["TRANSFORMERS_VERBOSITY"] = "error"
    os.environ["HF_HUB_DISABLE_PROGRESS_BARS"] = "1"

    logging.set_verbosity_error()

    print("\n" + "═"*40)
    print("  Emotion-Aware Recommendation System")
    print("═"*40)
    print("Type 'quit' to exit\n")

    while True:
        try:
            user_input = input("How are you feeling? → ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nTake care.")
            break

        if not user_input:
            continue

        if user_input.lower() in ("quit", "exit", "q"):
            print("\nTake care.")
            break

        # run pipeline
        ctx = run(user_input, session_id)

        # escalation path
        if not ctx.safe_to_proceed:
            display_escalation(ctx)
            continue

        # show results
        display_emotion(ctx)
        display_recommendations(ctx)

        # collect feedback
        score = get_feedback()
        if score:
            process_feedback(ctx, score)
            print(f"Thanks for the feedback!\n")