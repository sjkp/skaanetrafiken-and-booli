# Use the official Node.js 18 runtime as base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package files first for better Docker layer caching
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY *.js ./
COPY .env.example ./

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership of the app directory to the nodejs user
RUN chown -R nodejs:nodejs /app
USER nodejs

# Set default environment variables
ENV NODE_ENV=production
ENV DEBUG=false

# Add labels for metadata
LABEL maintainer="Property Search Bot"
LABEL description="Automated property search in Skåne with email notifications"
LABEL version="1.0.0"

# The default command to run the application
CMD ["node", "find-properties.js"]