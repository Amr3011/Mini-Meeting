interface DeviceSelectorProps {
  label?: string;
  devices: MediaDeviceInfo[];
  selectedId?: string;
  onSelect: (deviceId: string) => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
  fallbackLabel?: string;
  variant?: "light" | "dark";
}

const ChevronIcon: React.FC = () => (
  <svg
    className="w-4 h-4 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

const variantClasses = {
  light:
    "px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900",
  dark: "w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2.5 pr-8 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-600 appearance-none cursor-pointer",
};

const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  label,
  devices,
  selectedId,
  onSelect,
  icon,
  disabled = false,
  ariaLabel,
  fallbackLabel,
  variant = "dark",
}) => {
  const selectElement = (
    <div className="relative">
      <select
        value={selectedId}
        onChange={(e) => onSelect(e.target.value)}
        className={variantClasses[variant]}
        disabled={disabled || devices.length === 0}
        aria-label={ariaLabel || label}
        title={label}
      >
        {devices.map((device, index) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label ||
              `${fallbackLabel || label || "Device"} ${index + 1}`}
          </option>
        ))}
      </select>
      {variant === "dark" && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronIcon />
        </div>
      )}
    </div>
  );

  if (variant === "light" && label) {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          {icon}
          {label}
        </label>
        {selectElement}
      </div>
    );
  }

  return selectElement;
};

export default DeviceSelector;
