import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { FaUserCircle, FaEnvelope, FaPhone, FaShieldAlt, FaMotorcycle, FaSignOutAlt, FaMapMarkerAlt } from 'react-icons/fa';

export const Profile = () => {
  const navigate = useNavigate();
  const { currentUser, loginPhoneAndPassword, logout } = useAuth();

  // Inline login form states
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/home');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleInlineLoginSubmit = async (e) => {
    e.preventDefault();
    setPhoneError('');
    setLocalError('');

    if (!phone || phone.length < 10) {
      setPhoneError('Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!password || password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    try {
      await loginPhoneAndPassword(phone, password);
    } catch (err) {
      setLocalError(err.message || 'Failed to sign in.');
      if (err.message && err.message.includes('does not exist')) {
        setTimeout(() => {
          navigate('/register', { state: { prefilledPhone: phone } });
        }, 1500);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex-1 bg-neutral-light px-6 py-10 flex flex-col justify-center gap-6 text-left max-w-md mx-auto">
        <div className="text-center">
          <span className="text-3xl">👤</span>
          <h2 className="text-2xl font-extrabold text-neutral-dark mt-2">
            My Profile
          </h2>
          <p className="text-xs font-semibold text-neutral-dark opacity-60 mt-1">
            Sign in with mobile number & password to view your profile details
          </p>
        </div>

        <form onSubmit={handleInlineLoginSubmit} className="bg-white p-5 rounded-lg border border-neutral-border flex flex-col gap-4 shadow-sm">
          {localError && (
            <div className="p-3.5 rounded-md bg-red-50 border border-primary/20 text-xs font-semibold text-primary text-center">
              {localError}
            </div>
          )}

          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-[10px] font-bold text-neutral-dark opacity-50 uppercase tracking-wider">
              Mobile Phone Number
            </label>
            <div className="flex border border-neutral-border rounded-lg overflow-hidden bg-neutral-light/40">
              <span className="bg-neutral-light px-3.5 flex items-center justify-center text-xs font-bold text-neutral-dark/60 border-r border-neutral-border">
                +91
              </span>
              <input
                type="tel"
                placeholder="Enter 10-digit number"
                maxLength="10"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="flex-1 px-3.5 py-3 outline-none text-xs font-semibold bg-white text-neutral-dark"
                required
              />
            </div>
            {phoneError && <p className="text-[10px] text-primary font-bold mt-1">{phoneError}</p>}
          </div>

          <Input
            label="Account Password"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={true}
          />
          <div className="flex justify-between items-center -mt-2.5">
            <span className="text-[10px] text-neutral-dark/60 font-bold">
              Forgot password? Try using <span className="font-extrabold text-primary">123456</span>
            </span>
          </div>

          <Button type="submit" loading={submitting} className="w-full mt-2">
            🔑 Log In to Profile
          </Button>

          <p className="text-center text-xs text-neutral-dark opacity-75 mt-1">
            Need an account?{' '}
            <Link to="/register" className="font-bold text-primary hover:underline">
              Create Account
            </Link>
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-neutral-light px-4 py-5 flex flex-col gap-4 pb-20 text-left max-w-md mx-auto">
      {/* Header Profile Info */}
      <div className="bg-white p-5 rounded-lg border border-neutral-border flex items-center gap-4 shadow-sm">
        <div className="text-5xl text-primary animate-pulse">
          <FaUserCircle />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-neutral-dark leading-tight truncate">
            {currentUser.fullName || 'Happy Customer'}
          </h3>
          <span className="inline-block mt-1 px-2.5 py-0.5 bg-primary-light text-primary text-[9px] font-bold rounded uppercase tracking-wider border border-primary/10">
            {currentUser.role || 'Customer'}
          </span>
        </div>
      </div>

      {/* Account Details Box */}
      <div className="bg-white p-5 rounded-lg border border-neutral-border flex flex-col gap-4 shadow-sm">
        <h4 className="text-xs font-bold text-neutral-dark opacity-50 uppercase tracking-wider">
          Account Details
        </h4>

        <div className="flex flex-col gap-3.5 text-xs font-semibold text-neutral-dark/80">
          <div className="flex items-center gap-3">
            <FaEnvelope className="text-primary text-sm" />
            <div className="flex flex-col">
              <span className="text-[9px] text-neutral-dark/45 font-bold uppercase leading-none">Email Address</span>
              <span className="mt-0.5">{currentUser.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FaPhone className="text-primary text-sm" />
            <div className="flex flex-col">
              <span className="text-[9px] text-neutral-dark/45 font-bold uppercase leading-none">Phone Number</span>
              <span className="mt-0.5">{currentUser.phone || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Addresses Panel */}
      <div className="bg-white p-5 rounded-lg border border-neutral-border flex flex-col gap-4 shadow-sm">
        <h4 className="text-xs font-bold text-neutral-dark opacity-50 uppercase tracking-wider">
          Saved Information
        </h4>

        <button
          onClick={() => navigate('/addresses')}
          className="flex items-center justify-between p-3.5 bg-neutral-light hover:bg-neutral-border/20 rounded-md border border-neutral-border text-xs font-bold text-neutral-dark transition-all active:scale-95 w-full"
        >
          <div className="flex items-center gap-3">
            <FaMapMarkerAlt className="text-primary text-base" />
            <span>Manage Delivery Addresses</span>
          </div>
          <span className="text-neutral-dark/40">→</span>
        </button>
      </div>

      {/* Admin or Rider Shortcuts */}
      {(currentUser.role === 'admin' || currentUser.role === 'super_admin' || currentUser.role === 'rider') && (
        <div className="bg-white p-5 rounded-lg border border-neutral-border flex flex-col gap-3 shadow-sm">
          <h4 className="text-xs font-bold text-neutral-dark opacity-50 uppercase tracking-wider">
            Portal Shortcuts
          </h4>
          
          <div className="flex flex-col gap-2">
            {(currentUser.role === 'admin' || currentUser.role === 'super_admin') && (
              <Button onClick={() => navigate('/admin')} className="w-full flex gap-2">
                <FaShieldAlt />
                <span>Go to Admin Dashboard</span>
              </Button>
            )}
            {currentUser.role === 'rider' && (
              <Button onClick={() => navigate('/rider')} variant="secondary" className="w-full flex gap-2">
                <FaMotorcycle />
                <span>Go to Rider Dashboard</span>
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Log Out Button */}
      <button
        onClick={handleLogout}
        className="w-full mt-auto py-3 bg-red-50 hover:bg-primary-light text-primary font-bold rounded-lg text-xs transition-all border border-primary/10 flex items-center justify-center gap-2 active:scale-95"
      >
        <FaSignOutAlt />
        <span>Log Out Account</span>
      </button>
    </div>
  );
};

export default Profile;
