FROM node:20-alpine

# Install curl for container healthcheck and libc6-compat for binary compatibility
RUN apk add --no-cache curl libc6-compat

WORKDIR /app

# Set production environment
ENV NODE_ENV=production \
    PORT=5000

# Install dependencies using package-lock.json
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy application source files
COPY . .

# Create uploads directory and establish non-root ownership
RUN mkdir -p uploads temp && chown -R node:node /app

# Switch to non-root node user
USER node

EXPOSE 5000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5000/api/v1/health || exit 1

CMD ["node", "server/index.js"]
