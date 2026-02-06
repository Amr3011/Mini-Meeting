# Mini Meeting Backend - Docker Deployment Summary

## Overview

The Mini Meeting backend has been successfully configured for Docker deployment on your VPS at `vps.mohamed-ramadan.tech`. The backend will be accessible at the path `/mini-meeting/api/v1`.

## Created Files

### Backend Directory (`backend/`)

1. **Dockerfile**
   - Multi-stage build for Go application
   - Based on Alpine Linux for minimal size
   - Includes migrations and email templates

2. **docker-compose.yml**
   - Orchestrates backend and Nginx containers
   - Backend: Go application (port 8080, internal)
   - Nginx: Reverse proxy (port 8090, exposed)
   - Includes health checks for both services

3. **nginx.conf**
   - Nginx configuration for reverse proxy
   - Handles `/mini-meeting` path rewriting
   - WebSocket support enabled
   - Proper proxy headers configured

4. **.env.example**
   - Updated with production configuration examples
   - OAuth redirect URLs updated for production domain

5. **.dockerignore**
   - Optimizes Docker build by excluding unnecessary files

6. **deploy.sh** (Linux/Mac)
   - Interactive deployment management script
   - Handles deployment, updates, logs, and monitoring

7. **deploy.ps1** (Windows)
   - PowerShell deployment script
   - Manages code upload and remote deployment from Windows

8. **DOCKER-README.md**
   - Docker-specific documentation
   - Quick reference for Docker commands

### Documentation Directory (`docs/`)

1. **VPS-DEPLOYMENT.md**
   - Comprehensive deployment guide
   - Step-by-step instructions
   - Troubleshooting section
   - SSL/HTTPS configuration
   - Security best practices

2. **QUICK-DEPLOYMENT.md**
   - Condensed deployment guide
   - 5-step quick start
   - Common commands reference
   - OAuth configuration instructions

3. **DEPLOYMENT-CHECKLIST.md**
   - Complete deployment checklist
   - Pre-deployment requirements
   - Environment configuration
   - Testing and verification steps
   - Security checklist

## Architecture

```
Internet
    ↓
HTTPS (443) / HTTP (80)
    ↓
Main Nginx on VPS (with SSL)
    ↓
http://localhost:8090/mini-meeting/
    ↓
Docker Nginx Container (port 8090)
    ↓ (path rewrite: /mini-meeting/* → /*)
Docker Backend Container (port 8080)
    ↓
External Services:
├── Neon PostgreSQL
├── Redis Cloud
└── LiveKit Cloud
```

## Deployment Path

- **API Base URL**: `https://vps.mohamed-ramadan.tech/mini-meeting/api/v1`
- **Example Endpoints**:
  - Login: `https://vps.mohamed-ramadan.tech/mini-meeting/api/v1/auth/login`
  - Register: `https://vps.mohamed-ramadan.tech/mini-meeting/api/v1/auth/register`
  - Meetings: `https://vps.mohamed-ramadan.tech/mini-meeting/api/v1/meetings`

## Quick Start Commands

### On VPS

```bash
# Navigate to project
cd /var/www/mini-meeting/backend

# Start containers
docker compose up -d --build

# Check status
docker compose ps

# View logs
docker compose logs -f

# Restart
docker compose restart

# Stop
docker compose down
```

### From Local Machine (Windows)

```powershell
# Using the deployment script
.\backend\deploy.ps1

# Or manually upload
rsync -avz backend/ user@vps-ip:/var/www/mini-meeting/backend/
```

## Environment Configuration

### Required Environment Variables

```env
# Server
PORT=8080
ENV=production
FRONTEND_URL=https://your-frontend.vercel.app

# Database (Neon)
DATABASE_URL=postgresql://...

# Redis (Redis Cloud)
REDIS_HOST=...
REDIS_PORT=6379
REDIS_PASSWORD=...

# LiveKit (LiveKit Cloud)
LIVEKIT_API_KEY=...
LIVEKIT_API_SECRET=...
LIVEKIT_WS_URL=wss://...

# OAuth
GOOGLE_REDIRECT_URL=https://vps.mohamed-ramadan.tech/mini-meeting/api/v1/auth/google/callback
GITHUB_REDIRECT_URL=https://vps.mohamed-ramadan.tech/mini-meeting/api/v1/auth/github/callback
```

## Port Configuration

- **Backend Container**: 8080 (internal, not exposed)
- **Nginx Container**: 8090 (exposed to host, configurable in `docker-compose.yml`)
- **Main Nginx**: 80/443 (public)

### Changing Nginx Port

Edit `docker-compose.yml`:

```yaml
nginx:
  ports:
    - "8090:80" # Change 8090 to your preferred port
```

Then update the main Nginx configuration to proxy to the new port.

## SSL/HTTPS Setup

The main Nginx on your VPS handles SSL termination using Let's Encrypt:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain certificate
sudo certbot --nginx -d vps.mohamed-ramadan.tech

# Auto-renewal is configured automatically
```

## OAuth Provider Configuration

### Google OAuth

- Console: https://console.cloud.google.com/apis/credentials
- Authorized redirect URI: `https://vps.mohamed-ramadan.tech/mini-meeting/api/v1/auth/google/callback`

### GitHub OAuth

- Settings: https://github.com/settings/developers
- Authorization callback URL: `https://vps.mohamed-ramadan.tech/mini-meeting/api/v1/auth/github/callback`

## Frontend Integration

Update your Vercel frontend environment variables:

```env
VITE_API_URL=https://vps.mohamed-ramadan.tech/mini-meeting/api/v1
```

The frontend will make requests to:

- `https://vps.mohamed-ramadan.tech/mini-meeting/api/v1/auth/login`
- `https://vps.mohamed-ramadan.tech/mini-meeting/api/v1/meetings`
- etc.

## Monitoring and Logs

### View Logs

```bash
# All services
docker compose logs -f

# Backend only
docker compose logs -f backend

# Nginx only
docker compose logs -f nginx

# Last 100 lines
docker compose logs --tail=100
```

### Check Health

```bash
# Container status
docker compose ps

# Resource usage
docker stats

# Health check endpoint
curl http://localhost:8090/mini-meeting-health
```

## Updating the Application

### Method 1: Using Git

```bash
cd /var/www/mini-meeting/backend
git pull origin main
docker compose up -d --build
```

### Method 2: Manual Upload

```bash
# From local machine
rsync -avz --exclude 'tmp' --exclude '.git' backend/ user@vps-ip:/var/www/mini-meeting/backend/

# On VPS
cd /var/www/mini-meeting/backend
docker compose up -d --build
```

### Method 3: Using Deployment Script

```bash
# On VPS
cd /var/www/mini-meeting/backend
./deploy.sh
# Select option 3 (Update)
```

## Multiple Projects on Same VPS

Each project should:

1. Have its own directory: `/var/www/project-name`
2. Use a unique Nginx port (8090, 8091, 8092, etc.)
3. Have its own Docker network
4. Be configured in main Nginx with a unique path

Example for another project:

```nginx
location /another-project/ {
    proxy_pass http://localhost:8091/another-project/;
    # ... other proxy settings
}
```

## Security Best Practices

1. ✅ Use strong secrets (JWT_SECRET, ADMIN_PASSWORD)
2. ✅ Enable HTTPS/SSL
3. ✅ Configure firewall (ports 80, 443)
4. ✅ Never commit `.env` to version control
5. ✅ Regularly update Docker images
6. ✅ Use health checks
7. ✅ Implement rate limiting (in main Nginx)
8. ✅ Keep system packages updated

## Troubleshooting

### Containers Not Starting

```bash
docker compose logs
```

### Database Connection Failed

- Verify `DATABASE_URL` in `.env`
- Check Neon database accessibility
- Ensure SSL mode is correct

### 502 Bad Gateway

- Check containers are running: `docker compose ps`
- Check backend logs: `docker compose logs backend`
- Verify port mapping

### OAuth Not Working

- Verify redirect URLs in OAuth providers
- Check `FRONTEND_URL` in `.env`
- Ensure SSL is working

## Support and Documentation

- **Full Deployment Guide**: [VPS-DEPLOYMENT.md](../docs/VPS-DEPLOYMENT.md)
- **Quick Start**: [QUICK-DEPLOYMENT.md](../docs/QUICK-DEPLOYMENT.md)
- **Checklist**: [DEPLOYMENT-CHECKLIST.md](../docs/DEPLOYMENT-CHECKLIST.md)
- **Docker Guide**: [DOCKER-README.md](./DOCKER-README.md)

## Next Steps

1. ✅ Docker configuration created
2. ⏭️ Upload code to VPS
3. ⏭️ Configure `.env` file
4. ⏭️ Start Docker containers
5. ⏭️ Configure main Nginx
6. ⏭️ Setup SSL certificate
7. ⏭️ Update OAuth providers
8. ⏭️ Update frontend API URL
9. ⏭️ Test deployment
10. ⏭️ Monitor and maintain

---

**Note**: This setup allows you to host multiple projects on the same VPS by using different paths and ports. Each project is isolated in its own Docker containers.

Good luck with your deployment! 🚀
