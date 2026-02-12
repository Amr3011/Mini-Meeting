import apiClient from './client';

// --- Types ---

export interface LobbyJoinResponse {
  request_id: string;
  status: 'pending' | 'approved' | 'auto_approved';
  // Only present when auto_approved (admin)
  token?: string;
  url?: string;
  room_name?: string;
  identity?: string;
  user_name?: string;
}

export interface LobbyStatusResponse {
  status: 'pending' | 'approved' | 'rejected';
  // Only present when approved
  token?: string;
  url?: string;
  room_name?: string;
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

export interface LobbyPendingResponse {
  requests: LobbyPendingEntry[];
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
 * Poll for the status of a lobby join request.
 */
export const checkLobbyStatus = async (
  requestId: string,
  meetingCode: string
): Promise<LobbyStatusResponse> => {
  const response = await apiClient.get<LobbyStatusResponse>('/lobby/status', {
    params: { request_id: requestId, meeting_code: meetingCode },
  });
  return response.data;
};

/**
 * Get all pending lobby requests for a meeting (admin only).
 */
export const getPendingRequests = async (
  meetingCode: string
): Promise<LobbyPendingResponse> => {
  const response = await apiClient.get<LobbyPendingResponse>('/lobby/pending', {
    params: { meeting_code: meetingCode },
  });
  return response.data;
};

/**
 * Approve or reject a lobby request (admin only).
 */
export const respondToLobbyRequest = async (
  meetingCode: string,
  requestId: string,
  action: 'approve' | 'reject'
): Promise<void> => {
  await apiClient.post('/lobby/respond', {
    meeting_code: meetingCode,
    request_id: requestId,
    action,
  });
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
