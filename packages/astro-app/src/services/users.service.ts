import { UsersService as DBUsersService } from '@ducky-coding/db/services';

const getUserByUsername = async (username: string) => {
  return DBUsersService.getUserByUsername(username);
};

const getUserByEmail = async (email: string) => {
  return DBUsersService.getUserByEmail(email);
};

export const UsersService = {
  getUserByUsername,
  getUserByEmail,
};
