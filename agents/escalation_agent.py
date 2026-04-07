from utils.context import PipelineContext

ESCALATION_RESPONSES = {
    "high": {
        "message": (
            "It sounds like you're going through something really difficult right now. "
            "You don't have to face this alone. Please consider reaching out to "
            "someone who can help."
        ),
        "resources": [
            {
                "name": "iCall (India)",
                "type": "helpline",
                "contact": "9152987821",
                "available": "Mon–Sat, 8am–10pm"
            },
            {
                "name": "Vandrevala Foundation",
                "type": "helpline",
                "contact": "1860-2662-345",
                "available": "24/7"
            },
            {
                "name": "AASRA",
                "type": "helpline",
                "contact": "9820466627",
                "available": "24/7"
            },
            {
                "name": "iCall Chat Support",
                "type": "chat",
                "contact": "icallhelpline.org",
                "available": "Mon–Sat, 8am–10pm"
            }
        ]
    },
    "medium": {
        "message": (
            "It seems like you might be carrying a lot right now. "
            "Talking to someone can really help — you don't have to "
            "figure this out alone."
        ),
        "resources": [
            {
                "name": "iCall (India)",
                "type": "helpline",
                "contact": "9152987821",
                "available": "Mon–Sat, 8am–10pm"
            },
            {
                "name": "Vandrevala Foundation",
                "type": "helpline",
                "contact": "1860-2662-345",
                "available": "24/7"
            }
        ]
    }
}

class EscalationAgent:
    @staticmethod
    def run(ctx: PipelineContext):
        level = ctx.risk_level

        response = ESCALATION_RESPONSES.get(
            level,
            ESCALATION_RESPONSES["medium"]  # default fallback
        )

        ctx.escalation_message = response["message"]
        ctx.escalation_resources = response["resources"]
        ctx.recommendations = []          # explicitly blocked
        ctx.intervention_type = "escalation"