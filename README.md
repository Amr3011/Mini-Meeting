# Mini-Meeting 🎥

Mini-Meeting is a modern, lightweight video conferencing platform featuring instant AI-powered summarization. Built with Go, React, and LiveKit.

## 🏗️ Architecture

The platform follows a hybrid-cloud architecture to ensure high performance while remaining easy to deploy:

- **Local/Docker (Core)**: Backend API (Go), Frontend (React), and Faster-Whisper Server (for transcription).
- **Cloud Services**:
    - **LiveKit Cloud**: Real-time video/audio streaming.
    - **Neon**: Serverless PostgreSQL database.
    - **Redis Cloud**: Session management and caching.
    - **OpenRouter**: LLM gateway for AI summarization.
    - **Brevo**: Transactional email delivery.

---

## 🚀 Getting Started

To get the project running locally for development, follow these steps:

### 1. Prerequisites
- [Docker](https://www.docker.com/products/docker-desktop/) & [Docker Compose](https://docs.docker.com/compose/)
- [Go 1.24+](https://go.dev/dl/) (optional, for local development without Docker)
- [Node.js 20+](https://nodejs.org/) (optional, for local development without Docker)

### 2. Infrastructure Setup (Secrets)
Before running the application, you need to set up several cloud services. Follow the step-by-step guides in the `docs/Infrastructure-Setup` directory:

1.  [PostgreSQL (Neon)](./docs/Infrastructure-Setup/database.md)
2.  [Redis (Redis Cloud)](./docs/Infrastructure-Setup/redis-server.md)
3.  [LiveKit (LiveKit Cloud)](./docs/Infrastructure-Setup/livekit-server.md)
4.  [OpenRouter (AI Summarization)](./docs/Infrastructure-Setup/open-router.md)
5.  [OAuth (Google & GitHub)](./docs/Infrastructure-Setup/google-app.md)
6.  [Brevo (Email Service)](./docs/Infrastructure-Setup/bravo.md)

### 3. Environment Configuration
Copy the `.env.example` files to `.env` in both `backend` and `frontend` folders and fill in the secrets you obtained in the previous step.

**Linux/Mac:**
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

**Windows:**
```cmd
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

### 4. Run with Docker Compose
Run the entire stack (Backend, Frontend, and Whisper Server) with a single command:

```bash
docker-compose up --build
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3000](http://localhost:3000)
- **Whisper Server**: [http://localhost:9000](http://localhost:9000)

---

## 🛠️ Tech Stack

### Backend
- **Go**: High-performance REST API.
- **Faster-Whisper**: Local AI transcription server.
- **GORM**: Database ORM and migrations.
- **Air**: Hot-reloading for Entwicklung.

### Frontend
- **React 18**: UI Framework (Vite).
- **TypeScript**: Type-safe logic.
- **TailwindCSS**: Modern styling.
- **LiveKit React Components**: Pre-built video conferencing UI.

---

## 🤝 Contributing
Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

