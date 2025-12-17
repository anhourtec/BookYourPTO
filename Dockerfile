# ======================================================
# Stage 1 — Dependencies & Prisma Client Generation
# ======================================================
FROM node:22-alpine AS deps
WORKDIR /app

# Native deps required by Prisma + bcrypt
RUN apk add --no-cache libc6-compat openssl python3 make g++

# Enable Corepack
RUN corepack enable

# Prisma requires DATABASE_URL at build time (no DB connection is made)
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Copy dependency and Prisma files
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

# Install dependencies
RUN npm ci

# Generate Prisma Client, then immediately unset DATABASE_URL
RUN npx prisma generate && unset DATABASE_URL


# ======================================================
# Stage 2 — Build Nuxt Application
# ======================================================
FROM node:22-alpine AS build
WORKDIR /app

RUN corepack enable

# Copy dependencies and source
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production

# Build Nuxt (.output)
RUN npm run build


# ======================================================
# Stage 3 — Production Runtime
# ======================================================
FROM node:22-alpine AS production
WORKDIR /app

# Minimal runtime dependencies
RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Copy only runtime artifacts
COPY --from=build /app/.output ./.output
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/scripts ./scripts

# Run as non-root user (security best practice)
RUN addgroup -S nodejs && adduser -S nuxtjs -G nodejs \
  && chown -R nuxtjs:nodejs /app

USER nuxtjs

EXPOSE 3000

# Runtime: wait for DB → init schema → start Nuxt server
CMD ["npm", "run", "start"]
