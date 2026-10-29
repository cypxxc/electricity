# -------------------------------------------------------------
# Stage 1: Install dependencies
# -------------------------------------------------------------
FROM oven/bun:1-alpine AS deps
WORKDIR /app

ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# -------------------------------------------------------------
# Stage 2: Build the Next.js standalone application
# -------------------------------------------------------------
FROM oven/bun:1-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

RUN bun run build

# -------------------------------------------------------------
# Stage 3: Production Runner (Minimal lightweight Node.js)
# -------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy static public assets
COPY --from=builder /app/public ./public

# Prepare .next directory with correct permissions
RUN mkdir .next && chown nextjs:nodejs .next

# Copy standalone build and static files
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
