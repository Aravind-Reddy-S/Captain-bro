import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderContext } from '../context/OrderContext';
import { useAuth } from '../hooks/useAuth';
import { useRider } from '../hooks/useRider';
import { formatPrice } from '../utils/formatPrice';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import { 
  FaPowerOff, 
  FaWallet, 
  FaMotorcycle, 
  FaClipboardList, 
  FaCoins, 
  FaBell, 
  FaMapMarkerAlt, 
  FaClock, 
  FaArrowRight 
} from 'react-icons/fa';

export const RiderDashboard = () => {
  const navigate = useNavigate();
  const { orders, fetchOrders, changeStatus } = useContext(OrderContext);
  const { currentUser } = useAuth();
  const { 
    riderProfile, 
    assignedOrders, 
    riderLoading, 
    changeRiderStatus, 
    fetchRiderProfile,
    refreshAssignedOrders
  } = useRider();
  const [actionLoading, setActionLoading] = useState(false);

  // Play a premium synthesizer beep sound using Web Audio API
  const playNotificationSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const shadowGain = audioCtx.createGain();
      
      oscillator.connect(shadowGain);
      shadowGain.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5 note
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5 note
      
      shadowGain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      shadowGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.45);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.45);
    } catch (e) {
      console.warn("Audio context not allowed or supported yet", e);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchRiderProfile();
  }, []);

  // Audio/Visual alert when unclaimed orders change
  const unclaimedCount = orders.filter(
    (order) => order.status === 'dispatched' && !order.riderId
  ).length;

  const isOnline = riderProfile && riderProfile.status !== 'offline';

  useEffect(() => {
    if (isOnline && unclaimedCount > 0) {
      playNotificationSound();
    }
  }, [unclaimedCount, isOnline]);

  const handleStatusToggle = async () => {
    if (!currentUser || !riderProfile) return;
    setActionLoading(true);
    const newStatus = isOnline ? 'offline' : 'idle';
    try {
      await changeRiderStatus(newStatus);
    } catch (err) {
      alert("Error updating status: " + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClaim = async (orderId) => {
    if (!currentUser) return;
    setActionLoading(true);
    try {
      await changeStatus(orderId, 'dispatched', currentUser.uid);
      playNotificationSound();
      alert('Order claimed! Proceed to pick up the items.');
      await fetchRiderProfile();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Helper to generate simulated distance & duration based on order ID
  const getSimulatedMetrics = (orderId) => {
    let hash = 0;
    for (let i = 0; i < orderId.length; i++) {
      hash = orderId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const distance = (Math.abs(hash % 60) / 10 + 1.2).toFixed(1); // 1.2 to 7.2 km
    const mins = Math.round(distance * 4 + 5); // 9 to 33 mins
    return { distance, mins };
  };

  // Unclaimed orders are those which have status "dispatched" and NO riderId assigned
  const unclaimedOrders = orders.filter(
    (order) => order.status === 'dispatched' && !order.riderId
  );

  // My active deliveries are those assigned to me and NOT delivered/cancelled
  const myActiveDeliveries = orders.filter(
    (order) => order.riderId === currentUser?.uid && !['delivered', 'cancelled'].includes(order.status)
  );

  // Earnings Stats - Flat ₹40 Commission only
  const completedDeliveries = orders.filter(
    (order) => order.riderId === currentUser?.uid && order.status === 'delivered'
  );
  const totalPayout = completedDeliveries.length * 40;
  
  const cashOnHold = orders
    .filter(o => o.riderId === currentUser?.uid && o.status === 'delivered' && o.paymentMethod?.toLowerCase() === 'cod')
    .reduce((acc, o) => acc + o.total, 0);

  if (riderLoading && assignedOrders.length === 0) return <Loader fullPage={true} />;

  return (
    <div className="flex-1 bg-neutral-light flex flex-col gap-4 pb-24 text-left overflow-y-auto">
      {/* Top Banner with Gradient & Status Switcher */}
      <div className="bg-gradient-to-br from-[#240c0c] to-[#4b1414] text-white px-5 py-6 rounded-b-[40px] shadow-lg relative overflow-hidden flex flex-col gap-4">
        {/* Decorative circle */}
        <div className="absolute -right-12 -top-12 w-36 h-36 rounded-full bg-primary/10 blur-xl"></div>
        <div className="absolute -left-12 -bottom-12 w-32 h-32 rounded-full bg-secondary/5 blur-xl"></div>

        <div className="flex justify-between items-start z-10">
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-secondary/90">Delivery Partner Portal</span>
            <h2 className="text-xl font-black tracking-tight mt-0.5">{currentUser?.fullName || 'Rider Partner'}</h2>
            <p className="text-[10px] text-white/60 font-semibold mt-0.5">Warangal Hub • Active Shift</p>
          </div>

          {/* Toggle Button */}
          <button
            onClick={handleStatusToggle}
            disabled={actionLoading || riderLoading}
            className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 border font-bold text-xs transition-all active:scale-95 duration-300 shadow-md ${
              isOnline 
                ? 'bg-emerald-600/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-600/20 shadow-emerald-950/20' 
                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10'
            }`}
          >
            <FaPowerOff className={`text-xs ${isOnline ? 'animate-pulse' : ''}`} />
            <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </button>
        </div>

        {/* Real-time Indicator Bar */}
        {isOnline ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-2xl flex items-center gap-2.5 z-10 animate-pulse-glow">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-400"></span>
            <span className="text-[11px] font-extrabold text-emerald-300 uppercase tracking-wider">
              Waiting for incoming deliveries...
            </span>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 px-3.5 py-2 rounded-2xl flex items-center gap-2.5 z-10">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-500"></span>
            <span className="text-[11px] font-extrabold text-white/50 uppercase tracking-wider">
              You are offline. Go online to accept jobs.
            </span>
          </div>
        )}
      </div>

      {/* Main Container */}
      <div className="px-4 flex flex-col gap-4">
        {/* Earnings Stats Panel */}
        <div className="bg-white p-5 rounded-[32px] border border-neutral-border shadow-sm flex flex-col gap-4 relative overflow-hidden">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-black text-neutral-dark/45 uppercase tracking-wider">Shift Payout & Stats</h3>
            <span className="px-2 py-0.5 bg-secondary-light border border-secondary/20 text-secondary-dark rounded-full text-[9px] font-extrabold uppercase">
              Today
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#FFFDF9] border border-secondary/20 p-4 rounded-2xl flex flex-col gap-1 relative overflow-hidden">
              <div className="p-2 bg-secondary/10 text-secondary-dark rounded-xl w-fit">
                <FaWallet className="text-xs" />
              </div>
              <span className="text-[9px] font-bold text-neutral-dark/40 uppercase mt-1">Earnings</span>
              <span className="text-lg font-black text-neutral-dark leading-none">{formatPrice(totalPayout)}</span>
              <span className="text-[8px] text-neutral-dark/40 mt-0.5">₹40 Commission / Delivery</span>
            </div>

            <div className="bg-neutral-light/50 border border-neutral-border/50 p-4 rounded-2xl flex flex-col gap-1 relative overflow-hidden">
              <div className="p-2 bg-primary/5 text-primary rounded-xl w-fit">
                <FaCoins className="text-xs" />
              </div>
              <span className="text-[9px] font-bold text-neutral-dark/40 uppercase mt-1">COD Cash Collected</span>
              <span className="text-lg font-black text-neutral-dark leading-none">{formatPrice(cashOnHold)}</span>
              <span className="text-[8px] text-neutral-dark/40 mt-0.5">Pending Handover</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center border-t border-neutral-border/60 pt-3">
            <div className="flex flex-col">
              <span className="text-[8px] font-extrabold text-neutral-dark/45 uppercase">Deliveries Done</span>
              <span className="text-base font-black text-neutral-dark mt-0.5">{completedDeliveries.length} tasks</span>
            </div>
            <div className="w-px bg-neutral-border h-6 my-auto mx-auto"></div>
            <div className="flex flex-col">
              <span className="text-[8px] font-extrabold text-neutral-dark/45 uppercase">Active Tasks</span>
              <span className="text-base font-black text-neutral-dark mt-0.5">{myActiveDeliveries.length} tasks</span>
            </div>
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => navigate('/rider/orders')} 
            className="p-4 bg-white border border-neutral-border rounded-2xl active:scale-95 shadow-sm transition-all text-left flex flex-col justify-between h-[86px] hover:border-primary/30"
          >
            <div className="p-2 bg-primary/10 text-primary rounded-xl w-fit">
              <FaClipboardList className="text-xs" />
            </div>
            <div className="flex justify-between items-center w-full mt-2">
              <span className="text-xs font-black text-neutral-dark">My active tasks</span>
              <span className="px-1.5 py-0.5 bg-primary text-white text-[9px] font-black rounded-full leading-none">
                {myActiveDeliveries.length}
              </span>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/rider/profile')} 
            className="p-4 bg-white border border-neutral-border rounded-2xl active:scale-95 shadow-sm transition-all text-left flex flex-col justify-between h-[86px] hover:border-primary/30"
          >
            <div className="p-2 bg-secondary/10 text-secondary-dark rounded-xl w-fit">
              <FaMotorcycle className="text-xs" />
            </div>
            <div className="flex justify-between items-center w-full mt-2">
              <span className="text-xs font-black text-neutral-dark">Delivery Profile</span>
              <FaArrowRight className="text-[10px] text-neutral-dark/30" />
            </div>
          </button>
        </div>

        {/* Available Jobs list */}
        <div className="flex flex-col gap-3.5">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-sm font-black text-neutral-dark flex items-center gap-1.5">
              <span>Available Jobs (Unclaimed)</span>
              {isOnline && unclaimedOrders.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              )}
            </h3>
            {isOnline && (
              <span className="text-[10px] font-bold text-neutral-dark/40">
                {unclaimedOrders.length} available
              </span>
            )}
          </div>

          {!isOnline ? (
            <div className="p-7 bg-white rounded-[32px] border border-neutral-border text-center flex flex-col items-center gap-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-neutral-light text-neutral-dark/30 flex items-center justify-center text-lg">
                <FaPowerOff />
              </div>
              <h4 className="text-xs font-bold text-neutral-dark/60">Shift is Offline</h4>
              <p className="text-[10px] text-neutral-dark/45 font-semibold leading-relaxed max-w-[260px] mx-auto -mt-1.5">
                Go online using the power toggle button at the top to receive incoming orders and claim available jobs.
              </p>
            </div>
          ) : unclaimedOrders.length === 0 ? (
            <div className="p-8 bg-white rounded-[32px] border border-neutral-border text-center flex flex-col items-center gap-2 shadow-xs">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm animate-pulse">
                <FaBell />
              </div>
              <h4 className="text-xs font-bold text-neutral-dark/60">No Jobs Available</h4>
              <p className="text-[10px] text-neutral-dark/40 font-semibold max-w-[230px] mx-auto">
                All food orders are dispatched. We'll beep when a new kitchen package is ready!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {unclaimedOrders.map((order) => {
                const metrics = getSimulatedMetrics(order.id);
                // flat ₹40 payout
                const payout = 40;
                
                return (
                  <div
                    key={order.id}
                    className="bg-white p-4.5 rounded-[28px] border border-neutral-border flex flex-col gap-3.5 shadow-sm transition-all hover:border-[#8B0000] relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#8B0000]"></div>
                    
                    <div className="flex justify-between items-start pl-1.5">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-neutral-dark">
                          Job: {order.id.slice(-6).toUpperCase()}
                        </span>
                        <div className="flex gap-1.5 items-center mt-1">
                          <span className="px-1.5 py-0.5 bg-neutral-light border border-neutral-border text-neutral-dark/70 text-[9px] font-bold rounded-md flex items-center gap-1">
                            <FaMapMarkerAlt className="text-[8px] text-primary" /> {metrics.distance} km
                          </span>
                          <span className="px-1.5 py-0.5 bg-neutral-light border border-neutral-border text-neutral-dark/70 text-[9px] font-bold rounded-md flex items-center gap-1">
                            <FaClock className="text-[8px] text-secondary-dark" /> {metrics.mins} mins
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-black text-neutral-dark/40 text-[9px] uppercase">Rider Payout</span>
                        <span className="text-base font-black text-emerald-600 mt-0.5">{formatPrice(payout)}</span>
                      </div>
                    </div>
                    
                    <div className="bg-neutral-light/50 border border-neutral-border/40 p-3 rounded-2xl pl-4 text-xs font-semibold text-neutral-dark/80 flex items-start gap-2">
                      <FaMapMarkerAlt className="text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[9px] font-bold text-neutral-dark/40 uppercase">Delivery Address</span>
                        <span className="text-xs font-bold text-neutral-dark truncate mt-0.5">{order.address}</span>
                      </div>
                    </div>

                    <Button 
                      onClick={() => handleClaim(order.id)} 
                      size="sm" 
                      disabled={actionLoading}
                      className="w-full py-3 bg-[#8B0000] hover:bg-[#6b0000] text-white rounded-2xl text-[11px] font-black uppercase tracking-wider flex justify-center items-center gap-1.5 shadow-md shadow-[#8B0000]/10 hover:shadow-lg transition-all"
                    >
                      <FaMotorcycle /> Accept Delivery Job
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiderDashboard;
