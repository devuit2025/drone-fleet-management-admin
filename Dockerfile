# ----------------------
# Stage 1: Development
# ----------------------
FROM node:18-alpine AS dev

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy all source files
COPY . .

# Expose Vite default dev port
EXPOSE 5173

# Default command for dev
CMD ["npm", "run", "dev"]

# ----------------------
# Stage 2: Production build
# ----------------------
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build production
RUN npm run build

# ----------------------
# Stage 3: Production image for S3 deployment
# ----------------------
FROM alpine:3.18 AS prod

WORKDIR /app

# Copy the build folder from previous stage
COPY --from=build /app/dist ./dist

# The container doesn't actually serve the static files.
# You can either:
# 1. Serve via Nginx inside Docker (optional)
# 2. Or just sync ./dist to S3 using `aws s3 sync ./dist s3://your-bucket`
# Here we keep it minimal for S3 deployment

CMD ["echo", "Static build ready in /app/dist. Sync to S3 for deployment."]
