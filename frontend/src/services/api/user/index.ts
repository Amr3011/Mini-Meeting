import { userProfileService } from "./user-profile.service";
import { userAdminService } from "./user-admin.service";
import { sessionService } from "./session.service";

/**
 * Combined user service
 * Exports all user-related operations
 */
export const userService = {
  getCurrentUser: userProfileService.getCurrentUser,
  updateCurrentUser: userProfileService.updateCurrentUser,
  getAllUsers: userAdminService.getAllUsers,
  getUserById: userAdminService.getUserById,
  createUser: userAdminService.createUser,
  updateUser: userAdminService.updateUser,
  deleteUser: userAdminService.deleteUser,
  getSessions: sessionService.getSessions,
  getSession: sessionService.getSession,
  deleteSession: sessionService.deleteSession,
};
