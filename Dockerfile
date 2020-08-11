FROM node:lts-buster

RUN apt-get update &&\
    apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev 

ENV PORT=80
ENV REDIS_HOST=localhost
ENV REDIS_PORT=6379
ENV REDIS_PASSWORD=""

WORKDIR /app

# for docker layer cache
COPY package.json package-lock.json ./
RUN npm install

COPY index.js ./
COPY lib ./lib/

CMD node index.js serve \
    --redis-host ${REDIS_HOST} \
    --redis-port ${REDIS_PORT} \
    --redis-password ${REDIS_PASSWORD} \
    --port ${PORT}