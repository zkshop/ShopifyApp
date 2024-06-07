# syntax=docker/dockerfile:1

# Base image
FROM node:18.19.1-slim as base

LABEL fly_launch_runtime="Node.js"

# Set working directory
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Install build dependencies
FROM base as build

RUN apt-get update -qq && apt-get install --no-install-recommends -y \
  build-essential \
  node-gyp \
  pkg-config \
  python-is-python3

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --include=dev

# Copy the rest of the application code
COPY . .

# Ensure esbuild and vite are up-to-date
RUN npm install esbuild@latest vite@latest

# Define build argument and environment variable
ARG SHOPIFY_API_KEY
ENV SHOPIFY_API_KEY=${SHOPIFY_API_KEY}

# Build the frontend
WORKDIR /app/web/frontend
RUN SHOPIFY_API_KEY=${SHOPIFY_API_KEY} npm install --legacy-peer-deps
RUN SHOPIFY_API_KEY=${SHOPIFY_API_KEY} npm run build

# Remove development dependencies
WORKDIR /app
RUN npm prune --omit=dev

# Final stage
FROM base

# Copy built application from the build stage
COPY --from=build /app /app

# Set environment variable for runtime
ENV SHOPIFY_API_KEY=${SHOPIFY_API_KEY}

# Expose port
EXPOSE 3000

# Start the server
CMD ["node", "web/index.js"]