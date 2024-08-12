import { UserDTO, UserWithProfilePictureDTO } from '@ducky-coding/types/DTOs';
import { UsersRepository } from '../repositories/users.repository';

const getUser = async (userId: number): Promise<UserDTO | undefined> => {
  const selectedUsers = await UsersRepository.getUsers([userId]);
  if (selectedUsers.length === 0) return undefined;

  const userDTO: UserDTO = selectedUsers[0];
  return userDTO;
};

const getUsers = async (userIds: number[]): Promise<UserDTO[]> => {
  const selectedUsers = await UsersRepository.getUsers(userIds);
  return selectedUsers;
};

const getUsersByUsername = async (usernames: string[]): Promise<UserDTO[]> => {
  const selectedTopics = await UsersRepository.getUsersByUsername(usernames);
  return selectedTopics;
};

const getAllUsers = async (): Promise<UserDTO[]> => {
  const selectedUsers = await UsersRepository.getAllUsers();
  return selectedUsers;
};

const getAllUsersWithProfilePicture = async (): Promise<
  UserWithProfilePictureDTO[]
> => {
  const selectedTopicWithImages: UserWithProfilePictureDTO[] =
    await UsersRepository.getAllUsersWithProfilePicture();

  return selectedTopicWithImages;
};

export const TopicsService = {
  getUser,
  getUsers,
  getUsersByUsername,
  getAllUsers,
  getAllUsersWithProfilePicture,
};

// Add more methods as needed
