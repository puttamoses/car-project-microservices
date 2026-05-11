FROM node:20-alpine3.21

# ─────────────────────────────
# App directory
# ─────────────────────────────
WORKDIR /app

# ─────────────────────────────
# Install OS + Node dependencies
# ─────────────────────────────
COPY package*.json ./

RUN apk update \
    && apk upgrade \
    && npm install -g npm@latest \
    && npm ci --omit=dev --ignore-scripts \
    && npm cache clean --force \
    && rm -rf /var/cache/apk/*

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
# Healthcheck
# ─────────────────────────────
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD ["node", "-e", "require('http').get('http://localhost:5000/health', r => process.exit(r.statusCode===200?0:1)).on('error', () => process.exit(1))"]

# ─────────────────────────────
# Security: non-root user
# ─────────────────────────────
USER node

# ─────────────────────────────
# Start application
# ─────────────────────────────
CMD ["node", "server.js"]
