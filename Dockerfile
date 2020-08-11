FROM node:lts-alpine

ENV PORT=80
ENV REDIS_HOST=localhost
ENV REDIS_PORT=6379
ENV REDIS_PASSWORD=""

WORKDIR /app
COPY . .

CMD node index.js serve \
    --redis-host ${REDIS_HOST} \
    --redis-port ${REDIS_PORT} \
    --redos-password ${REDIS_PASSWORD} \
    --port ${PORT}