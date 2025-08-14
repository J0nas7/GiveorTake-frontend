# Stage 1: Build the Next.js app
FROM node:20 AS builder

# Set working directory
WORKDIR /app

# Install dependencies first (better caching)
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN npm ci

# Copy all project files
COPY . .

# Build the Next.js project
RUN npm run build

# Stage 2: Production image
FROM node:20 AS runner

# Set working directory
WORKDIR /app

ENV NODE_ENV=production

# Copy only required files from builder
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Next.js runs on port 3000 by default
EXPOSE 3000

# Run the Next.js server
CMD ["npm", "start"]
