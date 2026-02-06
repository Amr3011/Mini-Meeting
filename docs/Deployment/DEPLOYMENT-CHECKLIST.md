# Mini Meeting VPS Deployment Checklist

Use this checklist to ensure all steps are completed for deployment.

## Pre-Deployment

- [ ] VPS is accessible via SSH
- [ ] Docker and Docker Compose installed on VPS
- [ ] Domain `vps.mohamed-ramadan.tech` DNS points to VPS IP
- [ ] Neon PostgreSQL database URL ready
- [ ] Redis Cloud credentials ready
- [ ] LiveKit Cloud credentials ready
- [ ] Email SMTP credentials ready (Gmail app password)
- [ ] OAuth credentials (Google & GitHub) created

## Environment Configuration

- [ ] `.env` file created from `.env.example`
- [ ] `PORT=8080` configured
- [ ] `ENV=production` configured
- [ ] `FRONTEND_URL` set to Vercel URL
- [ ] `DATABASE_URL` configured with Neon URL
- [ ] `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` configured
- [ ] `JWT_SECRET` generated (strong, random string)
- [ ] `ADMIN_EMAIL` and `ADMIN_PASSWORD` set
- [ ] `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_WS_URL` configured
- [ ] Email configuration (`EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASSWORD`, etc.)

## OAuth Configuration

- [ ] Google OAuth redirect URL updated: `https://vps.mohamed-ramadan.tech/mini-meeting/api/v1/auth/google/callback`
- [ ] GitHub OAuth redirect URL updated: `https://vps.mohamed-ramadan.tech/mini-meeting/api/v1/auth/github/callback`
- [ ] `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
- [ ] `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in `.env`

## VPS Setup

- [ ] Project directory created: `/var/www/mini-meeting/backend`
- [ ] Backend code uploaded to VPS
- [ ] Permissions set correctly on project directory
- [ ] `.env` file uploaded (not in Git)

## Docker Deployment

- [ ] Port in `docker-compose.yml` configured (default: 8090)
- [ ] Docker containers built: `docker compose up -d --build`
- [ ] Containers running: `docker compose ps` shows all healthy
- [ ] Backend logs checked: `docker compose logs backend`
- [ ] No errors in logs

## Nginx Configuration

- [ ] Main Nginx config created: `/etc/nginx/sites-available/mini-meeting`
- [ ] Symbolic link created: `/etc/nginx/sites-enabled/mini-meeting`
- [ ] Nginx config tested: `sudo nginx -t`
- [ ] Nginx reloaded: `sudo systemctl reload nginx`

## SSL Certificate

- [ ] Certbot installed
- [ ] SSL certificate obtained: `sudo certbot --nginx -d vps.mohamed-ramadan.tech`
- [ ] Certificate auto-renewal configured
- [ ] HTTPS working

## Firewall

- [ ] Port 80 allowed: `sudo ufw allow 80/tcp`
- [ ] Port 443 allowed: `sudo ufw allow 443/tcp`
- [ ] Firewall enabled: `sudo ufw enable`

## Testing

- [ ] Health check works: `curl http://localhost:8090/mini-meeting-health`
- [ ] API endpoint works: `curl https://vps.mohamed-ramadan.tech/mini-meeting/api/v1/health`
- [ ] Login endpoint returns expected response
- [ ] Database migrations ran successfully
- [ ] Admin user created successfully

## Frontend Integration

- [ ] Frontend `VITE_API_URL` updated to: `https://vps.mohamed-ramadan.tech/mini-meeting/api/v1`
- [ ] Frontend can reach backend API
- [ ] OAuth login works from frontend
- [ ] Meeting creation works
- [ ] LiveKit integration works

## Security

- [ ] `.env` file not in version control
- [ ] Strong `JWT_SECRET` used
- [ ] Strong admin password used
- [ ] SSL/HTTPS enabled
- [ ] Firewall configured
- [ ] OAuth credentials secured

## Monitoring

- [ ] Container health checks working
- [ ] Logs accessible: `docker compose logs`
- [ ] Resource usage normal: `docker stats`
- [ ] Disk space sufficient: `df -h`

## Documentation

- [ ] `.env.example` reviewed
- [ ] Backup of `.env` created (stored securely, not in Git)
- [ ] Team members informed of deployment URL
- [ ] Documentation updated with any custom configurations

## Post-Deployment

- [ ] All API endpoints tested
- [ ] User registration works
- [ ] Email verification works
- [ ] OAuth login (Google & GitHub) works
- [ ] Meeting creation and joining works
- [ ] LiveKit video/audio works
- [ ] Admin panel accessible

## Maintenance Plan

- [ ] Log rotation configured
- [ ] Backup strategy defined
- [ ] Update procedure documented
- [ ] Monitoring/alerting set up (optional)
- [ ] Auto-renewal for SSL verified

## Rollback Plan

- [ ] Previous version backed up
- [ ] Rollback commands documented:
  ```bash
  docker compose down
  git checkout <previous-version>
  docker compose up -d --build
  ```

## Notes

Add any custom configurations or notes here:

```
[Your notes here]
```

---

**Deployment Date:** \***\*\_\_\_\*\***

**Deployed By:** \***\*\_\_\_\*\***

**Version/Commit:** \***\*\_\_\_\*\***
