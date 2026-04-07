# --- Frontend Build Stage ---
FROM node:20 as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ ./
RUN npm run build

# --- Backend & Final Stage ---
FROM python:3.12-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    nginx \
    gettext \
    libpq-dev \
    gcc \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV PORT 8080

# Set work directory
WORKDIR /app

# Ensure static directory exists and remove default nginx config
RUN mkdir -p /app/backend/staticfiles && \
    rm -f /etc/nginx/sites-enabled/default && \
    rm -f /etc/nginx/conf.d/default.conf

# Install backend dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy frontend build from frontend-build stage
COPY --from=frontend-build /app/frontend/dist /usr/share/nginx/html

# Copy Nginx config template
COPY nginx.conf /etc/nginx/conf.d/default.conf.template

# Copy startup script
COPY start.sh ./
RUN chmod +x start.sh

# Expose port
EXPOSE 8080

# Start services
CMD ["./start.sh"]
