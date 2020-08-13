FROM node:lts-alpine

# https://github.com/Automattic/node-canvas/issues/866
RUN apk update &&\
    apk add --no-cache build-base g++ cairo-dev jpeg-dev pango-dev giflib-dev curl &&\
    apk add --repository http://dl-3.alpinelinux.org/alpine/edge/testing libmount ttf-dejavu ttf-droid ttf-freefont ttf-liberation ttf-ubuntu-font-family fontconfig &&\
    rm -rf /var/cache/apk/*

WORKDIR /app

# for docker layer cache
COPY package*.json ./
RUN npm install

COPY index.js ./
COPY lib ./lib/

ENTRYPOINT [ "node", "index.js" ]