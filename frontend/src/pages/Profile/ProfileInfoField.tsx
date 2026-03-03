interface ProfileInfoFieldProps {
  label: string;
  value: string | React.ReactNode;
}

export const ProfileInfoField: React.FC<ProfileInfoFieldProps> = ({
  label,
  value,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    {typeof value === "string" ? (
      <p className="text-lg text-gray-900">{value}</p>
    ) : (
      <div className="flex">{value}</div>
    )}
  </div>
);
