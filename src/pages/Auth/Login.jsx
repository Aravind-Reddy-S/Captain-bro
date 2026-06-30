import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginRider, loginPhoneAndPassword } = useAuth();
  
  const fromPath = location.state?.from?.pathname || '/home';
  
  const [activeTab, setActiveTab] = useState('customer'); // 'customer' or 'rider'
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLoginSubmit = async (e) => {
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
      let user;
      if (activeTab === 'rider') {
        user = await loginRider(phone, password);
      } else {
        user = await loginPhoneAndPassword(phone, password);
      }

      if (user.role === 'admin' || user.role === 'super_admin') {
        navigate('/admin');
      } else if (user.role === 'rider') {
        navigate('/rider');
      } else {
        localStorage.setItem('just_logged_in', 'true');
        navigate(fromPath, { replace: true });
      }
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

  return (
    <div className="flex-1 bg-neutral-light px-6 py-10 flex flex-col justify-center gap-6">
      {/* Title */}
      <div className="text-center">
        <span className="text-3xl">🍗</span>
        <h2 className="text-2xl font-extrabold text-neutral-dark mt-2">
          Welcome to Captain Bro
        </h2>
        <p className="text-xs font-semibold text-neutral-dark opacity-60 mt-1">
          Sign in with mobile number & password to access your fresh meats
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex border border-neutral-border rounded-lg overflow-hidden bg-white p-1 shadow-2xs">
        <button
          type="button"
          onClick={() => {
            setActiveTab('customer');
            setLocalError('');
            setPhone('');
            setPassword('');
          }}
          className={`flex-1 py-2.5 text-xs font-bold rounded-md transition-all ${
            activeTab === 'customer'
              ? 'bg-[#8B0000] text-white shadow-sm font-black'
              : 'text-neutral-dark/65 hover:bg-neutral-light/80'
          }`}
        >
          📱 Customer Login
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('rider');
            setLocalError('');
            setPhone('');
            setPassword('');
          }}
          className={`flex-1 py-2.5 text-xs font-bold rounded-md transition-all ${
            activeTab === 'rider'
              ? 'bg-[#8B0000] text-white shadow-sm font-black'
              : 'text-neutral-dark/65 hover:bg-neutral-light/80'
          }`}
        >
          🛵 Rider Login
        </button>
      </div>

      {/* Login Form */}
      <form onSubmit={handleLoginSubmit} className="bg-white p-5 rounded-lg border border-neutral-border flex flex-col gap-4 shadow-sm">
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
          {activeTab === 'rider' ? 'Sign In as Rider' : 'Sign In'}
        </Button>

        {activeTab === 'customer' && (
          <p className="text-center text-xs text-neutral-dark opacity-75 mt-1">
            New customer?{' '}
            <Link to="/register" className="font-bold text-primary hover:underline">
              Create Account
            </Link>
          </p>
        )}
      </form>
    </div>
  );
};

export default Login;
