# Titans Bank appointment booking: one image with the API and the web app.
# Build: docker build -t titans-bank .
# Run:   docker run -d --name titans-bank -p 3000:3000 -v titans-data:/app/data titans-bank

# ---- Stage 1: build the Angular web app ----
FROM node:24.15.0-slim AS frontend
WORKDIR /app/frontend
# Install packages first, so Docker can reuse this layer when only the code changes.
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---- Stage 2: build the NestJS API ----
FROM node:24.15.0-slim AS backend
WORKDIR /app/backend
# Installed here, on Linux, so better-sqlite3 gets its Linux version (never copied from Windows).
COPY backend/package.json backend/package-lock.json ./
RUN npm ci
COPY backend/ ./
# Build, then remove the development-only packages (tests, linting, the Nest CLI).
RUN npm run build && npm prune --omit=dev

# ---- Stage 3: the image that runs ----
FROM node:24.15.0-slim
ENV NODE_ENV=production \
    PORT=3000 \
    DATABASE_PATH=/app/data/titans-bank.db \
    WEB_DIR=/app/web
WORKDIR /app

COPY --from=backend /app/backend/package.json ./
COPY --from=backend /app/backend/node_modules ./node_modules
COPY --from=backend /app/backend/dist ./dist
COPY --from=frontend /app/frontend/dist/frontend/browser ./web

# The database lives in /app/data. Mount a volume there to keep bookings across rebuilds.
# Runs as the image's non-root "node" user, which owns the data folder.
RUN mkdir -p /app/data && chown node:node /app/data
USER node
VOLUME /app/data

EXPOSE 3000
CMD ["node", "dist/main.js"]
