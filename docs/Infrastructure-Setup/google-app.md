# Google OAuth Configuration

Google OAuth is used for user authentication and integration with Google services.

## How to Get Your Secrets

1. **Go to Google Cloud Console:**
   - Log in to the [Google Cloud Console](https://console.cloud.google.com/).
2. **Create/Select a Project:**
   - Click the project dropdown (top left) and select **New Project** or select an existing one.
3. **Configure OAuth Consent Screen:**
   - Navigate to **APIs & Services** > **OAuth consent screen**.
   - Select **External** and fill in the required application information.
4. **Create Credentials:**
   - Go to **APIs & Services** > **Credentials**.
   - Click **+ CREATE CREDENTIALS** > **OAuth client ID**.
   - **Application type:** Web application.
   - **Name:** "Mini-Meeting-Dev"
   - **Authorized redirect URIs:** `http://localhost:3000/api/v1/auth/google/callback`
5. **Get Credentials:**
   - After saving, a dialog will show your **Client ID** and **Client Secret**.
   - Copy these to your environment configuration.

## Configuration Variables

```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URL=http://localhost:3000/api/v1/auth/google/callback
```
