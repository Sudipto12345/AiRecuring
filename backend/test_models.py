import boto3
from app.core.config import settings

def test_models():
    client = boto3.client(
        'bedrock-runtime',
        region_name=settings.aws_region,
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key
    )
    models_to_test = [
        'anthropic.claude-3-5-sonnet-20241022-v2:0',
        'anthropic.claude-3-sonnet-20240229-v1:0',
        'anthropic.claude-3-7-sonnet-20250219-v1:0'
    ]
    
    for model in models_to_test:
        try:
            print(f"Testing {model}...")
            response = client.invoke_model(
                modelId=model,
                body=b'{"anthropic_version": "bedrock-2023-05-31", "max_tokens": 10, "messages": [{"role": "user", "content": "hi"}]}'
            )
            print(f"  Success! Status code: {response['ResponseMetadata']['HTTPStatusCode']}")
        except Exception as e:
            print(f"  Failed: {e}")

if __name__ == "__main__":
    test_models()
