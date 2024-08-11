import { eq, inArray } from 'drizzle-orm';
import { db } from '../client';
import { ImagesTable, UsersTable } from '../models';

const getUsers = async (userIds: number[]) => {
  const users = await db
    .select()
    .from(UsersTable)
    .where(inArray(UsersTable.id, userIds));
  return users;
};

const getUsersByUsername = async (usernames: string[]) => {
  const users = await db
    .select()
    .from(UsersTable)
    .where(inArray(UsersTable.username, usernames));
  return users;
};

const getAllUsers = async () => {
  const users = await db.select().from(UsersTable).all();
  return users;
};

const getUsersWithProfilePictureByUsername = async (usernames: string[]) => {
  const users = await db
    .select()
    .from(UsersTable)
    .leftJoin(ImagesTable, eq(UsersTable.profilePictureId, ImagesTable.id))
    .where(inArray(UsersTable.username, usernames));
  return users;
};

const getUsersWithProfilePicture = async (userIds: number[]) => {
  const users = await db
    .select()
    .from(UsersTable)
    .leftJoin(ImagesTable, eq(UsersTable.profilePictureId, ImagesTable.id))
    .where(inArray(UsersTable.id, userIds));
  return users;
};

const getAllUsersWithProfilePicture = async () => {
  const users = await db
    .select()
    .from(UsersTable)
    .leftJoin(ImagesTable, eq(UsersTable.profilePictureId, ImagesTable.id))
    .all();
  return users;
};

export const UsersRepository = {
  getUsers,
  getUsersByUsername,
  getUsersWithProfilePicture,
  getUsersWithProfilePictureByUsername,
  getAllUsers,
  getAllUsersWithProfilePicture,
};
