import { getRiderStatusDb, updateRiderStatusDb } from '../firebase/database';
import { getOrders } from './orderService';

export const getRiderStatus = async (riderId) => {
  return await getRiderStatusDb(riderId);
};

export const updateRiderStatus = async (riderId, status) => {
  return await updateRiderStatusDb(riderId, status);
};

export const getAssignedOrders = async (riderId) => {
  const allOrders = await getOrders(riderId);
  const riderProfile = await getRiderStatusDb(riderId);
  const isOnline = riderProfile && riderProfile.status !== 'offline';
  
  // Return orders that are either assigned to this rider,
  // or are "dispatched" (ready for any rider to claim) ONLY IF the rider is online
  return allOrders.filter(
    (order) => order.riderId === riderId || (isOnline && order.status === 'dispatched' && !order.riderId)
  );
};
