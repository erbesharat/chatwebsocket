FROM node:11-alpine

RUN mkdir /app

WORKDIR /app

ADD . .

ENV PORT=4000
ENV DB_USER=Erfan
ENV DB_PASS=34uxwp7Mco7
ENV DB_HOST=185.211.57.185
ENV DB_NAME=WellinnoApiDBTestWebsocket

EXPOSE ${PORT}

RUN yarn && \
  yarn compile

CMD [ "yarn", "start" ]