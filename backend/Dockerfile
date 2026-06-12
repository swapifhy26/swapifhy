# Multi-stage production build for backend
FROM node:20-alpine AS builder

WORKDIR /app
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

# Only copy over package.json to install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy Prisma schema and regenerate client for production
COPY prisma ./prisma
RUN npx prisma generate

# Copy compiled output
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["npm", "start"]
