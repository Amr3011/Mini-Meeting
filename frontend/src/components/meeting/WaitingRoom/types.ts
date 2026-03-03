export interface WaitingRoomProps {
  requestId: string;
  meetingCode: string;
  displayName: string;
  onApproved: (tokenData: {
    token: string;
    url: string;
    room_code: string;
    identity: string;
    user_name: string;
  }) => void;
  onCancel: () => void;
}

export type WaitingStatus = "pending" | "approved" | "rejected";
