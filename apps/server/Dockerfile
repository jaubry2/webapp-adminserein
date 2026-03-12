# Build stage
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy workspace files
COPY package.json bun.lock* ./
COPY packages ./packages
COPY apps/server ./apps/server

# Install dependencies
RUN bun install

# Build server
RUN cd apps/server && bun run build

# Production stage
FROM oven/bun:1-slim

WORKDIR /app

# Copy workspace structure (needed for workspace packages)
COPY package.json bun.lock* ./
COPY packages ./packages
COPY apps/server ./apps/server

# Copy built server from builder
COPY --from=builder /app/apps/server/dist ./apps/server/dist

# Install production deps only (re-run to get clean node_modules)
RUN bun install

# Cloud Run uses PORT=8080 by default
ENV PORT=8080
EXPOSE 8080

# Run the built server
CMD ["bun", "run", "apps/server/dist/index.mjs"]
