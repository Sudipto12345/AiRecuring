"""
Bedrock token budget guardrail.
Enforces max output token limit to prevent runaway AI costs.
"""
MAX_OUTPUT_TOKENS = 2048
MAX_INPUT_TOKENS = 4096

def apply_budget(body: dict) -> dict:
    """Clamp maxTokens in Bedrock API calls."""
    if 'max_tokens' in body:
        body['max_tokens'] = min(body['max_tokens'], MAX_OUTPUT_TOKENS)
    if 'maxTokens' in body:
        body['maxTokens'] = min(body['maxTokens'], MAX_OUTPUT_TOKENS)
    return body

def estimate_tokens(text: str) -> int:
    """Rough estimate: 1 token ≈ 4 chars."""
    return len(text) // 4
