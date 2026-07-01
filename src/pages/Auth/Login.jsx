import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginRider, loginPhoneAndPassword, sendPhoneOtp, loginPhone } = useAuth();
  
  const fromPath = location.state?.from?.pathname || '/home';
  
  const [activeTab, setActiveTab] = useState('customer'); // 'customer' or 'rider'
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [phoneError, setPhoneError] = useState('');
  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSendOtp = async () => {
    setPhoneError('');
    setLocalError('');
    if (!phone || phone.length < 10) {
      setPhoneError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setSubmitting(true);
    try {
      await sendPhoneOtp(phone);
      setOtpSent(true);
      setLocalError('');
    } catch (err) {
      setLocalError(err.message || 'Failed to send OTP.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setPhoneError('');
    setLocalError('');

    if (!phone || phone.length < 10) {
      setPhoneError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (activeTab === 'customer' && loginMethod === 'otp') {
      if (!otpSent) return; // Should not reach here via form submit if otp not sent
      if (!otp || otp.length < 6) {
        setLocalError('Please enter the 6-digit OTP.');
        return;
      }
    } else {
      if (!password || password.length < 6) {
        setLocalError('Password must be at least 6 characters.');
        return;
      }
    }

    setSubmitting(true);
    try {
      let user;
      if (activeTab === 'rider') {
        user = await loginRider(phone, password);
      } else {
        if (loginMethod === 'otp') {
          user = await loginPhone(phone, otp);
        } else {
          user = await loginPhoneAndPassword(phone, password);
        }
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
          Sign in to access your fresh meats
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
            setOtp('');
            setOtpSent(false);
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
            setOtp('');
            setOtpSent(false);
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

        {/* Customer Login Method Toggle */}
        {activeTab === 'customer' && !otpSent && (
          <div className="flex justify-center gap-4 mb-2 -mt-1">
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-neutral-dark">
              <input 
                type="radio" 
                name="loginMethod"
                checked={loginMethod === 'password'} 
                onChange={() => { setLoginMethod('password'); setLocalError(''); }} 
                className="accent-primary w-3.5 h-3.5"
              />
              Password
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-neutral-dark">
              <input 
                type="radio" 
                name="loginMethod"
                checked={loginMethod === 'otp'} 
                onChange={() => { setLoginMethod('otp'); setLocalError(''); }} 
                className="accent-primary w-3.5 h-3.5"
              />
              OTP
            </label>
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
              disabled={otpSent}
            />
          </div>
          {phoneError && <p className="text-[10px] text-primary font-bold mt-1">{phoneError}</p>}
        </div>

        {/* Password Input */}
        {(activeTab === 'rider' || loginMethod === 'password') && (
          <>
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
              {activeTab === 'rider' ? 'Sign In as Rider' : 'Sign In with Password'}
            </Button>
          </>
        )}

        {/* OTP Input & Actions */}
        {activeTab === 'customer' && loginMethod === 'otp' && (
          <>
            {otpSent ? (
              <>
                <Input
                  label="Enter 6-digit OTP"
                  type="text"
                  placeholder="000000"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  required={true}
                />
                
                <div className="flex justify-between items-center -mt-2.5">
                  <button 
                    type="button" 
                    onClick={handleSendOtp} 
                    disabled={submitting}
                    className="text-[10px] font-bold text-primary hover:underline"
                  >
                    Resend OTP
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setOtpSent(false); setOtp(''); }} 
                    className="text-[10px] font-bold text-neutral-dark opacity-70 hover:underline"
                  >
                    Change Number
                  </button>
                </div>
                
                <Button type="submit" loading={submitting} className="w-full mt-2">
                  Verify & Login
                </Button>
              </>
            ) : (
              <Button type="button" onClick={handleSendOtp} loading={submitting} className="w-full mt-2">
                Send OTP
              </Button>
            )}
          </>
        )}

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
