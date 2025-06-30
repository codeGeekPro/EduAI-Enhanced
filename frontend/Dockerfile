# 📱 EduAI Enhanced - Frontend PWA Dockerfile
# Image Docker pour la PWA React + TypeScript

# Stage 1: Build
FROM node:18-alpine AS builder

LABEL maintainer="EduAI Enhanced Team"
LABEL description="📱 PWA Frontend pour EduAI Enhanced"

WORKDIR /app

# Installer pnpm
RUN npm install -g pnpm

# Copier les fichiers de dépendances
COPY package.json pnpm-lock.yaml ./

# Installer les dépendances
RUN pnpm install --frozen-lockfile

# Copier le code source
COPY . .

# Build de l'application PWA
RUN pnpm build

# Stage 2: Production avec Nginx
FROM nginx:alpine

# Installer curl pour healthcheck
RUN apk add --no-cache curl

# Copier la configuration Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers buildés
COPY --from=builder /app/dist /usr/share/nginx/html

# Copier les fichiers PWA
COPY --from=builder /app/dist/*.png /usr/share/nginx/html/
COPY --from=builder /app/dist/manifest.json /usr/share/nginx/html/
COPY --from=builder /app/dist/sw.js /usr/share/nginx/html/

# Exposer le port
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Commande de démarrage
CMD ["nginx", "-g", "daemon off;"]
