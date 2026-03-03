import React from "react";
import type { UserRowProps } from "./types";

export const UserRow: React.FC<UserRowProps> = ({
  user,
  currentUserId,
  onDeleteClick,
}) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
              {user.name}
              {user.role === "admin" && (
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                  Admin
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            user.provider === "google"
              ? "bg-red-100 text-red-800"
              : user.provider === "github"
                ? "bg-gray-800 text-white"
                : "bg-blue-100 text-blue-800"
          }`}
        >
          {user.provider.charAt(0).toUpperCase() + user.provider.slice(1)}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {new Date(user.created_at).toLocaleDateString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          onClick={() => onDeleteClick(user)}
          className="text-red-600 hover:text-red-900"
          disabled={user.id === currentUserId}
        >
          Delete
        </button>
      </td>
    </tr>
  );
};
