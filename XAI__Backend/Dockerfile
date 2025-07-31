FROM node:lts as  node-image

WORKDIR /app

COPY package.json /app/

RUN npm install -g nodemon

ARG NODE_ENV

RUN npm install

COPY . ./

CMD ["npm", "run","start-dev"]
