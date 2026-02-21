# Brevo Email Configuration

Brevo (formerly Sendinblue) is used for sending transactional emails (e.g., meeting summaries).

## How to Get Your Secrets

1. **Create an Account:**
   - Sign up at [Brevo](https://www.brevo.com/).
2. **Access API Keys:**
   - Go to your dashboard and navigate to **Settings** (top right) > **SMTP & API**.
   - Alternatively, use this direct link: [Brevo API Keys](https://app.brevo.com/settings/keys/api).
3. **Generate API Key:**
   - Click **Generate a new API key**.
   - Give it a name (e.g., "Mini-Meeting-Dev") and click **Generate**.
   - **Important:** Copy the key immediately; you won't be able to see it again.

## Configuration Variables

```env
BRAVO_API_KEY=your_brevo_api_key_here
BREVO_SENDER_EMAIL=your_verified_sender_email@example.com
BREVO_SENDER_NAME="Mini Meeting"
```
