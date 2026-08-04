import boto3
from app.core.config import settings

def list_models():
    client = boto3.client(
        'bedrock',
        region_name=settings.aws_region,
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key
    )
    response = client.list_foundation_models()
    models = response['modelSummaries']
    anthropic_models = [m['modelId'] for m in models if 'anthropic' in m['providerName'].lower()]
    print("Anthropic Models:", anthropic_models)

if __name__ == "__main__":
    list_models()
