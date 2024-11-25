import { eq, inArray, SQL } from 'drizzle-orm';
import type {
  ImageDTO,
  UserDTO,
  UserWithProfilePictureDTO,
} from '@ducky-coding/types/DTOs';
import { db } from '../client';
import {
  ImagesTable,
  type InsertUser,
  mapToImageDTO,
  mapToUserDTO,
  UsersTable,
} from '../models';
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

const getUsersByField = async (fieldValuePair: {
  field: string;
  value: string | number;
}): Promise<UserDTO[]> => {
  let whereClause: SQL<unknown>;

  switch (fieldValuePair.field.toLowerCase()) {
    case 'id':
      whereClause = eq(UsersTable.id, fieldValuePair.value as number);
      break;
    case 'email':
      whereClause = eq(UsersTable.email, fieldValuePair.value as string);
      break;
    case 'username':
      whereClause = eq(UsersTable.username, fieldValuePair.value as string);
      break;
    default:
      throw new Error(`Unsupported field: "${fieldValuePair.field}"`);
  }

  const users = await db.select().from(UsersTable).where(whereClause);
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
          profilePictureId: user.profilePictureId ?? 1, // 1 is the id of the default profile picture in the database (might need to make some changes here to fetch the image id before hand, but for now I leave it like this)
        };
      }),
    )
    .returning();

  return insertedUsers.map((insertedUser) => mapToUserDTO(insertedUser));
};

const findUserByField = async (fieldValuePair: {
  field: string;
  value: string | number;
}): Promise<boolean> => {
  let whereClause: SQL<unknown>;

  switch (fieldValuePair.field.toLowerCase()) {
    case 'id':
      whereClause = eq(UsersTable.id, fieldValuePair.value as number);
      break;
    case 'email':
      whereClause = eq(UsersTable.email, fieldValuePair.value as string);
      break;
    case 'username':
      whereClause = eq(UsersTable.username, fieldValuePair.value as string);
      break;
    default:
      throw new Error(`Unsupported field: "${fieldValuePair.field}"`);
  }

  const users = await db
    .select({ id: UsersTable.id })
    .from(UsersTable)
    .where(whereClause)
    .limit(1);
  if (users.length === 0) return false;
  return true;
};

const getUserProfilePicture = async (
  userId: number,
): Promise<ImageDTO | undefined> => {
  const image = await db
    .select({
      image: ImagesTable,
    })
    .from(ImagesTable)
    .leftJoin(UsersTable, eq(UsersTable.profilePictureId, ImagesTable.id))
    .where(eq(UsersTable.id, userId))
    .limit(1);

  if (image.length === 0) return undefined;
  return mapToImageDTO(image[0].image);
};

export const UsersRepository = {
  getUsers,
  getUsersByField,
  getUsersByUsername,
  getUsersWithProfilePicture,
  getUsersWithProfilePictureByUsername,
  getAllUsers,
  getAllUsersWithProfilePicture,
  getUserProfilePicture,

  insertUsers,
  findUserByField,
};
