FROM node:20-alpine3.19

WORKDIR /app

# Copy dependency files first (better caching + security)
COPY package*.json ./

# Install production dependencies in clean mode
RUN npm ci --omit=dev \
    && npm cache clean --force

# Copy only required app files
COPY server.js ./
COPY app.js ./

ENV PORT=5000
EXPOSE 5000

# Safer healthcheck (no wget dependency needed)
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', r => process.exit(r.statusCode===200?0:1)).on('error', () => process.exit(1))"

CMD ["node", "server.js"]
