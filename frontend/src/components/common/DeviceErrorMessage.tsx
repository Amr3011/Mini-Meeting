import React from 'react';
import { Button } from './Button';

interface DeviceErrorMessageProps {
  type: 'access-denied' | 'not-found' | 'generic';
  onRetry?: () => void;
  onDismiss?: () => void;
}

/**
 * DeviceErrorMessage component displays user-friendly error messages
 * for device access issues with actionable instructions
 */
export const DeviceErrorMessage: React.FC<DeviceErrorMessageProps> = ({
  type,
  onRetry,
  onDismiss,
}) => {
  const getErrorContent = () => {
    switch (type) {
      case 'access-denied':
        return {
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
              />
            </svg>
          ),
          title: 'Camera and Microphone Access Required',
          message: 'Please enable camera and microphone access in your browser settings to join the meeting.',
          instructions: [
            'Click the camera icon in your browser\'s address bar',
            'Select "Allow" for camera and microphone',
            'Refresh the page and try again',
          ],
        };
      
      case 'not-found':
        return {
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          ),
          title: 'No Camera or Microphone Found',
          message: 'We couldn\'t detect a camera or microphone on your device.',
          instructions: [
            'Make sure your camera and microphone are properly connected',
            'Check if other applications are using your devices',
            'Try a different USB port if using external devices',
          ],
        };
      
      case 'generic':
      default:
        return {
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          ),
          title: 'Device Access Error',
          message: 'Failed to access your camera and microphone. Please check your device settings.',
          instructions: [
            'Ensure no other applications are using your devices',
            'Check your system permissions for camera and microphone',
            'Try restarting your browser',
          ],
        };
    }
  };

  const content = getErrorContent();

  return (
    <div 
      className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full animate-scale-up"
      role="alert"
      aria-live="assertive"
    >
      {/* Icon and Title */}
      <div className="flex items-start mb-4">
        <div className="shrink-0 w-12 h-12 bg-danger-100 rounded-full flex items-center justify-center text-danger-600">
          {content.icon}
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {content.title}
          </h3>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss error message"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Message */}
      <p className="text-gray-600 mb-4">
        {content.message}
      </p>

      {/* Instructions */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">
          How to fix this:
        </p>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
          {content.instructions.map((instruction, index) => (
            <li key={index}>{instruction}</li>
          ))}
        </ol>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="primary"
            size="md"
            aria-label="Retry device access"
          >
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
};
