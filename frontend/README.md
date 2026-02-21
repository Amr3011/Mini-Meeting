# Mini-Meeting Frontend ⚛️

React + TypeScript web application for Mini-Meeting.

## 🛠️ Tech Stack
- **React 18** (Vite)
- **TypeScript**
- **TailwindCSS**
- **LiveKit React Components**

## 🚀 Quick Start
For the full development setup, please refer to the [Root README](../README.md).

To run the frontend locally:
```bash
npm install
# Setup .env (see root .env.example)
npm run dev
```

## 🌐 Environment Variables
Required in `.env`:
```
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

## Project Structure

- `components/` - Reusable UI components
  - `auth/` - Login, register, protected routes
  - `meeting/` - Meeting-related components
  - `common/` - Shared components
  - `layout/` - Layout components
- `pages/` - Route pages
- `contexts/` - React contexts (auth, etc.)
- `hooks/` - Custom hooks
- `services/` - API integration
- `types/` - TypeScript definitions
- `utils/` - Helper functions
