FROM node:20-alpine3.21

WORKDIR /app

COPY package*.json ./

RUN apk update \
    && apk upgrade \
    && npm ci --omit=dev --ignore-scripts \
    && npm cache clean --force \
    && rm -rf /var/cache/apk/*

COPY server.js ./
COPY app.js ./

ENV PORT=5000
ENV NODE_ENV=production

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD ["node", "-e", "require('http').get('http://localhost:5000/health', r => process.exit(r.statusCode===200?0:1)).on('error', () => process.exit(1))"]

USER node

CMD ["node", "server.js"]
