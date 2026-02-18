import apiClient from './client';
import API_BASE_URL from '../../utils/constants';

// --- Types ---

export interface LobbyJoinResponse {
  request_id: string;
  status: 'pending' | 'approved' | 'auto_approved';
  // Only present when auto_approved (admin)
  token?: string;
  url?: string;
  room_code?: string;
  identity?: string;
  user_name?: string;
}

export interface LobbyPendingEntry {
  request_id: string;
  name: string;
  avatar_url?: string;
  role: string;
  created_at: number;
}

// --- API Calls ---

/**
 * Request to join a meeting. If the user is the admin, they get auto-approved
 * with a token. Otherwise, a pending request is created.
 */
export const requestToJoin = async (
  meetingCode: string,
  userName?: string
): Promise<LobbyJoinResponse> => {
  const response = await apiClient.post<LobbyJoinResponse>('/lobby/request', {
    meeting_code: meetingCode,
    user_name: userName,
  });
  return response.data;
};

/**
 * Cancel a pending lobby request (called by the waiting user).
 */
export const cancelLobbyRequest = async (
  requestId: string
): Promise<void> => {
  await apiClient.delete('/lobby/request', {
    params: { request_id: requestId },
  });
};

// --- WebSocket URL helpers ---

/**
 * Build a WebSocket URL for the lobby endpoints.
 * Converts the HTTP API base URL to a WebSocket URL.
 */
export function getLobbyWsUrl(path: string, params: Record<string, string>): string {
  // Convert HTTP URL to WS URL
  // API_BASE_URL is like "http://localhost:3000/api/v1"
  // We need "ws://localhost:3000/ws/lobby/..."
  const httpBase = API_BASE_URL.replace(/\/api\/v1$/, '');
  const wsBase = httpBase.replace(/^http/, 'ws');

  const searchParams = new URLSearchParams(params).toString();
  return `${wsBase}${path}?${searchParams}`;
}

/**
 * Get the WebSocket URL for a visitor waiting to join.
 */
export function getVisitorWsUrl(requestId: string, meetingCode: string): string {
  return getLobbyWsUrl('/ws/lobby/visitor', {
    request_id: requestId,
    meeting_code: meetingCode,
  });
}

/**
 * Get the WebSocket URL for an admin managing the lobby.
 */
export function getAdminWsUrl(meetingCode: string): string {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token') || '';
  return getLobbyWsUrl('/ws/lobby/admin', {
    meeting_code: meetingCode,
    token,
  });
}
