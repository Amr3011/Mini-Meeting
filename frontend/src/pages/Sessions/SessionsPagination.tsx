import type { SessionsPaginationProps } from "./types";

export const SessionsPagination: React.FC<SessionsPaginationProps> = ({
  page,
  totalPages,
  onPageChange,
}) => (
  <div className="flex justify-center mt-8 gap-2">
    <button
      onClick={() => onPageChange(Math.max(1, page - 1))}
      disabled={page === 1}
      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Previous
    </button>
    <span className="px-4 py-2 text-sm font-medium text-gray-700">
      Page {page} of {totalPages}
    </span>
    <button
      onClick={() => onPageChange(Math.min(totalPages, page + 1))}
      disabled={page === totalPages}
      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Next
    </button>
  </div>
);
