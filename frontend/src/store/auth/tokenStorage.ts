/**
 * Token storage utilities
 * Handles localStorage and sessionStorage for auth tokens
 */

export const tokenStorage = {
  get: (): string | null => {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  },

  set: (token: string) => {
    localStorage.setItem("token", token);
    sessionStorage.removeItem("token");
  },

  remove: () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
  },
};
