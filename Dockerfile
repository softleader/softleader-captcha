FROM node:lts-buster

# https://github.com/Automattic/node-canvas/wiki/Installation%3A-Ubuntu-and-other-Debian-based-systems
RUN apt-get update &&\
    apt-get install -y build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev &&\
    apt-get autoclean

WORKDIR /app

# for docker layer cache
COPY package.json package-lock.json ./
RUN npm install

COPY index.js ./
COPY lib ./lib/

ENTRYPOINT [ "node", "index.js" ]