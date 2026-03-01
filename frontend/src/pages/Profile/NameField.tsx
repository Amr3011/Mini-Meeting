import { Button } from "../../components/common/Button";

interface NameFieldProps {
  isEditing: boolean;
  currentName: string;
  editedName: string;
  isLoading: boolean;
  onEdit: () => void;
  onChange: (name: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const NameField: React.FC<NameFieldProps> = ({
  isEditing,
  currentName,
  editedName,
  isLoading,
  onEdit,
  onChange,
  onSave,
  onCancel,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      Full Name
    </label>
    {!isEditing ? (
      <div className="flex items-center gap-3">
        <p className="text-lg text-gray-900">{currentName}</p>
        <button
          onClick={onEdit}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
          title="Edit name"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
            />
          </svg>
        </button>
      </div>
    ) : (
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={editedName}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your full name"
          autoFocus
        />
        <Button
          onClick={onSave}
          isLoading={isLoading}
          disabled={isLoading}
          className="py-2!"
        >
          Save
        </Button>
        <Button
          onClick={onCancel}
          variant="secondary"
          disabled={isLoading}
          className="py-2!"
        >
          Cancel
        </Button>
      </div>
    )}
  </div>
);
