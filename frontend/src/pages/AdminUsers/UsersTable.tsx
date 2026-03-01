import React from "react";
import { UserRow } from "./UserRow";
import type { UsersTableProps } from "./types";

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  currentUserId,
  onDeleteUser,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sign Up Method
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                No users found
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                currentUserId={currentUserId}
                onDeleteClick={onDeleteUser}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
