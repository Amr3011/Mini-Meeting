import { ErrorMessage } from "../../components/common/ErrorMessage";
import { SearchBar } from "./SearchBar";

interface PageHeaderProps {
  error: string | null;
  searchTerm: string;
  onClearError: () => void;
  onSearchChange: (term: string) => void;
}

/**
 * Admin users page header
 * Shows title, description, error, and search bar
 */
export const PageHeader = ({
  error,
  searchTerm,
  onClearError,
  onSearchChange,
}: PageHeaderProps) => (
  <div className="mb-6">
    <div className="mb-4">
      <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage all users in the system
      </p>
    </div>

    {error && (
      <div className="mb-4">
        <ErrorMessage message={error} onRetry={onClearError} />
      </div>
    )}

    <SearchBar searchTerm={searchTerm} onSearchChange={onSearchChange} />
  </div>
);
