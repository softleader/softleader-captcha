swarm:
  captcha:
    restart: always
    image: softleader/captcha:1.0.1
    command: ["serve", "--redis-host=redis", "--redis-port=6379", "--redis-password=${REDIS_PASSWORD}"]
    ports:
      - "${CAPTCHA_PORT}:80"
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: '1'
k8s:
