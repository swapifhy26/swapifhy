# Multi-stage production build for backend
FROM node:20-alpine AS builder

WORKDIR /app
# Prisma needs OpenSSL present to pick the correct query-engine binary on Alpine
RUN apk add --no-cache openssl
COPY package*.json ./
# Install dev dependencies to compile TypeScript and generate Prisma
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Prisma needs OpenSSL present at runtime to load the query engine on Alpine
RUN apk add --no-cache openssl

# Only copy over package.json to install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy Prisma schema and regenerate client for production
COPY prisma ./prisma
RUN npx prisma generate

# Copy compiled output
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["npm", "start"]
