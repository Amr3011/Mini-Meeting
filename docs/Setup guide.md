# Mini Meeting - Setup & Development Guide

## 🚀 Quick Start

### Prerequisites

- Go 1.21+
- Node.js 18+
- PostgreSQL 14+
- Docker & Docker Compose (optional)
- Make (optional but recommended)

### Option 1: Docker Setup (Recommended for beginners)

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd mini-meeting

# 2. Start all services with Docker
make docker-up

# Backend will be available at: http://localhost:8080
# Frontend will be available at: http://localhost:5173
# PostgreSQL at: localhost:5432
# pgAdmin at: http://localhost:5050 (optional)
```

### Option 2: Manual Setup

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd mini-meeting

# 2. Setup environment files
make setup

# 3. Update .env files with your configuration
# Edit backend/.env and frontend/.env

# 4. Install dependencies
make install

# 5. Start PostgreSQL (if not using Docker)
# Make sure PostgreSQL is running on localhost:5432

# 6. Run database migrations
make migrate

# 7. Start development servers
make dev
# Or run separately:
# Terminal 1: make dev-backend
# Terminal 2: make dev-frontend
```

## 📁 Project Structure Explained

### Backend (`/backend`)

```
backend/
├── cmd/server/main.go              # Application entry point
├── internal/                       # Private application code
│   ├── config/                     # Configuration management
│   ├── database/                   # Database connection & migrations
│   ├── handlers/                   # HTTP request handlers
│   │   ├── auth.go                 # Authentication endpoints
│   │   ├── meeting.go              # Meeting CRUD operations
│   │   └── websocket.go            # WebSocket signaling
│   ├── middleware/                 # HTTP middleware
│   │   ├── auth.go                 # JWT validation
│   │   ├── cors.go                 # CORS configuration
│   │   └── logger.go               # Request logging
│   ├── models/                     # GORM database models
│   │   ├── user.go
│   │   ├── meeting.go
│   │   └── participant.go
│   ├── repositories/               # Data access layer
│   │   ├── user_repository.go
│   │   └── meeting_repository.go
│   ├── services/                   # Business logic
│   │   ├── auth_service.go
│   │   ├── meeting_service.go
│   │   └── webrtc_service.go
│   └── routes/                     # Route definitions
│       └── routes.go
└── pkg/                            # Reusable packages
    ├── utils/                      # Helper utilities
    └── websocket/                  # WebSocket hub & clients
```

**Key Files to Understand:**

- **main.go**: Sets up Fiber app, connects to DB, registers routes
- **handlers/**: Process HTTP requests, validate input, return responses
- **services/**: Contain business logic, orchestrate repositories
- **repositories/**: Direct database operations using GORM
- **models/**: Define database schema and relationships

### Frontend (`/frontend`)

```
frontend/
├── src/
│   ├── components/                 # Reusable UI components
│   │   ├── common/                 # Generic components (Button, Input)
│   │   ├── layout/                 # Layout components
│   │   ├── meeting/                # Meeting-specific components
│   │   │   ├── VideoGrid.tsx       # Grid layout for video tiles
│   │   │   ├── VideoTile.tsx       # Individual video stream
│   │   │   ├── Controls.tsx        # Mute, camera, screen share
│   │   │   ├── Chat.tsx            # In-meeting chat
│   │   │   └── ParticipantList.tsx # List of participants
│   │   └── auth/                   # Auth forms
│   ├── contexts/                   # React Context providers
│   │   ├── AuthContext.tsx         # User authentication state
│   │   ├── MeetingContext.tsx      # Meeting state management
│   │   └── WebSocketContext.tsx    # WebSocket connection
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAuth.ts              # Authentication logic
│   │   ├── useMeeting.ts           # Meeting operations
│   │   ├── useWebRTC.ts            # WebRTC peer connections
│   │   └── useWebSocket.ts         # WebSocket messaging
│   ├── pages/                      # Route-level components
│   │   ├── Home.tsx                # Landing page
│   │   ├── Login.tsx               # Login page
│   │   ├── Dashboard.tsx           # User dashboard
│   │   └── Meeting.tsx             # Meeting room
│   ├── services/                   # External service integrations
│   │   ├── api/                    # REST API calls
│   │   ├── webrtc/                 # WebRTC management
│   │   └── websocket/              # WebSocket client
│   └── types/                      # TypeScript type definitions
```

## 🔧 Configuration

### Backend Configuration (`backend/.env`)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=mini_meeting

# Server
PORT=8080
ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRY=24h

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# WebRTC (optional TURN/STUN servers for production)
TURN_SERVER=
STUN_SERVER=stun:stun.l.google.com:19302
```

### Frontend Configuration (`frontend/.env`)

```env
VITE_API_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080
```

## 🗄️ Database Schema

### Users Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Meetings Table

```sql
CREATE TABLE meetings (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255),
    host_id INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Participants Table

```sql
CREATE TABLE participants (
    id SERIAL PRIMARY KEY,
    meeting_id INTEGER REFERENCES meetings(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP
);
```

## 🔌 API Endpoints

### Authentication

| Method | Endpoint             | Description       |
| ------ | -------------------- | ----------------- |
| POST   | `/api/auth/register` | Register new user |
| POST   | `/api/auth/login`    | Login user        |
| POST   | `/api/auth/logout`   | Logout user       |
| GET    | `/api/auth/me`       | Get current user  |

### Meetings

| Method | Endpoint                         | Description         |
| ------ | -------------------------------- | ------------------- |
| POST   | `/api/meetings`                  | Create meeting      |
| GET    | `/api/meetings/:id`              | Get meeting by ID   |
| GET    | `/api/meetings/code/:code`       | Get meeting by code |
| POST   | `/api/meetings/:id/join`         | Join meeting        |
| POST   | `/api/meetings/:id/leave`        | Leave meeting       |
| DELETE | `/api/meetings/:id`              | End meeting         |
| GET    | `/api/meetings/:id/participants` | List participants   |

### WebSocket

| Endpoint            | Description             |
| ------------------- | ----------------------- |
| `/ws/meeting/:code` | WebSocket for signaling |

## 📡 WebSocket Message Format

### Client → Server

```json
{
  "type": "offer" | "answer" | "ice-candidate" | "join" | "leave",
  "data": {
    "sdp": "...",           // For offer/answer
    "candidate": "...",      // For ICE candidate
    "userId": "123"
  },
  "to": "peer-id"           // Target peer
}
```

### Server → Client

```json
{
  "type": "offer" | "answer" | "ice-candidate" | "peer-joined" | "peer-left",
  "from": "peer-id",
  "data": { ... }
}
```

## 🎨 WebRTC Flow

1. **User A creates/joins meeting**
   - Connects to WebSocket
   - Gets local media stream
   - Sends "join" message

2. **User B joins meeting**
   - Connects to WebSocket
   - Gets local media stream
   - Receives "peer-joined" for User A
   - Creates RTCPeerConnection
   - Creates offer → sends to User A
   - Collects ICE candidates → sends to User A

3. **User A receives offer**
   - Creates RTCPeerConnection
   - Sets remote description (offer)
   - Creates answer → sends to User B
   - Collects ICE candidates → sends to User B

4. **Connection established**
   - Both peers exchange ICE candidates
   - Media streams are established
   - Video/audio flows peer-to-peer

## 🧪 Testing

### Backend Tests

```bash
# Run all tests
make test-backend

# Run specific package tests
cd backend
go test ./internal/services/... -v

# Run with coverage
go test -cover ./...
```

### Frontend Tests

```bash
# Run all tests
make test-frontend

# Run in watch mode
cd frontend
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

## 📦 Building for Production

```bash
# Build both applications
make build

# Build separately
make build-backend  # Creates backend/bin/server
make build-frontend # Creates frontend/dist/

# Run production builds
make prod-backend
make prod-frontend
```

## 🐳 Docker Commands

```bash
# Start all services
make docker-up

# View logs
make docker-logs

# Stop all services
make docker-down

# Rebuild images
make docker-build

# Clean everything
make docker-clean
```

## 🔍 Debugging

### Backend Debugging

- Use `fmt.Println()` or proper logging
- Enable Fiber debug mode in config
- Check logs in `backend/logs/`

### Frontend Debugging

- Use browser DevTools
- React DevTools extension
- Console.log in components
- Network tab for API calls

### Common Issues

**Database connection failed:**

```bash
# Check if PostgreSQL is running
docker ps | grep postgres
# Or
pg_isready -h localhost -p 5432
```

**Port already in use:**

```bash
# Find process using port
lsof -i :8080  # Backend
lsof -i :5173  # Frontend

# Kill process
kill -9 <PID>
```

**WebSocket connection failed:**

- Check CORS settings in backend
- Verify WS URL in frontend .env
- Check browser console for errors

## 📚 Useful Commands

```bash
# Development
make dev              # Run both servers
make dev-backend      # Run only backend
make dev-frontend     # Run only frontend

# Database
make migrate          # Run migrations
make db-reset         # Reset database

# Code quality
make lint             # Lint all code
make format           # Format all code

# Cleanup
make clean            # Remove build artifacts

# Help
make help             # Show all available commands
```

## 🚢 Deployment Considerations

1. **Environment Variables**: Never commit real secrets
2. **Database**: Use managed PostgreSQL in production
3. **TURN/STUN Servers**: Required for WebRTC in production
4. **SSL/TLS**: Required for WebRTC (getUserMedia needs HTTPS)
5. **Scaling**: Consider Redis for WebSocket scaling
6. **Monitoring**: Add logging, metrics, error tracking

## 📖 Learning Resources

- [Fiber Documentation](https://docs.gofiber.io/)
- [GORM Documentation](https://gorm.io/docs/)
- [React Documentation](https://react.dev/)
- [WebRTC Tutorial](https://webrtc.org/getting-started/overview)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TailwindCSS Docs](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open Pull Request

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.
