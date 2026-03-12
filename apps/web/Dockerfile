# Build stage
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy workspace files
COPY package.json bun.lock* ./
COPY packages ./packages
COPY apps/web ./apps/web

# Requis pour bun install (postinstall nuxt prepare) - sera écrasé à l'exécution par Cloud Run
ENV NUXT_PUBLIC_SERVER_URL=https://placeholder.run.app

# Install dependencies
RUN bun install

# Build Nuxt
RUN cd apps/web && bun run build

# Production stage
FROM oven/bun:1-slim

WORKDIR /app

# Copy built output and minimal deps
COPY --from=builder /app/apps/web/.output ./apps/web/.output
COPY --from=builder /app/apps/web/package.json ./apps/web/
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages

# Cloud Run uses PORT=8080
ENV HOST=0.0.0.0
ENV PORT=8080
EXPOSE 8080

WORKDIR /app/apps/web

# Run Nitro server
CMD ["bun", ".output/server/index.mjs"]
