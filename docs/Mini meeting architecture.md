# Mini Meeting - Monorepo Architecture

A Google Meet clone built with Go (Fiber), PostgreSQL, React, and TypeScript.

## 📁 Repository Structure

```
mini-meeting/
├── .github/
│   └── workflows/
│       ├── backend-ci.yml
│       └── frontend-ci.yml
├── backend/
│   ├── cmd/
│   │   └── server/
│   │       └── main.go
│   ├── internal/
│   │   ├── config/
│   │   │   └── config.go
│   │   ├── database/
│   │   │   ├── db.go
│   │   │   └── migrations/
│   │   ├── handlers/
│   │   │   ├── auth.go
│   │   │   ├── meeting.go
│   │   │   ├── user.go
│   │   │   └── websocket.go
│   │   ├── middleware/
│   │   │   ├── auth.go
│   │   │   ├── cors.go
│   │   │   └── logger.go
│   │   ├── models/
│   │   │   ├── user.go
│   │   │   ├── meeting.go
│   │   │   └── participant.go
│   │   ├── repositories/
│   │   │   ├── user_repository.go
│   │   │   └── meeting_repository.go
│   │   ├── services/
│   │   │   ├── auth_service.go
│   │   │   ├── meeting_service.go
│   │   │   └── webrtc_service.go
│   │   └── routes/
│   │       └── routes.go
│   ├── pkg/
│   │   ├── utils/
│   │   │   ├── jwt.go
│   │   │   ├── password.go
│   │   │   └── validator.go
│   │   └── websocket/
│   │       ├── client.go
│   │       ├── hub.go
│   │       └── message.go
│   ├── .env.example
│   ├── .gitignore
│   ├── go.mod
│   ├── go.sum
│   └── Dockerfile
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   └── styles/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   └── Modal.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Footer.tsx
│   │   │   ├── meeting/
│   │   │   │   ├── VideoGrid.tsx
│   │   │   │   ├── VideoTile.tsx
│   │   │   │   ├── Controls.tsx
│   │   │   │   ├── Chat.tsx
│   │   │   │   └── ParticipantList.tsx
│   │   │   └── auth/
│   │   │       ├── LoginForm.tsx
│   │   │       └── RegisterForm.tsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx
│   │   │   ├── MeetingContext.tsx
│   │   │   └── WebSocketContext.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useMeeting.ts
│   │   │   ├── useWebRTC.ts
│   │   │   └── useWebSocket.ts
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Meeting.tsx
│   │   │   └── NotFound.tsx
│   │   ├── services/
│   │   │   ├── api/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── meeting.ts
│   │   │   │   └── user.ts
│   │   │   ├── webrtc/
│   │   │   │   ├── peerConnection.ts
│   │   │   │   └── mediaDevices.ts
│   │   │   └── websocket/
│   │   │       └── websocket.ts
│   │   ├── types/
│   │   │   ├── auth.types.ts
│   │   │   ├── meeting.types.ts
│   │   │   └── user.types.ts
│   │   ├── utils/
│   │   │   ├── constants.ts
│   │   │   ├── helpers.ts
│   │   │   └── validators.ts
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   └── vite-env.d.ts
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.ts
│   └── Dockerfile
├── docker/
│   └── docker-compose.yml
├── scripts/
│   ├── dev.sh
│   ├── build.sh
│   └── deploy.sh
├── .gitignore
├── README.md
└── Makefile
```

## 🏗️ Architecture Overview

### Backend Architecture (Clean Architecture Pattern)

**Layers:**

1. **cmd/** - Application entry points
2. **internal/** - Private application code
   - **handlers/** - HTTP request handlers (controllers)
   - **services/** - Business logic layer
   - **repositories/** - Data access layer
   - **models/** - Database models (GORM)
   - **middleware/** - HTTP middleware
3. **pkg/** - Reusable packages

**Key Features:**

- RESTful API endpoints
- WebSocket for real-time communication
- JWT authentication
- WebRTC signaling server

### Frontend Architecture (Component-Based)

**Layers:**

1. **pages/** - Route-level components
2. **components/** - Reusable UI components
3. **contexts/** - React Context for state management
4. **hooks/** - Custom React hooks
5. **services/** - API calls and external integrations
6. **types/** - TypeScript type definitions

**Key Features:**

- WebRTC for peer-to-peer video/audio
- WebSocket for signaling and chat
- Responsive design with TailwindCSS

## 🔧 Key Components

### Backend Models

```go
// User model
type User struct {
    ID        uint      `gorm:"primaryKey"`
    Email     string    `gorm:"unique;not null"`
    Password  string    `gorm:"not null"`
    Name      string    `gorm:"not null"`
    CreatedAt time.Time
    UpdatedAt time.Time
}

// Meeting model
type Meeting struct {
    ID          uint      `gorm:"primaryKey"`
    Code        string    `gorm:"unique;not null"`
    Title       string
    HostID      uint
    Host        User
    IsActive    bool
    StartedAt   time.Time
    EndedAt     *time.Time
    Participants []Participant
    CreatedAt   time.Time
}

// Participant model
type Participant struct {
    ID        uint   `gorm:"primaryKey"`
    MeetingID uint
    UserID    uint
    User      User
    JoinedAt  time.Time
    LeftAt    *time.Time
}
```

### Frontend Core Hooks

- **useWebRTC** - Manage peer connections, local/remote streams
- **useWebSocket** - Handle signaling messages
- **useMeeting** - Meeting state management
- **useAuth** - Authentication state

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Meetings

- `POST /api/meetings` - Create new meeting
- `GET /api/meetings/:id` - Get meeting details
- `GET /api/meetings/code/:code` - Get meeting by code
- `POST /api/meetings/:id/join` - Join meeting
- `POST /api/meetings/:id/leave` - Leave meeting
- `DELETE /api/meetings/:id` - End meeting

### WebSocket

- `/ws/meeting/:code` - WebSocket endpoint for signaling

## 🚀 Development Workflow

### Setup Commands

```bash
# Clone repository
git clone <repo-url>
cd mini-meeting

# Backend setup
cd backend
cp .env.example .env
go mod download
go run cmd/server/main.go

# Frontend setup
cd frontend
cp .env.example .env
npm install
npm run dev
```

### Docker Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🗄️ Database Schema

### Tables:

1. **users** - User accounts
2. **meetings** - Meeting sessions
3. **participants** - Meeting participants (join table)

### Relationships:

- User has many Meetings (as host)
- Meeting belongs to User (host)
- Meeting has many Participants
- User has many Participants

## 🔐 Environment Variables

### Backend (.env)

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
DB_NAME=mini_meeting
JWT_SECRET=your-secret-key
PORT=8080
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080
```

## 📦 Dependencies

### Backend (go.mod)

- github.com/gofiber/fiber/v2
- gorm.io/gorm
- gorm.io/driver/postgres
- github.com/golang-jwt/jwt/v5
- github.com/gofiber/websocket/v2
- golang.org/x/crypto

### Frontend (package.json)

- react
- react-router-dom
- typescript
- tailwindcss
- vite
- axios
- socket.io-client (or native WebSocket)

## 🎯 Development Phases

### Phase 1: Foundation

- [-] Setup monorepo structure
- [-] Configure database
- [ ] Setup basic auth (backend + frontend)
- [ ] Create user models and migrations

### Phase 2: Core Features

- [ ] Meeting creation and management
- [ ] WebSocket signaling server
- [ ] Basic meeting UI
- [ ] Join/leave meeting functionality

### Phase 3: WebRTC Integration

- [ ] Peer-to-peer video/audio
- [ ] Screen sharing
- [ ] Media device management

### Phase 4: Enhanced Features

- [ ] Real-time chat
- [ ] Participant list
- [ ] Meeting controls (mute, video off/on)
- [ ] Recording (optional)

### Phase 5: Polish

- [ ] UI/UX improvements
- [ ] Performance optimization
- [ ] Testing
- [ ] Deployment

## 🛠️ Tools & Scripts

### Makefile commands:

```makefile
dev-backend:    # Run backend in dev mode
dev-frontend:   # Run frontend in dev mode
build:          # Build both apps
test:           # Run tests
migrate:        # Run database migrations
docker-up:      # Start Docker containers
```

## 📝 Notes

- Use GORM AutoMigrate for development, proper migrations for production
- Implement rate limiting for API endpoints
- Add comprehensive error handling
- Use CORS middleware properly configured
- Implement proper WebRTC TURN/STUN servers for production
- Consider Redis for session management in production
