import { PROCESS_STEPS } from "./constants";

interface ProgressIndicatorProps {
  status: string;
  hasError: boolean;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  status,
  hasError,
}) => {
  const steps = [...PROCESS_STEPS];
  const currentIdx = steps.indexOf(status as (typeof PROCESS_STEPS)[number]);

  return (
    <div className="mt-4 flex items-center gap-1">
      {steps.map((step, stepIdx) => {
        const isActive = stepIdx <= currentIdx && !hasError;
        return (
          <div
            key={step}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              isActive ? "bg-brand-500" : "bg-gray-100"
            }`}
          />
        );
      })}
    </div>
  );
};
