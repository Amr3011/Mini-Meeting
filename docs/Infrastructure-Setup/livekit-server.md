# LiveKit Configuration

LiveKit is used for the core real-time video/audio conferencing capabilities. For development, we recommend using [LiveKit Cloud](https://livekit.io/cloud).

## How to Get Your Secrets

1. **Sign Up:**
   - Create a free account at [LiveKit Cloud](https://cloud.livekit.io/).
2. **Create a Project:**
   - Create a new project in the dashboard.
3. **Get Settings:**
   - Go to your project **Settings**.
   - Navigate to **Keys** and create a new **API Key**.
4. **Copy Details:**
   - Copy the **API Key**, **API Secret**, and the **Server URL** (e.g., `wss://your-project.livekit.cloud`).

## Configuration Variables

```env
LIVEKIT_API_KEY=your_api_key_here
LIVEKIT_API_SECRET=your_api_secret_here
LIVEKIT_URL=wss://your-project.livekit.cloud
```
