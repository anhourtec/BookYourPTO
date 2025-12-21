# syntax=docker/dockerfile:1
FROM node:22-alpine AS deps
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl python3 make g++
RUN corepack enable

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN --mount=type=cache,target=/root/.npm npm ci
RUN npx prisma generate && unset DATABASE_URL

FROM node:22-alpine AS build
WORKDIR /app

RUN corepack enable

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app

RUN apk add --no-cache openssl

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Create user BEFORE copying files
RUN addgroup -S nodejs && adduser -S nuxtjs -G nodejs

# Copy with ownership set during copy (not after)
COPY --from=build --chown=nuxtjs:nodejs /app/.output ./.output
COPY --from=build --chown=nuxtjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nuxtjs:nodejs /app/package.json ./package.json
COPY --from=build --chown=nuxtjs:nodejs /app/prisma ./prisma
COPY --from=build --chown=nuxtjs:nodejs /app/scripts ./scripts

USER nuxtjs

EXPOSE 3000
CMD ["npm", "run", "start"]