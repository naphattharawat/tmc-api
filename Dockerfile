FROM keymetrics/pm2:latest-alpine

LABEL maintainer="NongMinty <nutsuke.m@gmail.com>"

WORKDIR /home/eoc-api/eoc-api

RUN npm i npm@latest -g 

RUN  apk add --no-cache --virtual deps \
    python \
    build-base

COPY . .

RUN npm i

RUN npm run build

CMD  ["pm2-runtime","start","process.json"] 

EXPOSE 3012