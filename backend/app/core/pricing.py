"""AI model pricing and credit conversion.

Costs are USD per 1K tokens (input, output). 1 credit == settings.credit_usd_per_credit.
Only real paid model calls incur cost; heuristic / local operations are free.
"""

import math

# model -> (usd_per_1k_input, usd_per_1k_output)
PRICING: dict[str, tuple[float, float]] = {
    "gpt-4o-mini": (0.00015, 0.0006),
    "gpt-4o": (0.0025, 0.01),
    "gpt-4.1": (0.002, 0.008),
    "gpt-4.1-mini": (0.0004, 0.0016),
    "text-embedding-3-small": (0.00002, 0.0),
    "text-embedding-3-large": (0.00013, 0.0),
}

DEFAULT_PRICE = (0.0005, 0.0015)


def usd_cost(model: str, input_tokens: int = 0, output_tokens: int = 0) -> float:
    inp, out = PRICING.get(model, DEFAULT_PRICE)
    return (input_tokens / 1000.0) * inp + (output_tokens / 1000.0) * out


def usd_to_credits(usd: float, per_credit: float) -> int:
    if usd <= 0 or per_credit <= 0:
        return 0
    return max(1, math.ceil(usd / per_credit))
