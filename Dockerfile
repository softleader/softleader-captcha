FROM node:lts-alpine

ENV PORT=80
ENV REDIS_HOST=localhost
ENV REDIS_PORT=6379
ENV REDIS_PASSWORD=""

RUN apk update & apk add vips

WORKDIR /app
COPY . .

CMD node index.js serve \
    --redis-host ${REDIS_HOST} \
    --redis-port ${REDIS_PORT} \
    --redis-password ${REDIS_PASSWORD} \
    --port ${PORT}