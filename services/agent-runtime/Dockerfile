
# Use Node.js LTS
FROM node:18-slim

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy source code
COPY . .

# Expose port
ENV PORT=8080
EXPOSE 8080

# Start command
CMD ["node", "server.js"]
