import { getUsersDb, createRiderDb } from '../firebase/database';

export const getUsers = async () => {
  return await getUsersDb();
};

export const registerRider = async (riderData) => {
  return await createRiderDb(riderData);
};
