from memory.db import init_db
from memory.history import create_session
from pipeline.orchestrator import run, process_feedback
from interface.cli import start

# def main():
#     init_db()   # ensures DB exists
#     session_id = create_session()
    
#     print("\nEmotion-Aware Recommendation System")
#     print("Type 'quit' to exit\n")

#     while True:
#         user_input = input("How are you feeling? ").strip()

#         if user_input.lower() in ('quit', 'exit'):
#             print('Take care.')
#             break

#         if not user_input:
#             continue

#         # later your pipeline runs here
#         ctx = run(user_input, session_id)

#         # escalation path
#         if not ctx.safe_to_proceed:
#             print(f"\n{ctx.escalation_message}\n")
#             print("Resources:")
#             for r in ctx.escalation_resources:
#                 print(f" {r['name']} — {r['contact']} ({r['available']})")
#             print()
#             continue

#         # emotion result
#         print(f"\nEmotion detected: {ctx.primary_emotion} "
#               f"({ctx.confidence:.0%} confidence)")
#         if ctx.secondary_emotions:
#             print(f"Also detected:    {', '.join(ctx.secondary_emotions)}")
#         print(f"Valence:          {ctx.valence} | Energy: {ctx.energy_level}")

#         # show recommendations
#         print("\nRecommendations for you:\n")
#         for i, rec in enumerate(ctx.recommendations, 1):
#             print(f"  {i}. [{rec.get('type', '').upper()}] {rec['title']}")
#             print(f"     {rec.get('description', '')[:100]}")
#             if rec.get("url"):
#                 print(f"     Link: {rec['url']}")
#             print()

#         # collect feedback
#         try:
#             raw = input("Did this help? Rate 1-5 (or press Enter to skip): ").strip()
#             if raw:
#                 score = int(raw)
#                 if 1 <= score <= 5:
#                     process_feedback(ctx, score)
#                     print(f"Thanks for the feedback!\n")
#                 else:
#                     print("Rating must be between 1 and 5.\n")
#         except ValueError:
#             print("Skipping feedback.\n")

if __name__ == "__main__":
    init_db()
    start()