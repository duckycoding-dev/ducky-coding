import { eq, inArray } from 'drizzle-orm';
import { UserDTO, UserWithProfilePictureDTO } from '@ducky-coding/types/DTOs';
import { db } from '../client';
import { ImagesTable, mapToUserDTO, UsersTable } from '../models';
import { mapToUserWithProfilePictureDTO } from '../mappers/users.mappers';

const getUsers = async (userIds: number[]): Promise<UserDTO[]> => {
  const users = await db
    .select()
    .from(UsersTable)
    .where(inArray(UsersTable.id, userIds));

  const userDTOs: UserDTO[] = users.map((user) => {
    return mapToUserDTO(user);
  });
  return userDTOs;
};

const getUsersByUsernames = async (usernames: string[]): Promise<UserDTO[]> => {
  const users = await db
    .select()
    .from(UsersTable)
    .where(inArray(UsersTable.username, usernames));
  const userDTOs: UserDTO[] = users.map((user) => {
    return mapToUserDTO(user);
  });
  return userDTOs;
};

const getUsersByEmails = async (emails: string[]): Promise<UserDTO[]> => {
  const users = await db
    .select()
    .from(UsersTable)
    .where(inArray(UsersTable.email, emails));
  const userDTOs: UserDTO[] = users.map((user) => {
    return mapToUserDTO(user);
  });
  return userDTOs;
};

const getAllUsers = async (): Promise<UserDTO[]> => {
  const users = await db.select().from(UsersTable).all();
  const userDTOs: UserDTO[] = users.map((user) => {
    return mapToUserDTO(user);
  });
  return userDTOs;
};

const getUsersWithProfilePictureByUsername = async (
  usernames: string[],
): Promise<UserWithProfilePictureDTO[]> => {
  const usersWithProfilePicture = await db
    .select()
    .from(UsersTable)
    .leftJoin(ImagesTable, eq(UsersTable.profilePictureId, ImagesTable.id))
    .where(inArray(UsersTable.username, usernames));

  const userWithProfilePictureDTOs: UserWithProfilePictureDTO[] =
    usersWithProfilePicture.map((userWithProfilePicture) => {
      return mapToUserWithProfilePictureDTO(
        userWithProfilePicture.users,
        userWithProfilePicture.images,
      );
    });
  return userWithProfilePictureDTOs;
};

const getUsersWithProfilePicture = async (
  userIds: number[],
): Promise<UserWithProfilePictureDTO[]> => {
  const usersWithProfilePicture = await db
    .select()
    .from(UsersTable)
    .leftJoin(ImagesTable, eq(UsersTable.profilePictureId, ImagesTable.id))
    .where(inArray(UsersTable.id, userIds));
  const userWithProfilePictureDTOs: UserWithProfilePictureDTO[] =
    usersWithProfilePicture.map((userWithProfilePicture) => {
      return mapToUserWithProfilePictureDTO(
        userWithProfilePicture.users,
        userWithProfilePicture.images,
      );
    });
  return userWithProfilePictureDTOs;
};

const getAllUsersWithProfilePicture = async (): Promise<
  UserWithProfilePictureDTO[]
> => {
  const usersWithProfilePicture = await db
    .select()
    .from(UsersTable)
    .leftJoin(ImagesTable, eq(UsersTable.profilePictureId, ImagesTable.id))
    .all();
  const userWithProfilePictureDTOs: UserWithProfilePictureDTO[] =
    usersWithProfilePicture.map((userWithProfilePicture) => {
      return mapToUserWithProfilePictureDTO(
        userWithProfilePicture.users,
        userWithProfilePicture.images,
      );
    });
  return userWithProfilePictureDTOs;
};

export const UsersRepository = {
  getUsers,
  getUsersByUsernames,
  getUsersByEmails,
  getUsersWithProfilePicture,
  getUsersWithProfilePictureByUsername,
  getAllUsers,
  getAllUsersWithProfilePicture,
};
