# Mini Meeting Backend - VPS Deployment Guide

This guide provides step-by-step instructions for deploying the Mini Meeting backend on your VPS using Docker and Nginx.

## Prerequisites

- VPS with Docker and Docker Compose installed
- Domain: `vps.mohamed-ramadan.tech` pointing to your VPS IP
- SSL certificate (recommended for production)
- Neon PostgreSQL database
- Redis Cloud instance
- LiveKit Cloud instance
- Vercel frontend deployment

## Architecture Overview

```
Internet → Nginx (Port 80/443) → Backend Container (Port 8080)
                                 ↓
                    External Services (Neon, Redis, LiveKit)
```

The backend is accessible at: `https://vps.mohamed-ramadan.tech/mini-meeting/api/v1`

## Deployment Steps

### 1. Connect to Your VPS

```bash
ssh user@your-vps-ip
```

### 2. Install Docker and Docker Compose

If not already installed:

```bash
# Update package list
sudo apt update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Docker Compose is now included as a plugin with Docker
# No separate installation needed

# Add your user to docker group (optional)
sudo usermod -aG docker $USER
```

Log out and log back in for the group change to take effect.

### 3. Create Project Directory

```bash
# Create directory for the project
sudo mkdir -p /var/www/mini-meeting
cd /var/www/mini-meeting
```

### 4. Upload Backend Code

You can use one of these methods:

**Option A: Using Git (Recommended)**

```bash
# If using a private repository
git clone https://github.com/YourUsername/mini-meeting.git .
cd backend

# Or if you have the code locally, use SCP
```

**Option B: Using SCP from your local machine**

```bash
# From your local machine
scp -r d:/Programming/Projects/mini-meeting/backend user@your-vps-ip:/var/www/mini-meeting/
```

**Option C: Using rsync**

```bash
# From your local machine
rsync -avz --exclude 'tmp' --exclude '.git' d:/Programming/Projects/mini-meeting/backend/ user@your-vps-ip:/var/www/mini-meeting/backend/
```

### 5. Configure Environment Variables

```bash
# Navigate to backend directory
cd /var/www/mini-meeting/backend

# Create .env file from example
cp .env.example .env

# Edit the .env file with your production values
nano .env
```

Update these values in your `.env` file:

```env
# Server Configuration
PORT=8080
ENV=production
FRONTEND_URL=https://your-frontend.vercel.app

# Database Configuration (Neon)
DATABASE_URL=postgresql://username:password@your-neon-host/database?sslmode=require

# Redis Configuration (Redis Cloud)
REDIS_HOST=your-redis-host.redis.cloud
REDIS_PORT=6379
REDIS_USERNAME=default
REDIS_PASSWORD=your-redis-password

# JWT Secret (generate a strong secret)
JWT_SECRET=your-very-secure-jwt-secret-key-here
JWT_EXPIRATION=24h

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Mini Meeting <your-email@gmail.com>
EMAIL_SUPPORT=support@mohamed-ramadan.tech

# Admin Account
ADMIN_EMAIL=admin@mohamed-ramadan.tech
ADMIN_PASSWORD=your-secure-admin-password

# OAuth - Update redirect URLs
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URL=https://vps.mohamed-ramadan.tech/mini-meeting/api/v1/auth/google/callback

GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_REDIRECT_URL=https://vps.mohamed-ramadan.tech/mini-meeting/api/v1/auth/github/callback

# LiveKit Configuration
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
LIVEKIT_WS_URL=wss://your-livekit-server.livekit.cloud
```

**Important:** Update OAuth redirect URLs in your OAuth providers:

- Google Cloud Console: https://console.cloud.google.com/apis/credentials
- GitHub Developer Settings: https://github.com/settings/developers

### 6. Update Docker Compose Port (Optional)

Edit `docker-compose.yml` to change the Nginx port if needed:

```yaml
nginx:
  ports:
    - "8090:80" # Change 8090 to your preferred port
```

### 7. Build and Start Containers

```bash
# Build and start containers
docker compose up -d --build

# Check if containers are running
docker compose ps

# View logs
docker compose logs -f
```

### 8. Setup Reverse Proxy (Main Nginx on VPS)

If you have a main Nginx server on your VPS (recommended for SSL and multiple projects):

```bash
# Create Nginx configuration for Mini Meeting
sudo nano /etc/nginx/sites-available/mini-meeting
```

Add this configuration:

```nginx
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name vps.mohamed-ramadan.tech;

    location /mini-meeting {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS Configuration
server {
    listen 443 ssl http2;
    server_name vps.mohamed-ramadan.tech;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/vps.mohamed-ramadan.tech/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vps.mohamed-ramadan.tech/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Logging
    access_log /var/log/nginx/mini-meeting-access.log;
    error_log /var/log/nginx/mini-meeting-error.log;

    # Mini Meeting Backend
    location /mini-meeting/ {
        proxy_pass http://localhost:8090/mini-meeting/;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Buffering
        proxy_buffering off;
    }
}
```

Enable the site and test configuration:

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/mini-meeting /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

### 9. Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d vps.mohamed-ramadan.tech

# Auto-renewal is set up automatically
# Test renewal with:
sudo certbot renew --dry-run
```

### 10. Configure Firewall

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall if not already enabled
sudo ufw enable

# Check status
sudo ufw status
```

## Verification

### 1. Check Container Status

```bash
cd /var/www/mini-meeting/backend
docker compose ps
```

All containers should show as "Up" and healthy.

### 2. Test API Endpoints

```bash
# Health check
curl http://localhost:8090/mini-meeting-health

# API test
curl https://vps.mohamed-ramadan.tech/mini-meeting/api/v1/auth/login
```

### 3. View Logs

```bash
# Backend logs
docker compose logs -f backend

# Nginx logs
docker compose logs -f nginx

# All logs
docker compose logs -f
```

## Management Commands

### Start Containers

```bash
docker compose up -d
```

### Stop Containers

```bash
docker compose down
```

### Restart Containers

```bash
docker compose restart
```

### Rebuild After Code Changes

```bash
docker compose down
docker compose up -d --build
```

### View Running Containers

```bash
docker compose ps
```

### Execute Commands in Container

```bash
# Shell access
docker compose exec backend sh

# View migrations
docker compose exec backend ls migrations
```

### Clean Up

```bash
# Remove containers and networks
docker compose down

# Remove containers, networks, and volumes
docker compose down -v

# Remove unused images
docker image prune -a
```

## Updating the Application

### Method 1: Git Pull (If using Git)

```bash
cd /var/www/mini-meeting/backend
git pull origin main
docker compose up -d --build
```

### Method 2: Manual Upload

```bash
# From local machine
rsync -avz --exclude 'tmp' --exclude '.git' d:/Programming/Projects/mini-meeting/backend/ user@your-vps-ip:/var/www/mini-meeting/backend/

# On VPS
cd /var/www/mini-meeting/backend
docker compose up -d --build
```

## Monitoring

### Check Container Health

```bash
docker compose ps
```

### Monitor Logs in Real-time

```bash
docker compose logs -f
```

### Check Resource Usage

```bash
docker stats
```

## Troubleshooting

### Issue: Containers Not Starting

```bash
# Check logs
docker compose logs

# Check specific service
docker compose logs backend
```

### Issue: Database Connection Failed

1. Verify DATABASE_URL in `.env` file
2. Check if Neon database is accessible
3. Verify SSL mode is set correctly

### Issue: Redis Connection Failed

1. Verify Redis credentials in `.env`
2. Test connection from VPS:

```bash
redis-cli -h your-redis-host -p 6379 -a your-password ping
```

### Issue: 502 Bad Gateway

1. Check if backend container is running:

```bash
docker compose ps
```

2. Check backend logs:

```bash
docker compose logs backend
```

3. Verify port mapping in docker-compose.yml

### Issue: OAuth Redirect Not Working

1. Verify redirect URLs in OAuth providers match:
   - `https://vps.mohamed-ramadan.tech/mini-meeting/api/v1/auth/google/callback`
   - `https://vps.mohamed-ramadan.tech/mini-meeting/api/v1/auth/github/callback`

2. Check FRONTEND_URL in `.env` matches your Vercel deployment

## Security Best Practices

1. **Use Strong Secrets**: Generate strong JWT secrets and admin passwords
2. **Enable SSL**: Always use HTTPS in production
3. **Firewall**: Only open necessary ports
4. **Regular Updates**: Keep Docker images and system packages updated
5. **Backup**: Regular backups of environment variables and configuration
6. **Monitoring**: Set up monitoring and alerting
7. **Rate Limiting**: Consider adding rate limiting to Nginx

## Environment Variables Backup

Save a copy of your `.env` file securely:

```bash
# Backup .env
cp .env .env.backup

# Store securely (NOT in version control)
```

## Additional Considerations

### Using Docker Networks for Multiple Projects

Each project should have its own network. The current setup uses `mini-meeting-network`.

### Port Management

- Mini Meeting Nginx: Port 8090 (internal), exposed to main Nginx
- Other projects can use: 8091, 8092, etc.

### Resource Limits

Add resource limits to `docker-compose.yml` if needed:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: "0.5"
          memory: 512M
```

## Support

For issues or questions:

- Check logs: `docker-compose logs -f`
- GitHub Issues: https://github.com/YourUsername/mini-meeting/issues
- Email: support@mohamed-ramadan.tech

## Next Steps

1. Configure frontend to use new API URL
2. Test all API endpoints
3. Set up monitoring and logging
4. Configure automatic backups
5. Set up CI/CD pipeline (optional)
