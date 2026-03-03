import React from "react";
import { Button } from "../Button";
import { errorConfigs } from "./errorConfigs";
import { ErrorHeader } from "./ErrorHeader";
import { InstructionsList } from "./InstructionsList";

interface DeviceErrorMessageProps {
  type: "access-denied" | "not-found" | "generic";
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
  const content = errorConfigs[type] || errorConfigs["generic"];

  return (
    <div
      className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full animate-scale-up"
      role="alert"
      aria-live="assertive"
    >
      <ErrorHeader
        icon={content.icon}
        title={content.title}
        onDismiss={onDismiss}
      />
      <p className="text-gray-600 mb-4">{content.message}</p>
      <InstructionsList instructions={content.instructions} />
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
