FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
# Use production flag to avoid installing dev dependencies
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production
# Cloud Run injects the PORT environment variable
ENV PORT=8080

EXPOSE 8080

# Use the more efficient CMD format
CMD ["node", "dist/main"]
