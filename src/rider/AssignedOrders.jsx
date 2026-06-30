import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderContext } from '../context/OrderContext';
import { useAuth } from '../hooks/useAuth';
import { useRider } from '../hooks/useRider';
import { formatPrice } from '../utils/formatPrice';
import Loader from '../components/common/Loader';
import { 
  FaArrowLeft, 
  FaCheckCircle, 
  FaClock, 
  FaMapMarkerAlt, 
  FaChevronRight, 
  FaClipboardList,
  FaInbox
} from 'react-icons/fa';

export const AssignedOrders = () => {
  const navigate = useNavigate();
  const { orders, fetchOrders } = useContext(OrderContext);
  const { currentUser } = useAuth();
  const { riderLoading, fetchRiderProfile } = useRider();
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'completed'

  useEffect(() => {
    fetchOrders();
    fetchRiderProfile();
  }, []);

  const activeTasks = orders.filter(o => o.riderId === currentUser?.uid && !['delivered', 'cancelled'].includes(o.status));
  const completedTasks = orders.filter(o => o.riderId === currentUser?.uid && o.status === 'delivered');

  // Helper to generate simulated distance based on order ID
  const getSimulatedDistance = (orderId) => {
    let hash = 0;
    for (let i = 0; i < orderId.length; i++) {
      hash = orderId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return (Math.abs(hash % 50) / 10 + 1.5).toFixed(1); // 1.5 to 6.5 km
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'dispatched':
        return 'bg-blue-500/10 border-blue-500/20 text-blue-500';
      case 'picked_up':
        return 'bg-amber-500/10 border-amber-500/20 text-amber-600';
      default:
        return 'bg-neutral-light border-neutral-border text-neutral-dark';
    }
  };

  if (riderLoading && assignedOrders.length === 0) return <Loader fullPage={true} />;

  return (
    <div className="flex-1 bg-neutral-light flex flex-col gap-4 pb-24 text-left overflow-y-auto">
      {/* Top Header Card */}
      <div className="bg-white px-4 py-4 border-b border-neutral-border flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/rider')}
            className="p-2 -ml-2 rounded-full text-neutral-dark hover:bg-neutral-light transition-all active:scale-90"
          >
            <FaArrowLeft className="text-sm" />
          </button>
          <div>
            <h2 className="text-base font-black text-neutral-dark">My Active Tasks</h2>
            <p className="text-[10px] text-neutral-dark/50 font-semibold mt-0.5">Manage and track your assigned deliveries</p>
          </div>
        </div>
      </div>

      {/* Segmented Tab Bar */}
      <div className="px-4">
        <div className="bg-white border border-neutral-border p-1 rounded-2xl flex shadow-sm">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-3 text-center text-xs font-black rounded-xl transition-all duration-200 flex justify-center items-center gap-2 ${
              activeTab === 'active'
                ? 'bg-neutral-dark text-white shadow-xs'
                : 'text-neutral-dark/60 hover:text-neutral-dark hover:bg-neutral-light/50'
            }`}
          >
            <span>Active Tasks</span>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black leading-none ${
              activeTab === 'active' ? 'bg-white/20 text-white' : 'bg-neutral-light text-neutral-dark/60'
            }`}>
              {activeTasks.length}
            </span>
          </button>
          
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-3 text-center text-xs font-black rounded-xl transition-all duration-200 flex justify-center items-center gap-2 ${
              activeTab === 'completed'
                ? 'bg-neutral-dark text-white shadow-xs'
                : 'text-neutral-dark/60 hover:text-neutral-dark hover:bg-neutral-light/50'
            }`}
          >
            <span>Completed Jobs</span>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black leading-none ${
              activeTab === 'completed' ? 'bg-white/20 text-white' : 'bg-neutral-light text-neutral-dark/60'
            }`}>
              {completedTasks.length}
            </span>
          </button>
        </div>
      </div>

      {/* Orders List Container */}
      <div className="px-4 flex-1 flex flex-col gap-4">
        {activeTab === 'active' ? (
          activeTasks.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 bg-white border border-neutral-border rounded-[32px] text-center shadow-xs">
              <div className="w-12 h-12 rounded-full bg-neutral-light text-neutral-dark/20 flex items-center justify-center text-xl mb-2">
                <FaInbox />
              </div>
              <h4 className="text-xs font-bold text-neutral-dark/60">No Active Tasks</h4>
              <p className="text-[10px] text-neutral-dark/40 font-semibold max-w-[220px] mx-auto mt-0.5">
                Go to the dashboard and claim available jobs to get started.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {activeTasks.map((order) => {
                const distance = getSimulatedDistance(order.id);
                const itemsCount = order.items?.reduce((acc, i) => acc + i.quantity, 0) || 0;
                
                return (
                  <div
                    key={order.id}
                    onClick={() => navigate(`/rider/track/${order.id}`)}
                    className="bg-white p-4.5 rounded-[28px] border border-neutral-border flex flex-col gap-3.5 shadow-sm cursor-pointer hover:border-[#8B0000] hover:shadow transition-all relative overflow-hidden text-left"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-[#8B0000]"></div>

                    <div className="flex justify-between items-start pl-1">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-neutral-dark">
                            ID: {order.id.slice(-6).toUpperCase()}
                          </span>
                          <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-full border ${getStatusStyle(order.status)}`}>
                            {order.status.replace('_', ' ')}
                          </span>
                        </div>
                        <span className="text-[9px] text-neutral-dark/45 font-bold mt-1 uppercase tracking-wider flex items-center gap-1">
                          <FaClipboardList className="text-[10px]" /> {itemsCount} {itemsCount === 1 ? 'item' : 'items'} • Payout {formatPrice(40)}
                        </span>
                      </div>
                      <span className="text-sm font-black text-neutral-dark">{formatPrice(order.total)}</span>
                    </div>

                    <div className="bg-neutral-light/50 border border-neutral-border/40 p-3 rounded-2xl pl-4 text-xs font-semibold text-neutral-dark/80 flex flex-col gap-2">
                      <div className="flex items-start gap-2">
                        <FaMapMarkerAlt className="text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-[8px] font-bold text-neutral-dark/40 uppercase">Delivery Address</span>
                          <span className="text-[11px] font-extrabold text-neutral-dark truncate mt-0.5">{order.address}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pl-1 mt-0.5">
                      <span className="text-[9.5px] font-black text-neutral-dark/50 flex items-center gap-1">
                        <FaClock className="text-secondary-dark" /> Approx {distance} km away
                      </span>
                      <span className="text-primary font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 hover:translate-x-1 transition-all">
                        Track Details <FaChevronRight className="text-[9px]" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : completedTasks.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 px-4 bg-white border border-neutral-border rounded-[32px] text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-neutral-light text-neutral-dark/20 flex items-center justify-center text-xl mb-2">
              <FaCheckCircle />
            </div>
            <h4 className="text-xs font-bold text-neutral-dark/60">No Completed Tasks</h4>
            <p className="text-[10px] text-neutral-dark/40 font-semibold max-w-[200px] mx-auto mt-0.5">
              Deliver claimed orders to see your completed jobs history.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {completedTasks.map((order) => {
              const paymentCod = order.paymentMethod?.toLowerCase() === 'cod';
              const payout = 40;
              
              return (
                <div
                  key={order.id}
                  className="bg-white p-4 rounded-2xl border border-neutral-border flex justify-between items-center text-xs font-semibold text-neutral-dark shadow-xs"
                >
                  <div className="flex flex-col text-left gap-1">
                    <span className="font-black text-neutral-dark">ID: {order.id.slice(-6).toUpperCase()}</span>
                    <span className="text-[9px] text-neutral-dark/45 font-bold uppercase tracking-wider truncate max-w-[220px]">
                      {order.address}
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase border ${
                        paymentCod ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-green-50 border-green-100 text-green-600'
                      }`}>
                        {order.paymentMethod || 'COD'}
                      </span>
                      <span className="text-[9px] text-emerald-600 font-extrabold">Payout: {formatPrice(payout)}</span>
                    </div>
                  </div>
                  <span className="text-emerald-600 flex items-center gap-1 font-black text-xs shrink-0 self-center">
                    <FaCheckCircle /> Done
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedOrders;
