# ============================================
# ACHEEVY Hub - Dockerfile
# ============================================
# Central orchestrator for 19 II-Agent workers

FROM node:20-alpine AS production

WORKDIR /app

# Security: Run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files
COPY --chown=nodejs:nodejs package*.json ./

# Install dependencies (none required currently)
RUN npm install --omit=dev 2>/dev/null || true

# Copy source
COPY --chown=nodejs:nodejs . .

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 8080

# Start the service
CMD ["node", "index.js"]
