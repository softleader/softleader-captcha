swarm:
  captcha:
    restart: always
    image: softleader/softleader-captcha:1.0.0
    ports:
      - "${CAPTCHA_PORT}:80"
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '1'
    environment:
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - REDIS_PASSWORD=${REDIS_PASSWORD}
k8s: