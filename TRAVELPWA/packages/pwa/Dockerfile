# syntax = docker/dockerfile:1.0-experimental

###################
# BUILD STAGE
###################

FROM node:20 AS build-stage
WORKDIR /usr/src/app

COPY --chown=root:root package*.json ./
COPY --chown=root:root packages/pwa/package*.json ./packages/pwa/

RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm i --ignore-scripts

# COPY, make sure that /env.production.local is copied as well. Is it excluded from dockerignore?
COPY --chown=root:root packages/pwa packages/pwa

USER root
RUN npm run build -w @advanced-full-stack-development/pwa

# ###################
# # PRODUCTION STAGE
# ###################

FROM nginx AS production-stage
RUN mkdir /app
COPY --from=build-stage /usr/src/app/packages/pwa/dist /app

COPY nginx.conf /etc/nginx/nginx.conf
