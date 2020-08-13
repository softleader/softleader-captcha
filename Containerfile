swarm:
  captcha:
    restart: always
    image: softleader/captcha:1.0.0
    command: ["serve", "--redis-host=redis", "--redis-port=6379", "--redis-password=${REDIS_PASSWORD}"]
    ports:
      - "${CAPTCHA_PORT}:80"
    deploy:
      resources:
        limits:
          memory: 50M
          cpus: '0.1'
    healthcheck:
      test: [“CMD”, “curl”, “--fail”, “127.0.0.1:80/healthcheck”]
      interval: 10s
      timeout: 5s
      retries: 3
      start_period: 10s
k8s:
