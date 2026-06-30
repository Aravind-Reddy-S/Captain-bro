import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderContext } from '../context/OrderContext';
import { useAuth } from '../hooks/useAuth';
import { useRider } from '../hooks/useRider';
import { formatPrice } from '../utils/formatPrice';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import { FaUserCircle, FaEnvelope, FaPhone, FaMotorcycle, FaCoins, FaCheckCircle, FaSignOutAlt } from 'react-icons/fa';

export const Profile = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { fetchOrders } = useContext(OrderContext);
  const { assignedOrders, riderLoading, fetchRiderProfile } = useRider();

  useEffect(() => {
    fetchOrders();
    fetchRiderProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  const completedCount = assignedOrders.filter(o => o.riderId === currentUser?.uid && o.status === 'delivered').length;
  
  // Flat ₹40 Commission per completed task
  const commissionEarned = completedCount * 40;

  const cashCollected = assignedOrders
    .filter(o => o.riderId === currentUser?.uid && o.status === 'delivered' && o.paymentMethod?.toLowerCase() === 'cod')
    .reduce((acc, o) => acc + o.total, 0);

  if (riderLoading && assignedOrders.length === 0) return <Loader fullPage={true} />;

  return (
    <div className="flex-1 bg-neutral-light px-4 py-5 flex flex-col gap-4 pb-20 text-left overflow-y-auto">
      <div className="flex justify-between items-center mb-1">
        <div>
          <h2 className="text-lg font-bold text-neutral-dark">Rider Profile</h2>
          <p className="text-[10px] text-neutral-dark/50 font-semibold mt-0.5">Track your rider score & details</p>
        </div>
        <Button onClick={() => navigate('/rider')} variant="outline" size="sm" className="py-1.5 px-3 text-xs">
          Back
        </Button>
      </div>

      {/* Header Profile Info */}
      <div className="bg-white p-5 rounded-3xl border border-neutral-border flex items-center gap-4 shadow-sm">
        <div className="text-5xl text-[#8B0000]">
          <FaUserCircle />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-neutral-dark truncate leading-tight">
            {currentUser?.fullName || 'Rider Partner'}
          </h3>
          <span className="inline-block mt-1 px-2.5 py-0.5 bg-secondary-light text-secondary-dark text-[9px] font-bold rounded-full border border-secondary/15 uppercase tracking-wider">
            Rider Member
          </span>
        </div>
      </div>

      {/* Delivery Stats Box */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-neutral-border flex flex-col gap-1 shadow-sm">
          <FaCheckCircle className="text-green-600 text-base" />
          <span className="text-[10px] font-bold text-neutral-dark/40 uppercase">Shift Earnings</span>
          <span className="text-lg font-black text-neutral-dark leading-none">{formatPrice(commissionEarned)}</span>
          <span className="text-[8px] text-neutral-dark/40 mt-1">{completedCount} Completed Tasks</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-border flex flex-col gap-1 shadow-sm">
          <FaCoins className="text-primary text-base" />
          <span className="text-[10px] font-bold text-neutral-dark/40 uppercase">COD Cash Collected</span>
          <span className="text-lg font-black text-neutral-dark leading-none">{formatPrice(cashCollected)}</span>
          <span className="text-[8px] text-neutral-dark/40 mt-1">Pending Handover</span>
        </div>
      </div>

      {/* Account Info Box */}
      <div className="bg-white p-5 rounded-3xl border border-neutral-border flex flex-col gap-4 shadow-sm">
        <h4 className="text-xs font-bold text-neutral-dark opacity-50 uppercase tracking-wider">
          Partner Info
        </h4>

        <div className="flex flex-col gap-3.5 text-xs font-semibold text-neutral-dark/80">
          <div className="flex items-center gap-3">
            <FaEnvelope className="text-[#8B0000] text-sm" />
            <div className="flex flex-col">
              <span className="text-[9px] text-neutral-dark/45 font-bold uppercase leading-none">Email Address</span>
              <span className="mt-0.5">{currentUser?.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FaPhone className="text-[#8B0000] text-sm" />
            <div className="flex flex-col">
              <span className="text-[9px] text-neutral-dark/45 font-bold uppercase leading-none">Phone Number</span>
              <span className="mt-0.5">{currentUser?.phone || 'N/A'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FaMotorcycle className="text-[#8B0000] text-sm" />
            <div className="flex flex-col">
              <span className="text-[9px] text-neutral-dark/45 font-bold uppercase leading-none">Vehicle Group</span>
              <span className="mt-0.5">Two-Wheeler (Motorcycle)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="w-full mt-auto py-3 bg-red-50 hover:bg-red-100 text-[#8B0000] font-bold rounded-2xl text-xs transition-all border border-[#8B0000]/10 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
      >
        <FaSignOutAlt />
        <span>Log Out Partner Account</span>
      </button>
    </div>
  );
};

export default Profile;
