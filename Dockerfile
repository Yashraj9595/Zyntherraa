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

# Copy package files and install ALL dependencies (including devDependencies for TypeScript)
COPY backend/package*.json ./
COPY backend/tsconfig.json ./
RUN npm ci

# Copy source files
COPY backend/src ./src

# Compile TypeScript to JavaScript
RUN npm run build

# Verify dist/ directory exists
RUN ls -la dist/ || (echo "ERROR: dist/ directory not found after build" && exit 1)

# Stage 3: Production image
FROM node:22-alpine
WORKDIR /app

# Install only production dependencies
COPY backend/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy compiled backend (dist/) instead of src/
COPY --from=backend-build /app/dist ./dist

# Copy frontend build
COPY --from=frontend-build /app/build ./build

# Create uploads directory
RUN mkdir -p uploads/images uploads/videos

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "start"]