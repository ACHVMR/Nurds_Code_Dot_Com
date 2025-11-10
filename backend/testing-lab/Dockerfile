# Dockerfile
# Testing Lab - Playwright E2E Tests
# Sprint 12 Foundation

FROM mcr.microsoft.com/playwright:v1.40.0-jammy

WORKDIR /app

# Install Node.js dependencies for test runner
COPY package*.json ./
RUN npm ci

# Copy test files
COPY . .

# Install Playwright browsers
RUN npx playwright install --with-deps

# Expose port for test server
EXPOSE 8002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8002/health || exit 1

# Start test server (for continuous testing)
CMD ["npm", "run", "test:watch"]
