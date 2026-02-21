# Backend
# Mini-Meeting Backend 🚀

Go-based REST API for Mini-Meeting.

## 🛠️ Tech Stack
- **Go 1.24+**
- **GORM** (PostgreSQL)
- **LiveKit** - Real-time video infrastructure
- **JWT & OAuth 2.0** (Google & GitHub)
- **Faster-Whisper** (Local AI Transcription)

## 🚀 Quick Start
For the full development setup, please refer to the [Root README](../README.md).

To run the backend locally:
```bash
go mod download
# Copy .env.example to .env and fill in secrets
go run cmd/server/main.go
# Or with hot-reload:
air
```

## 🔄 Migrations
Read [./migrations/README.md](./migrations/README.md) for instructions on creating and running migrations.
