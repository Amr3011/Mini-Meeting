# Backend

Go-based REST API for Mini-Meeting video conferencing platform.

## Tech Stack

- **Go** - Backend language
- **PostgreSQL** - Database
- **Redis** - Caching & state management
- **LiveKit** - Real-time video infrastructure
- **JWT** - Authentication
- **OAuth 2.0** - Google & GitHub login
- **Docker** - Containerization

## Features

- User authentication (OAuth + JWT)
- Meeting management (create, join)
- LiveKit integration for video rooms
- Token generation for secure meeting access
- User profile management

## Quick Start

```bash
# Run with Docker
docker-compose up

# Run locally (requires PostgreSQL & Redis)
go run cmd/server/main.go

# Run with hot reload
air
```

## Environment Variables

See `.env.example` or `docker-compose.yml` for required configuration:

- Database credentials
- Redis connection
- LiveKit server details
- OAuth client IDs/secrets
- JWT secret

## API Structure

- `/api/auth/*` - Authentication endpoints
- `/api/meetings/*` - Meeting operations
- `/api/users/*` - User management
- `/api/livekit/*` - Video room tokens

## Database Migrations

```bash
# Create migration
./create-migration.sh migration_name

# Migrations run automatically on startup
```
