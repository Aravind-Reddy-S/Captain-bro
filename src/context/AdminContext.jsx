import React, { createContext, useState, useEffect, useContext } from 'react';
import { getUsers, registerRider } from '../services/userService';
import { getRidersDb } from '../firebase/database';
import { AuthContext } from './AuthContext';

export const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [riders, setRiders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRiders = async () => {
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) return;
    setLoading(true);
    try {
      const allUsers = await getUsers();
      const riderUsers = allUsers.filter(x => x.role === 'rider');
      const ridersStatus = await getRidersDb();

      // Merge user attributes with tracking status attributes
      const merged = riderUsers.map(user => {
        const tracking = ridersStatus.find(r => r.id === user.uid) || { status: 'offline' };
        return {
          uid: user.uid,
          fullName: user.fullName || user.full_name,
          email: user.email,
          phone: user.phone,
          status: tracking.status,
          latitude: tracking.currentLatitude || tracking.current_latitude,
          longitude: tracking.currentLongitude || tracking.current_longitude,
          updatedAt: tracking.updatedAt || tracking.updated_at,
          drivingLicense: tracking.drivingLicense || tracking.driving_license,
          aadharNumber: tracking.aadharNumber || tracking.aadhar_number
        };
      });
      setRiders(merged);
    } catch (err) {
      console.error('Error fetching admin riders:', err);
    } finally {
      setLoading(false);
    }
  };

  const addRider = async (riderData) => {
    setLoading(true);
    try {
      const result = await registerRider(riderData);
      await fetchRiders();
      return result;
    } catch (err) {
      console.error('Error in addRider context:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) return;
    setLoading(true);
    try {
      const allUsers = await getUsers();
      const customerUsers = allUsers.filter(x => x.role === 'customer');
      setCustomers(customerUsers);
    } catch (err) {
      console.error('Error fetching admin customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'super_admin')) {
      fetchRiders();
      fetchCustomers();
    } else {
      setRiders([]);
      setCustomers([]);
    }
  }, [currentUser]);

  const value = {
    riders,
    customers,
    loading,
    fetchRiders,
    fetchCustomers,
    addRider
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContext;
