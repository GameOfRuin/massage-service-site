# BUILD
FROM node:22-alpine AS build

RUN apk add --no-cache git

WORKDIR /srv/app

COPY . .

RUN touch .env
RUN touch .npmrc

RUN npm ci
RUN npm install --os=linux --libc=musl --cpu=x64 sharp
RUN npm run build
RUN npm run test || true

# BACKEND
FROM node:22-alpine as backend
#ENV NODE_ENV=production

RUN apk --update --no-cache add dumb-init bash curl nano ffmpeg

WORKDIR /usr/src/app

COPY --from=build --chown=node /srv/app/package*.json /srv/app/dist/ /srv/app/.env /srv/app/.npmrc .
COPY --from=build --chown=node /srv/app/src/migrations/sql ./migrations/sql
COPY --from=build --chown=node /srv/app/public ./public

RUN npm ci
RUN npm prune

EXPOSE 80

USER node
