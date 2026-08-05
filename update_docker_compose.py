import re
with open("docker-compose.prod.yml", "r") as f:
    content = f.read()

# Add redis-sentinel service after redis service
sentinel_yaml = """  redis-sentinel:
    image: bitnami/redis-sentinel:latest
    container_name: airecruit-redis-sentinel
    environment:
      - REDIS_MASTER_HOST=redis
      - REDIS_MASTER_PORT_NUMBER=6379
      - REDIS_MASTER_SET=mymaster
      - REDIS_SENTINEL_QUORUM=1
    ports:
      - "26379:26379"
    networks:
      - airecruit-network
    depends_on:
      redis:
        condition: service_healthy

"""
content = re.sub(r'(  redis:\n.*?start_period: 5s\n)', r'\1\n' + sentinel_yaml, content, flags=re.DOTALL)

# Update backend REDIS_URL
content = content.replace("REDIS_URL: redis://redis:6379/0", "REDIS_URL: sentinel://redis-sentinel:26379/mymaster/0")

# Update backend replicas and ports
backend_match = re.search(r'  backend:\n.*?ports:\n      - "8000:8000"', content, flags=re.DOTALL)
if backend_match:
    backend_new = backend_match.group(0).replace('    container_name: airecruit-backend-prod', '    deploy:\n      replicas: 3')
    # If we use replicas, container_name usually conflicts so we remove it.
    backend_new = backend_new.replace('    ports:\n      - "8000:8000"', '    ports:\n      - "8001-8003:8000"')
    content = content.replace(backend_match.group(0), backend_new)

with open("docker-compose.prod.yml", "w") as f:
    f.write(content)
