# Mini Meeting - Quick Deployment Guide

This is a condensed version of the deployment guide for quick reference.

> **Note:** This guide uses `docker compose` (Docker CLI plugin, v2+) instead of `docker-compose` (standalone). If you have an older version, install the latest Docker which includes Compose as a plugin.

## Prerequisites Checklist

- [-] VPS with Docker and Docker Compose installed
- [-] Domain `vps.mohamed-ramadan.tech` pointing to VPS IP
- [-] Neon PostgreSQL URL
- [-] Redis Cloud credentials
- [-] LiveKit Cloud credentials
- [-] OAuth credentials (Google & GitHub) updated with production URLs
- [ ] SSL certificate (Let's Encrypt)

## Quick Setup (5 Steps)

### Step 1: Upload Code to VPS

```bash
# From your local machine
rsync -avz --exclude 'tmp' --exclude '.git' backend/ user@your-vps-ip:/var/www/mini-meeting/backend/

# Or using Git
ssh user@your-vps-ip
cd /var/www/mini-meeting
git clone your-repo-url .
```

### Step 2: Configure Environment

```bash
cd /var/www/mini-meeting/backend
cp .env.example .env
nano .env  # Update all production values
```

**Critical values to update:**

- `DATABASE_URL` - Your Neon PostgreSQL URL
- `REDIS_HOST`, `REDIS_PASSWORD` - Your Redis Cloud credentials
- `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_WS_URL` - Your LiveKit credentials
- `JWT_SECRET` - Generate strong secret
- `FRONTEND_URL` - Your Vercel URL
- OAuth redirect URLs: `https://vps.mohamed-ramadan.tech/mini-meeting/api/v1/auth/{provider}/callback`

### Step 3: Start Docker Containers

```bash
docker compose up -d --build
docker compose ps  # Verify all containers are running
```

### Step 4: Configure Main Nginx (with SSL)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Create Nginx config
sudo nano /etc/nginx/sites-available/mini-meeting
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name vps.mohamed-ramadan.tech;
    location /mini-meeting {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name vps.mohamed-ramadan.tech;

    ssl_certificate /etc/letsencrypt/live/vps.mohamed-ramadan.tech/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/vps.mohamed-ramadan.tech/privkey.pem;

    location /mini-meeting/ {
        proxy_pass http://localhost:8090/mini-meeting/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/mini-meeting /etc/nginx/sites-enabled/
sudo certbot --nginx -d vps.mohamed-ramadan.tech
sudo nginx -t
sudo systemctl reload nginx
```

### Step 5: Verify Deployment

```bash
# Check containers
docker compose ps

# Test API
curl https://vps.mohamed-ramadan.tech/mini-meeting/api/v1/auth/login

# View logs
docker compose logs -f
```

## Common Commands

```bash
# View logs
docker compose logs -f

# Restart containers
docker compose restart

# Rebuild after changes
docker compose up -d --build

# Stop containers
docker compose down
```

## OAuth Configuration

Update redirect URLs in:

1. **Google OAuth**: https://console.cloud.google.com/apis/credentials
   - Redirect URI: `https://vps.mohamed-ramadan.tech/mini-meeting/api/v1/auth/google/callback`

2. **GitHub OAuth**: https://github.com/settings/developers
   - Redirect URI: `https://vps.mohamed-ramadan.tech/mini-meeting/api/v1/auth/github/callback`

## Frontend Configuration

Update your Vercel frontend environment variables:

```env
VITE_API_URL=https://vps.mohamed-ramadan.tech/mini-meeting/api/v1
```

## Troubleshooting

| Issue                      | Solution                                             |
| -------------------------- | ---------------------------------------------------- |
| Containers not starting    | `docker compose logs`                                |
| 502 Bad Gateway            | Check if containers are running: `docker compose ps` |
| Database connection failed | Verify `DATABASE_URL` in `.env`                      |
| OAuth redirect error       | Update OAuth provider redirect URLs                  |

## File Structure

```
/var/www/mini-meeting/backend/
├── docker-compose.yml      # Docker orchestration (use 'docker compose' command)
├── Dockerfile              # Backend container image
├── nginx.conf              # Local Nginx config
├── .env                    # Environment variables (create from .env.example)
├── .env.example            # Environment template
├── cmd/
├── internal/
├── pkg/
└── migrations/
```

## Port Configuration

- Mini Meeting Nginx: `8090` (configurable in docker-compose.yml)
- Backend: `8080` (internal, not exposed)
- Main Nginx: `80/443` (public)

## Security Checklist

- [ ] Strong JWT_SECRET generated
- [ ] Strong ADMIN_PASSWORD set
- [ ] SSL certificate configured
- [ ] Firewall configured (80, 443)
- [ ] `.env` file not in version control
- [ ] OAuth credentials secured

## Need Help?

See full documentation: [VPS-DEPLOYMENT.md](./VPS-DEPLOYMENT.md)
