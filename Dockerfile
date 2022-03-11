
FROM node:14.15-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./
RUN npm install pm2 -g
RUN npm install cross-env -g

USER node

#RUN npm i pm2 tedious nodemon cross-env eslint eslint-config-airbnb-base eslint-config-standard eslint-plugin-import eslint-plugin-node eslint-plugin-promise eslint-plugin-standard
RUN npm install

COPY --chown=node:node . .

ENV PORT 5102

ARG DOCKER_ENV
ENV NODE_ENV=${DOCKER_ENV}

CMD [ "npm","run", "production" ]
