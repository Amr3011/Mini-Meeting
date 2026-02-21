# GitHub OAuth Configuration

GitHub OAuth allows users to sign in to Mini-Meeting using their GitHub accounts.

## How to Get Your Secrets

1. **Go to GitHub Settings:**
   - Sign in to GitHub and go to [Settings](https://github.com/settings/profile).
2. **Developer Settings:**
   - Scroll down on the left sidebar and click on **Developer settings**.
3. **OAuth Apps:**
   - Click on **OAuth Apps** and then **New OAuth App**.
4. **Register Application:**
   - **Application name:** "Mini-Meeting-Dev"
   - **Homepage URL:** `http://localhost:3000` (or your local dev URL)
   - **Authorization callback URL:** `http://localhost:3000/api/v1/auth/github/callback`
5. **Get Credentials:**
   - Once registered, you will see your **Client ID**.
   - Click **Generate a new client secret** to get your **Client Secret**.
   - **Important:** Copy the Client Secret immediately; it will only be shown once.

## Configuration Variables

```env
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
GITHUB_REDIRECT_URL=http://localhost:3000/api/v1/auth/github/callback
```
