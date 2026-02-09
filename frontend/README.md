# Frontend

React + TypeScript web application for Mini-Meeting video conferencing.

## Tech Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **TailwindCSS** - Styling
- **LiveKit React** - Video components
- **Context API** - State management
- **React Router** - Navigation

## Features

- OAuth authentication (Google & GitHub)
- Meeting creation
- Real-time video conferencing
- Device selection (camera/microphone)
- Meeting lobby with preview
- Responsive design
- Error boundaries & loading states
- Admin user management

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

Create `.env` file:

```
VITE_API_URL=http://localhost:8080
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

## Key Routes

- `/` - Landing page
- `/login` - Login page
- `/dashboard` - User dashboard
- `/meeting/:id` - Meeting lobby
- `/room/:id` - Meeting room
- `/profile` - User profile
- `/admin/users` - Admin panel
