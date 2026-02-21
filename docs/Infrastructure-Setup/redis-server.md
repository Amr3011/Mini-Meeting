# Redis Configuration

Redis is used for session management, caching, and rate limiting. For development, we recommend using [Redis Cloud](https://redis.io/cloud/).

## How to Get Your Secrets

1. **Sign Up:**
   - Create a free account at [Redis Cloud](https://redis.io/cloud/).
2. **Create a Database:**
   - Click **Create a free database**.
   - Choose a name (e.g., `mini-meeting-dev`) and select your preferred cloud provider and region.
3. **Get Credentials:**
   - Once the database is created, click on its name to see the details.
   - **Endpoint:** This contains your `REDIS_HOST` and `REDIS_PORT` (e.g., `redis-12345.c123.us-east-1-1.ec2.cloud.redislabs.com:12345`).
   - **Password:** Scroll down to the **Security** section to find your password.
   - **Username:** Redis Cloud typically uses the `default` username.

## Configuration Variables

```env
REDIS_HOST=your_redis_endpoint_here (exclude the port)
REDIS_PORT=your_redis_port_here
REDIS_USERNAME=default
REDIS_PASSWORD=your_redis_password_here
```

