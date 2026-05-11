# Stage 1 — Build React app
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY .env.production .env.production
COPY . .

RUN npm run build


# Stage 2 — Serve with Nginx (FIXED)
FROM nginx:stable-alpine

# 🔥 Fix CVEs by updating base packages
RUN apk update && apk upgrade --no-cache

RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
