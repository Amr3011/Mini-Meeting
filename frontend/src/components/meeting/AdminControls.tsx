import React, { useState } from 'react';
import {
  useParticipants,
  useLocalParticipant,
  useTracks,
} from '@livekit/components-react';
import { Track, Participant } from 'livekit-client';
import {
  removeParticipant,
  muteParticipant,
  endMeeting,
} from '../../services/api/livekit.service';

interface AdminControlsProps {
  meetingCode: string;
  isAdmin: boolean;
  onEndMeeting: () => void;
}

export const AdminControls: React.FC<AdminControlsProps> = ({
  meetingCode,
  isAdmin,
  onEndMeeting,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEndingMeeting, setIsEndingMeeting] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();

  if (!isAdmin) {
    return null;
  }

  const handleKickParticipant = async (identity: string) => {
    try {
      await removeParticipant(meetingCode, identity);
    } catch (error) {
      console.error('Failed to kick participant:', error);
      alert('Failed to kick participant');
    }
  };

  const handleMuteTrack = async (
    identity: string,
    trackSid: string,
    muted: boolean
  ) => {
    try {
      await muteParticipant(meetingCode, identity, trackSid, muted);
    } catch (error) {
      console.error('Failed to mute participant:', error);
      alert('Failed to mute participant');
    }
  };

  const handleEndMeeting = async () => {
    if (!showEndConfirm) {
      setShowEndConfirm(true);
      return;
    }

    setIsEndingMeeting(true);
    try {
      await endMeeting(meetingCode);
      onEndMeeting();
    } catch (error) {
      console.error('Failed to end meeting:', error);
      alert('Failed to end meeting');
      setIsEndingMeeting(false);
    }
  };

  return (
    <>
      {/* Admin Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span>Admin Controls ({participants.length})</span>
        </button>
      </div>

      {/* Admin Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-96 max-h-[70vh] bg-gray-900 rounded-lg shadow-xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 className="text-white font-semibold">Admin Controls</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* End Meeting Button */}
          <div className="p-4 border-b border-gray-700">
            {showEndConfirm ? (
              <div className="space-y-2">
                <p className="text-sm text-yellow-400">
                  Are you sure? This will disconnect all participants.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleEndMeeting}
                    disabled={isEndingMeeting}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>{isEndingMeeting ? 'Ending...' : 'Confirm End'}</span>
                  </button>
                  <button
                    onClick={() => setShowEndConfirm(false)}
                    disabled={isEndingMeeting}
                    className="flex-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleEndMeeting}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>End Meeting for All</span>
              </button>
            )}
          </div>

          {/* Participants List */}
          <div className="flex-1 overflow-y-auto p-4">
            <h4 className="text-sm text-gray-400 mb-3">
              Participants ({participants.length})
            </h4>
            <div className="space-y-2">
              {participants.map((participant) => {
                const isLocal = participant.identity === localParticipant.identity;
                const metadata = participant.metadata
                  ? JSON.parse(participant.metadata)
                  : {};
                const role = metadata.role || 'guest';

                return (
                  <ParticipantItem
                    key={participant.identity}
                    participant={participant}
                    isLocal={isLocal}
                    role={role}
                    onKick={() => handleKickParticipant(participant.identity)}
                    onMuteTrack={(trackSid, muted) => handleMuteTrack(participant.identity, trackSid, muted)}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

interface ParticipantItemProps {
  participant: Participant;
  isLocal: boolean;
  role: string;
  onKick: () => void;
  onMuteTrack: (trackSid: string, muted: boolean) => void;
}

const ParticipantItem: React.FC<ParticipantItemProps> = ({
  participant,
  isLocal,
  role,
  onKick,
  onMuteTrack,
}) => {
  const tracks = useTracks(
    [Track.Source.Camera, Track.Source.Microphone, Track.Source.ScreenShare],
    { onlySubscribed: false }
  ).filter((track) => track.participant.identity === participant.identity);

  const audioTrack = tracks.find((t) => t.source === Track.Source.Microphone);
  const videoTrack = tracks.find((t) => t.source === Track.Source.Camera);
  const screenTrack = tracks.find((t) => t.source === Track.Source.ScreenShare);

  return (
    <div className="bg-gray-800 rounded-lg p-3 space-y-2">
      {/* Participant Info */}
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-white text-sm font-medium truncate">
              {participant.name || participant.identity}
            </p>
            {isLocal && (
              <span className="text-xs text-green-400 bg-green-900/30 px-2 py-0.5 rounded">
                You
              </span>
            )}
            {role === 'admin' && (
              <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded">
                Admin
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400">{role}</p>
        </div>
        {!isLocal && (
          <button
            onClick={onKick}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded transition-colors"
            title="Kick participant"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Track Controls */}
      {!isLocal && (
        <div className="flex items-center gap-2">
          {/* Microphone */}
          {audioTrack && (
            <button
              onClick={() =>
                onMuteTrack(audioTrack.publication.trackSid, !audioTrack.publication.isMuted)
              }
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                audioTrack.publication.isMuted
                  ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title={audioTrack.publication.isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {audioTrack.publication.isMuted ? (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
              <span>Mic</span>
            </button>
          )}

          {/* Camera */}
          {videoTrack && (
            <button
              onClick={() =>
                onMuteTrack(videoTrack.publication.trackSid, !videoTrack.publication.isMuted)
              }
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                videoTrack.publication.isMuted
                  ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title={videoTrack.publication.isMuted ? 'Unmute camera' : 'Mute camera'}
            >
              {videoTrack.publication.isMuted ? (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
              <span>Cam</span>
            </button>
          )}

          {/* Screen Share - Show info badge instead of stop button */}
          {screenTrack && (
            <div 
              className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-900/30 text-blue-400 rounded"
              title="To stop screen share, remove the participant"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Sharing Screen</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
