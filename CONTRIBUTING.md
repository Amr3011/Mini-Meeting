# Contributing to Mini-Meeting

Thank you for your interest in contributing to Mini-Meeting! We appreciate your help in making this platform better.

## 🛠️ Development Environment Setup

### 1. Prerequisites
- **Git**
- **Docker & Docker Compose** (Highly recommended)
- **Go 1.24+** (If running backend locally)
- **Node.js 20+** (If running frontend locally)

### 2. Fork and Clone
1. Fork the repository on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/mini-meeting.git
   cd mini-meeting
   ```

### 3. Choose Your Development Path

#### Option A: Docker (Recommended)
This is the easiest way to get everything running in a consistent environment.
1. [Set up your infrastructure secrets](./docs/Infrastructure-Setup/README.md).
2. Create `.env` files for both backend and frontend.
3. Start the stack:
   ```bash
   docker-compose up --build
   ```
   *The backend will automatically hot-reload when you save Go files thanks to `air`.*

#### Option B: Manual Setup
If you prefer running services directly on your host machine:

**Backend:**
```bash
cd backend
go mod download
# Set up .env variables
go run cmd/server/main.go
# Or with air for hot-reload:
air
```

**Frontend:**
```bash
cd frontend
npm install
# Set up .env variables
npm run dev
```

---

## 📂 Project Structure

- `/backend`: Go source code.
    - `/cmd/server`: Application entry point.
    - `/internal`: Core business logic, services, and models.
    - `/migrations`: GORM database migrations.
- `/frontend`: React + Vite application.
    - `/src/components`: UI components.
    - `/src/hooks`: Custom React hooks.
    - `/src/services`: API client services.
- `/docs`: Detailed documentation and setup guides.

---

## 🔄 Database Migrations

If you modify the models in the backend, you must create a migration:

1. **Windows**:
   ```powershell
   cd backend
   .\create-migration.ps1 "your_migration_name"
   ```
2. **Linux/Mac**:
   ```bash
   cd backend
   ./create-migration.sh "your_migration_name"
   ```
Read [./backend/migrations/README.md](./backend/migrations/README.md) for instructions on creating and running migrations.

---

## 📝 Pull Request Guidelines

1. **Branch Naming**: Use descriptive names like `feat/add-screen-sharing` or `fix/audio-glitch`.
2. **Quality**: Ensure your code follows Go and React best practices.
3. **Documentation**: Update the README or create a new doc in `/docs` if you introduce new features or change infrastructure requirements.
4. **Focused Changes**: Keep PRs small and focused on a single feature or bug fix.

---

## ✅ Before Submitting
- [ ] Code is formatted (`go fmt ./...` for backend).
- [ ] No linting errors.
- [ ] Features are tested manually.
- [ ] Documentation is updated if necessary.

Thank you for contributing! 🎉

