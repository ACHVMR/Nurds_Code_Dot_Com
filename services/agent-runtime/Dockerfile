
# Use Node.js LTS
FROM node:18-slim

WORKDIR /app

# Install dependencies
# (Assumes functionality will be added later, for now just express for the server)
RUN npm init -y && npm install express

# Copy source code
COPY . .

# Expose port
ENV PORT=8080
EXPOSE 8080

# Start command
CMD ["node", "server.js"]
