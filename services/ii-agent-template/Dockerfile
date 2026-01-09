# ============================================
# II-Agent Worker - Dockerfile Template
# Multi-stage build for Cloud Run
# ============================================
# Build: docker build --build-arg AGENT_TYPE=codegen -t ii-codegen-worker .

# Build arguments for agent specialization
ARG AGENT_TYPE=nlu

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build if TypeScript
RUN npm run build 2>/dev/null || true

# Stage 2: Production
FROM node:20-alpine AS production

# Inherit build arg
ARG AGENT_TYPE=nlu

WORKDIR /app

# Security: Run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built assets from builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./

# Set environment
ENV NODE_ENV=production
ENV PORT=8080
ENV AGENT_TYPE=${AGENT_TYPE}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 8080

# Start the service
CMD ["node", "dist/index.js"]
