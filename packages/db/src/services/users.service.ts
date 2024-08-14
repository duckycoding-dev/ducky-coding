import { UserDTO, UserWithProfilePictureDTO } from '@ducky-coding/types/DTOs';
import { UsersRepository } from '../repositories/users.repository';

const getUser = async (userId: number): Promise<UserDTO | undefined> => {
  const selectedUsers = await UsersRepository.getUsers([userId]);
  if (selectedUsers.length === 0) return undefined;

  const userDTO: UserDTO = selectedUsers[0];
  return userDTO;
};
const getUserByUsername = async (
  username: string,
): Promise<UserDTO | undefined> => {
  const selectedUsers = await UsersRepository.getUsersByUsernames([username]);
  if (selectedUsers.length === 0) return undefined;
  return selectedUsers[0];
};

const getUserByEmail = async (email: string): Promise<UserDTO | undefined> => {
  const selectedUsers = await UsersRepository.getUsersByEmails([email]);
  if (selectedUsers.length === 0) return undefined;
  return selectedUsers[0];
};

const getUsers = async (userIds: number[]): Promise<UserDTO[]> => {
  const selectedUsers = await UsersRepository.getUsers(userIds);
  return selectedUsers;
};

const getUsersByUsernames = async (usernames: string[]): Promise<UserDTO[]> => {
  const selectedUsers = await UsersRepository.getUsersByUsernames(usernames);
  return selectedUsers;
};

const getUsersByEmails = async (emails: string[]): Promise<UserDTO[]> => {
  const selectedUsers = await UsersRepository.getUsersByEmails(emails);
  return selectedUsers;
};

const getAllUsers = async (): Promise<UserDTO[]> => {
  const selectedUsers = await UsersRepository.getAllUsers();
  return selectedUsers;
};

const getAllUsersWithProfilePicture = async (): Promise<
  UserWithProfilePictureDTO[]
> => {
  const selectedUsersWithProfilePicture: UserWithProfilePictureDTO[] =
    await UsersRepository.getAllUsersWithProfilePicture();

  return selectedUsersWithProfilePicture;
};

export const UsersService = {
  getUser,
  getUserByUsername,
  getUserByEmail,
  getUsers,
  getUsersByUsernames,
  getUsersByEmails,
  getAllUsers,
  getAllUsersWithProfilePicture,
};

// Add more methods as needed
