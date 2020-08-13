swarm:
  captcha:
    restart: always
    image: softleader/captcha:${TAG}
    command: ["serve", "--redis-host=redis", "--redis-port=6379", "--redis-password=${REDIS_PASSWORD}"]
    ports:
      - "${CAPTCHA_PORT}:80"
    deploy:
      resources:
        limits:
          memory: 50M
          cpus: '0.1'
k8s:
