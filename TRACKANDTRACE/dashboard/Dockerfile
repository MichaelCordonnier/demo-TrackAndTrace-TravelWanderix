# Step 1: Build the application with Node.js
FROM node:20.11.0 AS builder

ARG VITE_HTTP_URL_BACKEND
ARG VITE_WS_URL_BACKEND
ARG VITE_MAPBOX_ACCESS_TOKEN

ENV VITE_HTTP_URL_BACKEND=$VITE_HTTP_URL_BACKEND
ENV VITE_WS_URL_BACKEND=$VITE_WS_URL_BACKEND
ENV VITE_MAPBOX_ACCESS_TOKEN=$VITE_MAPBOX_ACCESS_TOKEN


WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the application source code
COPY . .

# Build the application
RUN npm run build


# Step 2: Serve the application with Nginx
FROM nginx:1.21.3

# Remove default Nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy the build output from the builder stage to Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

