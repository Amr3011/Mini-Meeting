interface PaginationInfoProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageSizeChange?: (pageSize: number) => void;
}

export const PaginationInfo: React.FC<PaginationInfoProps> = ({
  currentPage,
  pageSize,
  totalItems,
  onPageSizeChange,
}) => (
  <div className="flex items-center gap-4">
    <p className="text-sm text-gray-700">
      Showing{" "}
      <span className="font-medium">
        {Math.min((currentPage - 1) * pageSize + 1, totalItems)}
      </span>{" "}
      to{" "}
      <span className="font-medium">
        {Math.min(currentPage * pageSize, totalItems)}
      </span>{" "}
      of <span className="font-medium">{totalItems}</span> results
    </p>
    {onPageSizeChange && (
      <div className="flex items-center gap-2">
        <label htmlFor="pageSize" className="text-sm text-gray-700">
          Per page:
        </label>
        <select
          id="pageSize"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded-md border border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {[5, 10, 20, 50].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
    )}
  </div>
);
