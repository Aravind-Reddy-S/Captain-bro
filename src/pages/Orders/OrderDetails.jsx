import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OrderContext } from '../../context/OrderContext';
import { formatPrice } from '../../utils/formatPrice';
import { formatDate } from '../../utils/helpers';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import { 
  FaCheckCircle, 
  FaClipboardList, 
  FaMapMarkerAlt, 
  FaTruck, 
  FaClock, 
  FaChevronDown, 
  FaChevronUp, 
  FaPhoneAlt, 
  FaStar, 
  FaMotorcycle,
  FaArrowLeft
} from 'react-icons/fa';
import { subscribeToOrderTrackingDb } from '../../firebase/database';
import DeliveryMap from '../../components/common/DeliveryMap';

export const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, fetchOrders } = useContext(OrderContext);
  const [order, setOrder] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [showItems, setShowItems] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const o = orders.find((ord) => ord.id === id);
    if (o) setOrder(o);
  }, [orders, id]);

  // Subscribe to realtime order coordinates updates
  useEffect(() => {
    if (!order) return;

    const unsubscribe = subscribeToOrderTrackingDb(order.id, (data) => {
      setTrackingData(data);
    });

    return () => unsubscribe();
  }, [order?.id]);

  if (!order) return <Loader fullPage={true} />;

  const steps = ['pending', 'accepted', 'preparing', 'dispatched', 'picked_up', 'delivered'];
  const currentStepIndex = steps.indexOf(order.status);

  // Estimated delivery messages based on status
  const getEtaMessage = () => {
    switch (order.status) {
      case 'pending':
        return 'Est. Delivery: 25 - 30 Mins';
      case 'accepted':
        return 'Est. Delivery: 20 - 25 Mins';
      case 'preparing':
        return 'Est. Delivery: 15 - 20 Mins';
      case 'dispatched':
        return 'Rider Assigned: 10 - 15 Mins';
      case 'picked_up':
        return 'Out for Delivery: 5 - 8 Mins';
      case 'delivered':
        return 'Delivered Successfully';
      case 'cancelled':
        return 'Order Cancelled';
      default:
        return 'Tracking live...';
    }
  };

  const getStepStatusClass = (index) => {
    if (order.status === 'cancelled') return 'bg-red-500 text-white';
    if (index < currentStepIndex) return 'bg-green-500 text-white';
    if (index === currentStepIndex) return 'bg-primary text-white animate-pulse';
    return 'bg-neutral-border text-neutral-dark/40';
  };

  if (order.status === 'cancelled') {
    return (
      <div className="flex-1 bg-neutral-light px-6 flex flex-col items-center justify-center text-center animate-fade-in py-10">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-primary text-2xl border border-primary/20 mb-4">
          ✕
        </div>
        <h3 className="text-lg font-bold text-neutral-dark">Order Cancelled</h3>
        <p className="text-xs text-neutral-dark/60 font-semibold mt-1.5 max-w-[240px]">
          We apologize, but this order was cancelled. Please browse our fresh cuts to place another order.
        </p>
        <Button onClick={() => navigate('/home')} className="mt-6" size="sm">
          Return to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-64px)] flex flex-col bg-neutral-light overflow-hidden">
      
      {/* Floating Glass Header */}
      <div className="absolute top-4 left-4 right-4 z-20 bg-white/90 backdrop-blur-md border border-neutral-border/70 p-3.5 rounded-lg flex justify-between items-center shadow-md">
        <button 
          onClick={() => navigate('/orders')} 
          className="p-2.5 bg-neutral-light hover:bg-neutral-border/40 rounded-md transition-all active:scale-95 text-neutral-dark cursor-pointer text-xs font-bold flex items-center gap-1.5 border border-neutral-border/40"
        >
          <FaArrowLeft /> Back
        </button>
        <div className="text-right">
          <span className="text-[8px] text-neutral-dark/45 font-black uppercase tracking-wider block">Order ID</span>
          <span className="text-xs font-extrabold text-neutral-dark">{order.id.slice(-8).toUpperCase()}</span>
        </div>
      </div>

      {/* Map Viewport */}
      <div className="w-full flex-1 relative min-h-[280px] z-0">
        <DeliveryMap
          riderLat={trackingData?.coordinates?.latitude}
          riderLng={trackingData?.coordinates?.longitude}
          status={order.status}
        />
      </div>

      {/* Sliding Details Bottom Sheet */}
      <div className="bg-white border-t border-neutral-border rounded-t-lg p-5 shadow-2xl flex flex-col gap-4 overflow-y-auto max-h-[55%] z-10 text-left">
        
        {/* ETA & Progress Summary */}
        <div className="flex justify-between items-center border-b border-neutral-border/50 pb-3.5">
          <div className="flex flex-col">
            <span className="text-xs font-black text-neutral-dark leading-tight">{getEtaMessage()}</span>
            <span className="text-[9.5px] text-[#8B0000] font-bold mt-1 uppercase tracking-wider animate-pulse">
              {order.status === 'picked_up' ? 'Rider is in transit' : order.status === 'delivered' ? 'Completed' : 'Status: ' + order.status}
            </span>
          </div>
          <span className="text-[10px] font-bold text-neutral-dark/40 bg-neutral-light border border-neutral-border/60 px-3 py-1 rounded uppercase">
            {order.paymentMethod === 'cod' ? 'COD' : 'Paid Online'}
          </span>
        </div>

        {/* Delivery PIN Card */}
        {order.status !== 'delivered' && order.status !== 'cancelled' && (() => {
          const pin = order.deliveryPin || order.delivery_pin || (() => {
            const idStr = order.id || '';
            let hash = 0;
            for (let i = 0; i < idStr.length; i++) {
              hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
            }
            return (Math.abs(hash % 9000) + 1000).toString();
          })();
          
          return (
            <div className="p-4 bg-secondary/10 border border-secondary/25 rounded-2xl flex justify-between items-center text-xs shadow-sm">
              <div className="flex flex-col gap-0.5 text-left">
                <span className="text-[9px] font-black text-neutral-dark/50 uppercase tracking-wider">Delivery Verification PIN</span>
                <span className="text-[10.5px] font-bold text-neutral-dark mt-0.5 leading-snug">Share this PIN with the rider when they arrive</span>
              </div>
              <span className="text-base font-black text-neutral-dark bg-white border border-secondary/40 px-3 py-1.5 rounded-xl tracking-widest font-mono select-all shadow-sm">
                {pin}
              </span>
            </div>
          );
        })()}

        {/* Micro Stepper Progress */}
        <div className="flex justify-between items-center px-1 py-1.5 bg-neutral-light/45 border border-neutral-border/40 rounded-md relative mb-1">
          {steps.slice(0, 5).map((step, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1.5 z-10 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border border-white/60 shadow-sm ${getStepStatusClass(idx)}`}>
                {step === 'pending' && <FaClipboardList />}
                {step === 'accepted' && <FaCheckCircle />}
                {step === 'preparing' && <FaClock />}
                {step === 'dispatched' && <FaTruck />}
                {step === 'picked_up' && <FaMotorcycle />}
              </div>
              <span className="text-[7.5px] font-bold text-neutral-dark/60 capitalize leading-none text-center">
                {step === 'picked_up' ? 'transit' : step}
              </span>
            </div>
          ))}
        </div>

        {/* Rider Card / Prep Radar */}
        {order.riderId ? (
          <div className="flex items-center justify-between p-4 bg-white border border-neutral-border rounded-lg shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-secondary-light border border-secondary/20 flex items-center justify-center text-secondary-dark text-lg font-black shadow-xs uppercase">
                {order.riderName ? order.riderName.substring(0, 2) : 'R'}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-neutral-dark">{order.riderName || 'Delivery Partner'}</span>
                  <span className="flex items-center gap-0.5 text-[9px] font-extrabold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100">
                    <FaStar className="text-[8px]" /> 4.9
                  </span>
                </div>
                <span className="text-[9.5px] text-neutral-dark/50 font-semibold mt-0.5">White Electric Scooter • TS-03-9999</span>
              </div>
            </div>
            
            <a 
              href={`tel:${order.riderPhone || ''}`} 
              className="w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 active:scale-95 text-white flex items-center justify-center transition-all shadow-md cursor-pointer text-sm"
            >
              <FaPhoneAlt />
            </a>
          </div>
        ) : (
          <div className="flex items-center gap-3.5 p-4 bg-neutral-light/35 border border-neutral-border/60 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-base animate-pulse">
              <FaClock />
            </div>
            <div className="flex-1">
              <span className="text-xs font-bold text-neutral-dark block leading-tight">Kitchen preparing your fresh cuts</span>
              <span className="text-[9.5px] text-neutral-dark/50 font-semibold mt-0.5 block leading-none">Assigning a nearby delivery partner...</span>
            </div>
          </div>
        )}

        {/* Collapsible Items Accordion */}
        <div className="bg-white border border-neutral-border rounded-lg overflow-hidden shadow-xs">
          <button 
            onClick={() => setShowItems(!showItems)}
            className="w-full p-4 flex justify-between items-center text-xs font-bold text-neutral-dark hover:bg-neutral-light/20 transition-all cursor-pointer"
          >
            <span>Order Summary ({order.items?.length || 0} items)</span>
            <span className="text-neutral-dark/50 text-base">
              {showItems ? <FaChevronUp /> : <FaChevronDown />}
            </span>
          </button>

          {showItems && (
            <div className="px-4 pb-4 border-t border-neutral-border/50 bg-neutral-light/5 pt-3 flex flex-col gap-2.5">
              {order.items?.map((item, index) => (
                <div key={index} className="flex flex-col text-xs font-semibold text-neutral-dark">
                  <div className="flex justify-between">
                    <span className="opacity-85">
                      {item.name} <span className="opacity-55 text-[10px] ml-1">x {item.quantity}</span>
                    </span>
                    <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                  {item.cuttingType && (
                    <span className="text-[9px] text-[#8B0000] font-black uppercase tracking-wide mt-0.5 ml-2">
                      ✂️ {item.cuttingType}
                    </span>
                  )}
                </div>
              ))}
              <div className="border-t border-neutral-border/50 my-1 pt-2 flex justify-between items-center text-xs font-extrabold text-neutral-dark">
                <span>Total Collected</span>
                <span className="text-[#8B0000]">{formatPrice(order.total)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Delivery Destination Address */}
        <div className="bg-white p-4 rounded-lg border border-neutral-border shadow-xs flex flex-col gap-2 text-xs">
          <h4 className="text-[10px] font-bold text-neutral-dark/45 uppercase tracking-wider mb-0.5">
            Delivery Destination
          </h4>
          <div className="flex gap-2.5 items-start">
            <FaMapMarkerAlt className="text-primary text-sm mt-0.5 flex-shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-neutral-dark leading-tight">{order.address}</span>
              {order.landmark && (
                <span className="text-[10px] text-neutral-dark/50 font-semibold mt-1">
                  Landmark: {order.landmark}
                </span>
              )}
              {order.notes && (
                <span className="text-[9.5px] text-neutral-dark/40 font-bold mt-1 bg-neutral-light/70 px-2.5 py-1 rounded-lg border border-neutral-border/30">
                  Instruction: "{order.notes}"
                </span>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default OrderDetails;
