# Stage 1: Build the React 19 / Vite application
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies using package-lock.json
COPY package*.json ./
RUN npm ci

# Copy source tree
COPY . .

# Configure default API endpoint to use the Nginx reverse proxy path
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=$VITE_API_URL

# Build production bundle
RUN npm run build

# Stage 2: Lightweight Nginx production web server
FROM nginx:alpine AS runner

# Purge default html files
RUN rm -rf /usr/share/nginx/html/*

# Copy built distribution assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx reverse proxy and SPA configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
