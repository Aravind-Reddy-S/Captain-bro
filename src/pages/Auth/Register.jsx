import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { validatePassword, validatePhone } from '../../utils/validation';

export const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register } = useAuth();

  const prefilledPhone = location.state?.prefilledPhone || '';

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState(prefilledPhone);
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');

  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPhoneError('');
    setPasswordError('');
    setLocalError('');

    let hasError = false;

    if (!validatePassword(password)) {
      setPasswordError('Password must be at least 6 characters.');
      hasError = true;
    }
    if (!validatePhone(phone)) {
      setPhoneError('Please enter a valid 10-digit mobile number.');
      hasError = true;
    }

    if (hasError) return;

    setSubmitting(true);
    try {
      // Under the hood, create email from phone number to keep authentication simple
      const generatedEmail = `${phone.trim()}@wfoods.com`;
      await register(generatedEmail, password, fullName, phone, role);
      if (role === 'admin' || role === 'super_admin') {
        navigate('/admin');
      } else if (role === 'rider') {
        navigate('/rider');
      } else {
        localStorage.setItem('just_logged_in', 'true');
        navigate('/home');
      }
    } catch (err) {
      setLocalError(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 bg-neutral-light px-6 py-8 flex flex-col justify-center gap-6">
      <div className="text-center">
        <h2 className="text-2xl font-extrabold text-neutral-dark">
          Create Account
        </h2>
        <p className="text-xs font-semibold text-neutral-dark opacity-60 mt-1">
          Join Mana Warangal Foods for fast meat deliveries
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-5 rounded-lg border border-neutral-border flex flex-col gap-3.5 shadow-sm">
        {localError && (
          <div className="p-3 rounded-md bg-red-50 border border-primary/20 text-xs font-semibold text-primary text-center">
            {localError}
          </div>
        )}

        <Input
          label="Recipients Full Name *"
          type="text"
          placeholder="e.g. Rahul Sharma"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required={true}
        />

        <Input
          label="Mobile Phone Number *"
          type="tel"
          placeholder="e.g. 9876543210"
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
          error={phoneError}
          required={true}
          maxLength={10}
        />

        <Input
          label="Create Password *"
          type="password"
          placeholder="Minimum 6 characters"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={passwordError}
          required={true}
        />

        {/* Role Select for development */}
        <div className="flex flex-col gap-1 text-left">
          <label className="text-sm font-semibold text-neutral-dark opacity-85">
            Register As
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-3 rounded-md border border-neutral-border bg-neutral-light transition-all outline-none focus:border-primary focus:bg-white text-xs font-semibold"
          >
            <option value="customer">Customer</option>
            <option value="rider">Rider</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <Button type="submit" loading={submitting} className="w-full mt-2">
          Sign Up
        </Button>

        <p className="text-center text-xs text-neutral-dark opacity-75 mt-1">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary hover:underline">
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
};
export default Register;
