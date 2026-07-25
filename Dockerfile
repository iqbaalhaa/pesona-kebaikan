FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl vips vips-dev
RUN corepack enable

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}
ARG DOKU_CLIENT_ID
ENV DOKU_CLIENT_ID=${DOKU_CLIENT_ID}
ARG DOKU_SECRET_KEY
ENV DOKU_SECRET_KEY=${DOKU_SECRET_KEY}
ARG DOKU_IS_PRODUCTION
ENV DOKU_IS_PRODUCTION=${DOKU_IS_PRODUCTION}
ARG NEXT_PUBLIC_MIN_DONATION
ENV NEXT_PUBLIC_MIN_DONATION=${NEXT_PUBLIC_MIN_DONATION}
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm exec prisma generate
RUN pnpm build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN addgroup -S nodejs && adduser -S nextjs -G nodejs
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
USER nextjs
EXPOSE 3000
CMD ["sh", "-c", "npx prisma db push --accept-data-loss --skip-generate && node server.js"]
