import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles/index.css';
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
      <div className="flex items-center justify-center h-screen">
        <Loading text="Connecting to meeting..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="max-w-md">
          <ErrorMessage message={error} />
        </div>
      </div>
    );
  }

  if (!token || !livekitUrl) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="max-w-md">
          <ErrorMessage message="Failed to connect to meeting. Please try again." />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen">
      <LiveKitRoom
        token={token}
        serverUrl={livekitUrl}
        connect={true}
        onDisconnected={onDisconnect}
        style={{ height: '100%' }}
      >
        {/* VideoConference provides a full-featured meeting UI */}
        <VideoConference />
      </LiveKitRoom>
    </div>
  );
};

export default LiveKitMeetingRoom;
