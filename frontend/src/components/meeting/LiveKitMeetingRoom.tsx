import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';
import { useLiveKit } from '../../hooks/useLiveKit';
import { Loading } from '../common/Loading';
import { ErrorMessage } from '../common/ErrorMessage';

interface LiveKitMeetingRoomProps {
  meetingCode: string;
  userName?: string;
  onDisconnect?: () => void;
}

/**
 * LiveKit Meeting Room Component
 * Handles video conferencing for a meeting using LiveKit
 */
const LiveKitMeetingRoom: React.FC<LiveKitMeetingRoomProps> = ({
  meetingCode,
  userName,
  onDisconnect,
}) => {
  const {
    token,
    livekitUrl,
    isLoading,
    error,
  } = useLiveKit({
    meetingCode,
    userName,
    autoConnect: true,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-linear-to-br from-[#0f1219] via-[#111827] to-[#0f1219]">
        <Loading text="Connecting to meeting..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-linear-to-br from-[#0f1219] via-[#111827] to-[#0f1219]">
        <div className="max-w-md">
          <ErrorMessage message={error} />
        </div>
      </div>
    );
  }

  if (!token || !livekitUrl) {
    return (
      <div className="flex items-center justify-center h-screen bg-linear-to-br from-[#0f1219] via-[#111827] to-[#0f1219]">
        <div className="max-w-md">
          <ErrorMessage message="Failed to connect to meeting. Please try again." />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-[#0f1219]">
      <LiveKitRoom
        token={token}
        serverUrl={livekitUrl}
        connect={true}
        onDisconnected={onDisconnect}
        data-lk-theme="default"
        style={{ height: '100%' }}
      >
        <VideoConference />
      </LiveKitRoom>
    </div>
  );
};

export default LiveKitMeetingRoom;
