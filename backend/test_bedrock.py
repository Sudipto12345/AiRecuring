import asyncio
from app.services.bedrock import bedrock_service
from app.core.config import settings

async def main():
    print("Settings Model:", settings.aws_bedrock_model)
    print("Bedrock Available:", bedrock_service.is_available())
    if bedrock_service.is_available():
        print("Client loaded successfully")
        try:
            # Let's do a simple generate
            response = bedrock_service._client.invoke_model(
                modelId=settings.aws_bedrock_model,
                body=b'{"anthropic_version": "bedrock-2023-05-31", "max_tokens": 10, "messages": [{"role": "user", "content": "Hello"}]}'
            )
            print("Invoke successful, response code:", response.get('ResponseMetadata', {}).get('HTTPStatusCode'))
        except Exception as e:
            print("Error invoking model:", e)
    else:
        print("Bedrock is NOT available (missing boto3 or credentials)")

if __name__ == "__main__":
    asyncio.run(main())
