FROM node:20-alpine3.21

# ─────────────────────────────
# App directory
# ─────────────────────────────
WORKDIR /app

# ─────────────────────────────
# Install dependencies (cached layer)
# ─────────────────────────────
COPY package*.json ./

RUN npm install -g npm@latest \
    && npm ci --omit=dev \
    && npm cache clean --force

# ─────────────────────────────
# Copy application source
# ─────────────────────────────
COPY server.js ./
COPY app.js ./

# ─────────────────────────────
# Environment variables
# ─────────────────────────────
ENV PORT=5000
ENV NODE_ENV=production

# ─────────────────────────────
# Expose app port
# ─────────────────────────────
EXPOSE 5000

# ─────────────────────────────
# Healthcheck (exec form - BEST PRACTICE)
# ─────────────────────────────
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD ["node", "-e", "require('http').get('http://localhost:5000/health', r => process.exit(r.statusCode===200?0:1)).on('error', () => process.exit(1))"]

# ─────────────────────────────
# Security: run as non-root user
# ─────────────────────────────
USER node

# ─────────────────────────────
# Start application
# ─────────────────────────────
CMD ["node", "server.js"]
