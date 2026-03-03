/**
 * Format examples for meeting codes
 */
export const FormatExamples = () => (
  <div className="mt-6 text-sm text-gray-500" id="meeting-format-hint">
    <p className="mb-2" role="note">
      Example formats:
    </p>
    <div className="flex flex-col sm:flex-row gap-2 justify-center">
      <code className="bg-gray-100 px-3 py-1 rounded text-xs sm:text-sm">
        https://mini-meeting.vercel.app/abc-defg-hij
      </code>
      <code className="bg-gray-100 px-3 py-1 rounded">
        or just "abc-defg-hij"
      </code>
    </div>
  </div>
);
