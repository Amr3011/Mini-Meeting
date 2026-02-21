# OpenRouter Configuration

OpenRouter is used as a gateway to access various Large Language Models (LLMs) for features like meeting summarization.

## How to Get Your Secrets

1. **Sign Up:**
   - Go to [OpenRouter.ai](https://openrouter.ai/) and create an account.
2. **Access Keys:**
   - Navigate to the [Keys](https://openrouter.ai/keys) section in your account settings.
3. **Create Key:**
   - Click **Create Key**.
   - Assign a name (e.g., "Mini-Meeting-Dev").
   - **Important:** Copy the key and store it securely; it will not be shown again.
4. **Choose a Model:**
   - You can use free models (e.g., `nvidia/nemotron-3-nano-30b-a3b:free`) for testing, or paid models for better quality.

## Configuration Variables

```env
OPEN_ROUTER_API_KEY=your_open_router_api_key_here
OPEN_ROUTER_BASE_URL=https://openrouter.ai/api/v1
OPEN_ROUTER_MODEL=nvidia/nemotron-3-nano-30b-a3b:free
OPEN_ROUTER_TIMEOUT=300s
OPEN_ROUTER_MAX_TOKENS=4096
```
