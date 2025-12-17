# ======================================================
# Stage 1 — Dependencies & Prisma Client
# ======================================================
FROM node:22-alpine AS deps
WORKDIR /app

# Required for Prisma + bcrypt native bindings
RUN apk add --no-cache libc6-compat openssl python3 make g++

# Enable Corepack (npm / pnpm / yarn compatibility)
RUN corepack enable

# Copy dependency files
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

# Install dependencies
RUN npm ci

# Generate Prisma Client (REQUIRED at build time)
RUN npx prisma generate


# ======================================================
# Stage 2 — Build Nuxt App
# ======================================================
FROM node:22-alpine AS build
WORKDIR /app

RUN corepack enable

# Copy node_modules + source
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Ensure production mode
ENV NODE_ENV=production

# Build Nuxt (.output)
RUN npm run build


# ======================================================
# Stage 3 — Production Runtime
# ======================================================
FROM node:22-alpine AS production
WORKDIR /app

# Install minimal runtime deps
RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Copy only what is needed to run
COPY --from=build /app/.output ./.output
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/scripts ./scripts

EXPOSE 3000

# Run Prisma init + start Nuxt server
CMD ["npm", "run", "start"]
