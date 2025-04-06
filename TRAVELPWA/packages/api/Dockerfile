# syntax = docker/dockerfile:1.0-experimental

###################
# BUILD FOR LOCAL DEVELOPMENT
###################

# FROM node:20-alpine as development ### werkt niet voor python, dus hier de full version
FROM node:20 AS development

WORKDIR /usr/src/app

#copy from the root monorepo folder
COPY --chown=node:node package*.json ./
COPY --chown=node:node packages/api/package*.json ./packages/api/

RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm i

COPY --chown=node:node packages/api ./packages/api

USER node

# ###################
# # BUILD FOR PRODUCTION
# ###################
FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY --chown=node:node package*.json ./

# In order to run `npm run build` we need access to the Nest CLI which is a dev dependency. In the previous development stage we ran `npm ci` which installed all dependencies, so we can copy over the node_modules directory from the development image
COPY --chown=node:node --from=development /usr/src/app/node_modules ./node_modules

COPY --chown=node:node packages/api packages/api

RUN npm run build -w @advanced-full-stack-development/api

ENV NODE_ENV production
# Running `npm ci` removes the existing node_modules directory and passing in --only=production ensures that only the production dependencies are installed. This ensures that the node_modules directory is as optimized as possible
RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm i --only=production --ignore-scripts && npm cache clean --force

USER node


# ###################
# # PRODUCTION
# ###################

FROM node:20-alpine AS production
WORKDIR /usr/src/app

# Copy the bundled code from the build stage to the production image
COPY --chown=node:node --from=build /usr/src/app/node_modules ./node_modules
COPY --chown=node:node --from=build /usr/src/app/packages/api/dist ./packages/api/dist

# Start the server using the production build
CMD [ "node", "packages/api/dist/main.js" ]
