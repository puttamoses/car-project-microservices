FROM node:20-alpine3.19

WORKDIR /app


# Copy dependency files first (better caching + security)

COPY package*.json ./


# Install production dependencies in clean mode

- RUN npm ci --omit=dev \

+ RUN npm ci --omit=dev --ignore-scripts \▲ fix: blocks postinstall shell scripts

      && npm cache clean --force


# Copy only required app files

COPY server.js ./

COPY app.js ./


- ENV PORT=5000

+ ENV PORT=5000 NODE_ENV=production▲ good practice: hardens Express defaults

EXPOSE 5000


# Healthcheck (no wget/curl needed)

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \

  CMD node -e "require('http').get('http://localhost:5000/health', \

    r => process.exit(r.statusCode===200?0:1)).on('error', () => process.exit(1))"


- CMD ["node", "server.js"]

+ USER node▲ fix: drop root — run as least-privilege user

+ CMD ["node", "server.js"]
