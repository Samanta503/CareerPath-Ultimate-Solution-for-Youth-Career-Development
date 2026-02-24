# ============================================================
# CareerPath — React Frontend Dockerfile
# ============================================================

# Stage 1: Build the React app
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for caching
COPY client/package.json client/package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source code
COPY client/ .

# Set the API URL for production build
ENV VITE_API_URL=/api

# Build the production bundle
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built files to nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY docker/nginx/frontend.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
