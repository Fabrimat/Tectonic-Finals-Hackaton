FROM node:24.22.0-alpine3.24@sha256:44fce696f38ba8c987c4db89954051000bbd05ffd8d8659ba15ed4a8602e937f AS frontend
WORKDIR /build
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --ignore-scripts
COPY frontend/ ./
RUN npm run build

FROM node:24.22.0-alpine3.24@sha256:44fce696f38ba8c987c4db89954051000bbd05ffd8d8659ba15ed4a8602e937f AS backend
WORKDIR /build
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --ignore-scripts
COPY backend/tsconfig.json backend/tsconfig.build.json ./
COPY backend/src ./src
RUN npm run build && npm prune --omit=dev

FROM node:24.22.0-alpine3.24@sha256:44fce696f38ba8c987c4db89954051000bbd05ffd8d8659ba15ed4a8602e937f
RUN apk upgrade --no-cache
ENV NODE_ENV=production \
    PORT=3000 \
    STATIC_DIR=/app/frontend/dist
WORKDIR /app/backend
COPY --from=backend --chown=node:node /build/node_modules ./node_modules
COPY --from=backend --chown=node:node /build/dist ./dist
COPY --chown=node:node backend/package.json ./
COPY --chown=node:node backend/data ./data
COPY --from=frontend --chown=node:node /build/dist /app/frontend/dist
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s \
  CMD wget -q -O /dev/null http://127.0.0.1:${PORT}/api/health || exit 1
CMD ["node", "dist/main.js"]
