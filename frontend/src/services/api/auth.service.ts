export const authService = {
  /**
   * Initiate OAuth login flow
   * Redirects to OAuth provider's authorization page
   */
  initiateOAuthLogin: (provider: "google" | "github"): void => {
    const backendUrl = import.meta.env.VITE_API_BASE_URL;
    window.location.href = `${backendUrl}/auth/${provider}`;
  },
};
