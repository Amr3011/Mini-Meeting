import React from "react";
import { Input } from "../../components/common/Input";

interface NameInputProps {
  displayName: string;
  setDisplayName: (name: string) => void;
}

export const NameInput: React.FC<NameInputProps> = ({
  displayName,
  setDisplayName,
}) => {
  return (
    <div className="pt-2">
      <Input
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        placeholder="Enter your name"
        className="bg-gray-700 border-gray-600"
        maxLength={50}
        aria-label="Enter your display name"
        aria-required="true"
      />
    </div>
  );
};
