import { UserDTO, UserWithProfilePictureDTO } from '@ducky-coding/types/DTOs';
import { UsersRepository } from '../repositories/users.repository';
import { InsertUser } from '../models';

const getUser = async (userId: number): Promise<UserDTO | undefined> => {
  const selectedUsers = await UsersRepository.getUsers([userId]);
  if (selectedUsers.length === 0) return undefined;

  const userDTO: UserDTO = selectedUsers[0];
  return userDTO;
};

const getUsersByField = async (fieldValuePair: {
  field: string;
  value: string | number;
}): Promise<UserDTO[]> => {
  const selectedUsers = await UsersRepository.getUsersByField(fieldValuePair);
  return selectedUsers;
};
const getUserByUsername = async (
  username: string,
): Promise<UserDTO | undefined> => {
  const selectedUsers = await UsersRepository.getUsersByUsername([username]);
  if (selectedUsers.length === 0) return undefined;
  return selectedUsers[0];
};

const getUsers = async (userIds: number[]): Promise<UserDTO[]> => {
  const selectedUsers = await UsersRepository.getUsers(userIds);
  return selectedUsers;
};

const getUsersByUsernames = async (usernames: string[]): Promise<UserDTO[]> => {
  const selectedUsers = await UsersRepository.getUsersByUsername(usernames);
  return selectedUsers;
};

const getAllUsers = async (): Promise<UserDTO[]> => {
  const selectedUsers = await UsersRepository.getAllUsers();
  return selectedUsers;
};

const getUserWithProfilePicture = async (
  userId: number,
): Promise<UserWithProfilePictureDTO | undefined> => {
  const selectedUserWithProfilePicture =
    await UsersRepository.getUsersWithProfilePicture([userId]);
  if (selectedUserWithProfilePicture.length === 0) return undefined;
  return selectedUserWithProfilePicture[0];
};

const getUsersWithProfilePicture = async (
  userIds: number[],
): Promise<UserWithProfilePictureDTO[]> => {
  const selectedUserWithProfilePicture =
    await UsersRepository.getUsersWithProfilePicture(userIds);
  return selectedUserWithProfilePicture;
};

const getAllUsersWithProfilePicture = async (): Promise<
  UserWithProfilePictureDTO[]
> => {
  const selectedUsersWithProfilePicture: UserWithProfilePictureDTO[] =
    await UsersRepository.getAllUsersWithProfilePicture();

  return selectedUsersWithProfilePicture;
};

const insertUser = async (
  userToInsert: InsertUser,
): Promise<UserDTO | undefined> => {
  const insertedUsers = await UsersRepository.insertUsers([userToInsert]);
  if (insertedUsers.length === 0) return undefined;
  return insertedUsers[0];
};

const findUserByField = async (fieldValuePair: {
  field: string;
  value: string | number;
}): Promise<boolean> => {
  const selectedUsers = await UsersRepository.findUserByField(fieldValuePair);
  return selectedUsers;
};

export const UsersService = {
  getUser,
  getUsersByField,
  getUserByUsername,
  getUsers,
  getUsersByUsernames,
  getAllUsers,
  getUserWithProfilePicture,
  getUsersWithProfilePicture,
  getAllUsersWithProfilePicture,
  insertUser,

  findUserByField,
};

// Add more methods as needed
