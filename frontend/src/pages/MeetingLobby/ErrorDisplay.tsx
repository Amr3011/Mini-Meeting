import { ErrorMessage } from "../../components/common/ErrorMessage";
import { DeviceErrorMessage } from "../../components/common/DeviceErrorMessage";

interface ErrorDisplayProps {
  deviceError: "access-denied" | "not-found" | "generic" | null;
  error: string;
  onClearDeviceError: () => void;
  onRetryDeviceAccess: () => void;
  onClearError: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  deviceError,
  error,
  onClearDeviceError,
  onRetryDeviceAccess,
  onClearError,
}) => {
  if (deviceError) {
    return (
      <div className="mb-6">
        <DeviceErrorMessage
          type={deviceError}
          onRetry={() => {
            onClearDeviceError();
            onRetryDeviceAccess();
          }}
          onDismiss={onClearDeviceError}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6">
        <ErrorMessage message={error} onRetry={onClearError} />
      </div>
    );
  }

  return null;
};
