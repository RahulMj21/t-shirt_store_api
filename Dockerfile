FROM node:alpine
WORKDIR /user/src/backend
COPY package*.json yarn.lock ./
RUN yarn
COPY . .
CMD ["yarn","start"]
