import { createContext, useState, useEffect } from 'react';
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  resetPassword, 
  subscribeToAuth,
  sendPhoneOtp,
  verifyPhoneOtp,
  loginRiderWithPhoneAndPassword,
  loginUserWithPhoneAndPassword
} from '../firebase/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const userProfile = await loginUser(email, password);
      setCurrentUser(userProfile);
      return userProfile;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, fullName, phone, role) => {
    setLoading(true);
    setError(null);
    try {
      const userProfile = await registerUser(email, password, fullName, phone, role);
      setCurrentUser(userProfile);
      return userProfile;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setCurrentUser(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetPass = async (email) => {
    setError(null);
    try {
      await resetPassword(email);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const loginPhone = async (phone, otp) => {
    setLoading(true);
    setError(null);
    try {
      const userProfile = await verifyPhoneOtp(phone, otp);
      setCurrentUser(userProfile);
      return userProfile;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginRider = async (phone, password) => {
    setLoading(true);
    setError(null);
    try {
      const userProfile = await loginRiderWithPhoneAndPassword(phone, password);
      setCurrentUser(userProfile);
      return userProfile;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginPhoneAndPassword = async (phone, password) => {
    setLoading(true);
    setError(null);
    try {
      const userProfile = await loginUserWithPhoneAndPassword(phone, password);
      setCurrentUser(userProfile);
      return userProfile;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    resetPass,
    loginPhone,
    sendPhoneOtp,
    loginRider,
    loginPhoneAndPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
