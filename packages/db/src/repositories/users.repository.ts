import { eq, inArray } from 'drizzle-orm';
import { UserDTO, UserWithProfilePictureDTO } from '@ducky-coding/types/DTOs';
import { db } from '../client';
import { ImagesTable, InsertUser, mapToUserDTO, UsersTable } from '../models';
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

const getUsersByUsername = async (usernames: string[]): Promise<UserDTO[]> => {
  const users = await db
    .select()
    .from(UsersTable)
    .where(inArray(UsersTable.username, usernames));
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

const insertUsers = async (users: InsertUser[]): Promise<UserDTO[]> => {
  const insertedUsers = await db
    .insert(UsersTable)
    .values(
      users.map((user) => {
        return {
          username: user.username,
          password: user.password,
          name: user.name,
          email: user.email,
        };
      }),
    )
    .returning();

  return insertedUsers.map((insertedUser) => mapToUserDTO(insertedUser));
};

export const UsersRepository = {
  getUsers,
  getUsersByUsername,
  getUsersWithProfilePicture,
  getUsersWithProfilePictureByUsername,
  getAllUsers,
  getAllUsersWithProfilePicture,

  insertUsers,
};
