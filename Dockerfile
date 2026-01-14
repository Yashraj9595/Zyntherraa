# Multi-stage build for full-stack application

# Stage 1: Build React frontend
FROM node:22-alpine AS frontend-build
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY public ./public
COPY src ./src
RUN npm ci
RUN npm run build

# Stage 2: Build backend
FROM node:22-alpine AS backend-build
WORKDIR /app
COPY backend/package*.json ./
COPY backend/tsconfig.json ./
COPY backend/src ./src
RUN npm ci --only=production

# Stage 3: Production image
FROM node:22-alpine
WORKDIR /app

# Copy backend build
COPY --from=backend-build /app/node_modules ./node_modules
COPY --from=backend-build /app/src ./src
COPY --from=backend-build /app/tsconfig.json ./tsconfig.json

# Copy frontend build
COPY --from=frontend-build /app/build ./build

# Copy backend package files
COPY backend/package*.json ./

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "start"]