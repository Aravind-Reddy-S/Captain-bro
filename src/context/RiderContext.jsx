import React, { createContext, useState, useEffect, useContext } from 'react';
import { getRiderStatus, updateRiderStatus, getAssignedOrders } from '../services/riderService';
import { AuthContext } from './AuthContext';

export const RiderContext = createContext();

export const RiderProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [riderProfile, setRiderProfile] = useState(null);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [riderLoading, setRiderLoading] = useState(false);
  
  // Persistent tracking state across page navigations
  const [trackingState, setTrackingState] = useState({
    orderId: null,
    routeIndex: 0,
    isSimulating: false,
    simSpeed: 2,
    arrived: false,
    checkedItems: {},
    amountCollectedConfirmed: false,
    deliveryPinInput: ''
  });

  const fetchRiderProfile = async () => {
    if (!currentUser || currentUser.role !== 'rider') return;
    setRiderLoading(true);
    try {
      const profile = await getRiderStatus(currentUser.uid);
      setRiderProfile(profile);
      const orders = await getAssignedOrders(currentUser.uid);
      setAssignedOrders(orders);
    } catch (err) {
      console.error('Error fetching rider profile:', err);
    } finally {
      setRiderLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && currentUser.role === 'rider') {
      fetchRiderProfile();
    } else {
      setRiderProfile(null);
      setAssignedOrders([]);
    }
  }, [currentUser]);

  const changeRiderStatus = async (status) => {
    if (!currentUser) return;
    setRiderLoading(true);
    try {
      const updated = await updateRiderStatus(currentUser.uid, status);
      setRiderProfile(updated);
      
      const orders = await getAssignedOrders(currentUser.uid);
      setAssignedOrders(orders);
      return updated;
    } catch (err) {
      console.error('Error updating status:', err);
      throw err;
    } finally {
      setRiderLoading(false);
    }
  };

  const refreshAssignedOrders = async () => {
    if (!currentUser) return;
    try {
      const orders = await getAssignedOrders(currentUser.uid);
      setAssignedOrders(orders);
    } catch (err) {
      console.error('Error refreshing assigned orders:', err);
    }
  };

  const resetTrackingState = (orderId = null) => {
    setTrackingState({
      orderId,
      routeIndex: 0,
      isSimulating: true,
      simSpeed: 2,
      arrived: false,
      checkedItems: {},
      amountCollectedConfirmed: false,
      deliveryPinInput: ''
    });
  };

  const value = {
    riderProfile,
    assignedOrders,
    riderLoading,
    trackingState,
    setTrackingState,
    fetchRiderProfile,
    changeRiderStatus,
    refreshAssignedOrders,
    resetTrackingState
  };

  return (
    <RiderContext.Provider value={value}>
      {children}
    </RiderContext.Provider>
  );
};

export default RiderContext;
