# Database Configuration

Mini-Meeting uses PostgreSQL for data persistence. We recommend using [Neon](https://neon.tech/) for its serverless capabilities and ease of use during development.

## How to Get Your Secrets

1. **Sign Up for Neon:**
   - Create an account at [Neon.tech](https://neon.tech/).
2. **Create a New Project:**
   - Click **Create a project**.
   - Name it (e.g., `mini-meeting-dev`).
   - Select the region closest to you.
3. **Get Connection String:**
   - On the project dashboard, find the **Connection Details** section.
   - Choose **PostgreSQL** from the dropdown.
   - Ensure the "Pooled connection" checkbox is selected if you're using it in a serverless environment (recommended).
   - Copy the `DATABASE_URL`.
4. **Initialize Schema:**
   - The application will automatically run migrations on startup, or you can run `go run main.go migrate` (or equivalent) depending on the project structure.

## Configuration Variables

```env
# Example DATABASE_URL
DATABASE_URL=postgresql://your_user:your_password@your_host.neon.tech/neondb?sslmode=require
```
