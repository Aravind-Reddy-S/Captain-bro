import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OrderContext } from '../context/OrderContext';
import { useRider } from '../hooks/useRider';
import { formatPrice } from '../utils/formatPrice';
import Loader from '../components/common/Loader';
import Button from '../components/common/Button';
import { 
  FaPhone, 
  FaMapMarkerAlt, 
  FaCheckCircle, 
  FaClipboardList, 
  FaTruck, 
  FaPen, 
  FaCoins, 
  FaArrowLeft,
  FaHome
} from 'react-icons/fa';
import { updateOrderTrackingDb } from '../firebase/database';
import DeliveryMap from '../components/common/DeliveryMap';

const ROUTE_PATH = [
  { lat: 17.9689, lng: 79.5941 }, // Chowrasta Restaurant
  { lat: 17.9730, lng: 79.5910 },
  { lat: 17.9780, lng: 79.5870 },
  { lat: 17.9830, lng: 79.5830 },
  { lat: 17.9880, lng: 79.5790 },
  { lat: 17.9920, lng: 79.5750 },
  { lat: 17.9960, lng: 79.5710 },
  { lat: 18.0000, lng: 79.5680 },
  { lat: 18.0040, lng: 79.5650 },
  { lat: 18.0076, lng: 79.5623 }  // Hanamkonda Customer
];

export const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { orders, fetchOrders, changeStatus } = useContext(OrderContext);
  const { trackingState, setTrackingState, resetTrackingState } = useRider();
  const [order, setOrder] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Confetti Success states
  const confettiCanvasRef = useRef(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Initialize/reset trackingState on order ID mismatch
  useEffect(() => {
    if (trackingState.orderId !== id) {
      resetTrackingState(id);
    }
  }, [id, trackingState.orderId]);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const o = orders.find((ord) => ord.id === id);
    if (o) setOrder(o);
  }, [orders, id]);

  const toggleCheckItem = (index) => {
    setTrackingState(prev => ({
      ...prev,
      checkedItems: {
        ...prev.checkedItems,
        [index]: !prev.checkedItems[index]
      }
    }));
  };

  const isAllItemsChecked = () => {
    if (!order || !order.items || order.items.length === 0) return true;
    return order.items.every((_, idx) => trackingState.checkedItems[idx]);
  };

  const getLiveLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('GPS location fallback to simulation.', error);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 4000, maximumAge: 0 }
      );
    });
  };

  // Move simulation step function
  const moveNextStep = async (currentIndex) => {
    if (currentIndex >= ROUTE_PATH.length - 1) {
      setTrackingState(prev => ({ ...prev, arrived: true }));
      return;
    }
    const nextIndex = currentIndex + 1;

    let coords = ROUTE_PATH[nextIndex];
    const liveCoords = await getLiveLocation();
    if (liveCoords) {
      coords = liveCoords;
    }

    setTrackingState(prev => ({
      ...prev,
      routeIndex: nextIndex,
      arrived: nextIndex === ROUTE_PATH.length - 1
    }));

    try {
      await updateOrderTrackingDb(id, coords.lat, coords.lng, 'picked_up');
    } catch (err) {
      console.error('Failed to update tracking location: ', err);
    }
  };

  // Route simulation cycle when marked picked_up
  useEffect(() => {
    if (
      !order || 
      order.status !== 'picked_up' || 
      !trackingState.isSimulating || 
      trackingState.arrived ||
      trackingState.orderId !== id
    ) return;

    const intervalDuration = 4000 / trackingState.simSpeed;

    const interval = setInterval(() => {
      moveNextStep(trackingState.routeIndex);
    }, intervalDuration);

    return () => clearInterval(interval);
  }, [order?.status, trackingState.routeIndex, trackingState.isSimulating, trackingState.simSpeed, trackingState.arrived, id, trackingState.orderId]);

  // Launch Confetti Effect
  const startConfetti = () => {
    const canvas = confettiCanvasRef.current;
    if (!canvas) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const ctx = canvas.getContext('2d');
    const colors = ['#8B0000', '#FFC107', '#4CAF50', '#2196F3', '#E91E63'];
    let particles = [];
    
    for (let i = 0; i < 180; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height * 0.45,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.5) * 16 - 7,
        radius: Math.random() * 4 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.015 + 0.006
      });
    }
    
    let animationId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22; // gravity
        p.alpha -= p.decay;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        
        if (p.alpha <= 0 || p.y > canvas.height) {
          particles.splice(idx, 1);
        }
      });
      
      if (particles.length > 0) {
        animationId = requestAnimationFrame(animate);
      }
    };
    animate();
  };

  useEffect(() => {
    if (showSuccessModal) {
      setTimeout(startConfetti, 100);
    }
  }, [showSuccessModal]);

  if (!order || trackingState.orderId !== id) return <Loader fullPage={true} />;

  // Helper to extract order PIN deterministically or use stored code
  const getOrderPin = (ord) => {
    if (!ord) return '';
    if (ord.deliveryPin) return ord.deliveryPin;
    if (ord.delivery_pin) return ord.delivery_pin;
    
    const idStr = ord.id || '';
    let hash = 0;
    for (let i = 0; i < idStr.length; i++) {
      hash = idStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    return (Math.abs(hash % 9000) + 1000).toString();
  };

  const handlePickUpOrder = async () => {
    setSubmitting(true);
    try {
      await changeStatus(order.id, 'picked_up');
      let coords = ROUTE_PATH[0];
      const liveCoords = await getLiveLocation();
      if (liveCoords) {
        coords = liveCoords;
      }
      await updateOrderTrackingDb(order.id, coords.lat, coords.lng, 'picked_up');
      
      setTrackingState(prev => ({ ...prev, isSimulating: true }));
      alert('Order marked as Picked Up! You are now in transit.');
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCompleteDelivery = async () => {
    setSubmitting(true);
    try {
      await changeStatus(order.id, 'delivered');
      await updateOrderTrackingDb(order.id, ROUTE_PATH[ROUTE_PATH.length - 1].lat, ROUTE_PATH[ROUTE_PATH.length - 1].lng, 'delivered');
      setShowSuccessModal(true);
    } catch (err) {
      alert(err.message);
      setSubmitting(false);
    }
  };

  const isCod = order.paymentMethod?.toLowerCase() === 'cod';
  const payoutAmount = 40; // Flat ₹40 payout only
  const expectedPin = getOrderPin(order);
  const isPinCorrect = trackingState.deliveryPinInput === expectedPin;
  const riderCoords = ROUTE_PATH[trackingState.routeIndex] || ROUTE_PATH[0];

  return (
    <div className="flex-1 bg-neutral-light flex flex-col gap-4 pb-24 text-left overflow-y-auto relative">
      
      {/* Confetti Success Fullscreen Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/95 z-[99] flex flex-col items-center justify-center p-6 text-center text-white animate-fade-in">
          <canvas ref={confettiCanvasRef} className="absolute inset-0 pointer-events-none" />
          
          <div className="z-10 flex flex-col items-center max-w-[380px] gap-5 mt-[-40px]">
            <div className="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center text-4xl shadow-xl shadow-emerald-500/20 border-2 border-emerald-400 animate-bounce">
              <FaCheckCircle className="text-white" />
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-black text-white">Delivery Completed!</h2>
              <p className="text-xs text-white/60 font-semibold mt-0.5">Order: {order.id.slice(-8).toUpperCase()}</p>
            </div>

            {/* Payout Details */}
            <div className="w-full bg-white/5 border border-white/10 rounded-[32px] p-5 flex flex-col gap-4">
              <div className="flex justify-between items-center text-sm font-black">
                <span className="text-secondary">Rider Payout</span>
                <span className="text-secondary text-lg">{formatPrice(payoutAmount)}</span>
              </div>
            </div>

            {isCod && (
              <div className="w-full bg-amber-500/10 border border-amber-500/25 p-4 rounded-2xl text-xs font-bold text-amber-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FaCoins className="text-sm" />
                  <span>Collected Cash Payment:</span>
                </div>
                <span className="text-sm font-black">{formatPrice(order.total)}</span>
              </div>
            )}

            <Button 
              onClick={() => {
                setShowSuccessModal(false);
                resetTrackingState(null); // Clear active tracking
                navigate('/rider');
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-4 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider shadow-lg active:scale-95 transition-all mt-3"
            >
              <FaHome /> Back to Dashboard
            </Button>
          </div>
        </div>
      )}

      {/* Details Header */}
      <div className="bg-white px-4 py-4 border-b border-neutral-border flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/rider/orders')}
            className="p-2 -ml-2 rounded-full text-neutral-dark hover:bg-neutral-light transition-all active:scale-90"
          >
            <FaArrowLeft className="text-sm" />
          </button>
          <div>
            <h2 className="text-base font-black text-neutral-dark">Job Details</h2>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] text-neutral-dark/45 font-black">ID: {order.id.slice(-8).toUpperCase()}</span>
              <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-full border ${
                order.status === 'dispatched' ? 'bg-blue-500/10 border-blue-500/20 text-blue-600' :
                order.status === 'picked_up' ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 animate-pulse' :
                'bg-neutral-light border-neutral-border text-neutral-dark'
              }`}>
                {order.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 flex flex-col gap-4">
        {/* Live Map Card */}
        <div className="bg-white p-4.5 rounded-[32px] border border-neutral-border shadow-sm flex flex-col gap-3">
          <h4 className="text-[10px] font-black text-neutral-dark/40 uppercase tracking-widest pl-1">
            Real-time Transit map
          </h4>
          <DeliveryMap 
            riderLat={riderCoords.lat}
            riderLng={riderCoords.lng}
            status={order.status}
          />

          {order.status === 'picked_up' && (
            <div className="flex flex-col gap-3 mt-1 pl-1">
              <div className="flex justify-between items-center text-[10px] font-bold text-neutral-dark opacity-75">
                <span>Route Progress: {Math.round((trackingState.routeIndex / (ROUTE_PATH.length - 1)) * 100)}%</span>
                <span className={trackingState.arrived ? 'text-green-600 font-extrabold' : 'text-primary font-black animate-pulse'}>
                  {trackingState.arrived ? 'Arrived at Customer Location' : 'Delivering Package...'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Customer Info Card */}
        <div className="bg-white p-5 rounded-[32px] border border-neutral-border flex flex-col gap-4 shadow-sm">
          <h4 className="text-[10px] font-black text-neutral-dark/40 uppercase tracking-widest pl-0.5">
            Customer details
          </h4>
          
          <div className="flex flex-col gap-3 text-xs font-semibold text-neutral-dark/80">
            <div className="flex justify-between items-center pb-2 border-b border-neutral-border/50">
              <span className="text-neutral-dark/45 font-bold uppercase text-[9px]">Name</span>
              <span className="font-extrabold text-neutral-dark">{order.customerName}</span>
            </div>

            <div className="flex justify-between items-center pb-2 border-b border-neutral-border/50">
              <span className="text-neutral-dark/45 font-bold uppercase text-[9px]">Contact Phone</span>
              <a href={`tel:${order.customerPhone}`} className="text-primary font-black flex items-center gap-1.5 hover:underline">
                <FaPhone className="text-[10px]" /> {order.customerPhone}
              </a>
            </div>

            <div className="flex flex-col gap-1 items-start pl-0.5">
              <span className="text-[9px] text-neutral-dark/45 font-bold uppercase leading-none mb-1">Delivery Address</span>
              <div className="flex gap-2 items-start mt-0.5">
                <FaMapMarkerAlt className="text-primary mt-0.5 flex-shrink-0" />
                <span className="leading-snug">{order.address}</span>
              </div>
              {order.landmark && (
                <div className="bg-neutral-light/50 border border-neutral-border/40 px-3 py-1.5 rounded-lg mt-2 ml-5 text-[10.5px] text-neutral-dark/65 font-bold">
                  📍 Landmark: {order.landmark}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items Summary Checklist Card */}
        <div className="bg-white p-5 rounded-[32px] border border-neutral-border flex flex-col gap-4 shadow-sm">
          <h4 className="text-[10px] font-black text-neutral-dark/40 uppercase tracking-widest pl-0.5">
            {order.status === 'dispatched' ? 'Verify Kitchen items (Check all to pick up)' : 'Items Details'}
          </h4>

          <div className="flex flex-col gap-2.5">
            {order.items?.map((item, index) => {
              const isChecked = !!trackingState.checkedItems[index];
              const isPendingPickup = order.status === 'dispatched';
              
              return (
                <div 
                  key={index} 
                  onClick={() => isPendingPickup && toggleCheckItem(index)}
                  className={`flex justify-between items-center text-xs font-bold text-neutral-dark p-2.5 rounded-xl border transition-all ${
                    isPendingPickup 
                      ? isChecked 
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-neutral-dark' 
                        : 'bg-white border-neutral-border cursor-pointer hover:border-primary/30'
                      : 'bg-neutral-light/50 border-neutral-border/40 text-neutral-dark/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isPendingPickup ? (
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="w-4 h-4 rounded text-primary focus:ring-primary border-neutral-border accent-primary cursor-pointer shrink-0"
                      />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                    )}
                    <span className={`truncate ${isChecked && isPendingPickup ? 'line-through opacity-45' : ''} flex flex-col items-start`}>
                      <span>{item.name} <span className="opacity-55 text-[10px] ml-1 font-extrabold">x{item.quantity}</span></span>
                      {item.cuttingType && (
                        <span className="text-[8px] text-[#8B0000] font-extrabold tracking-wide uppercase mt-0.5">
                          ✂️ {item.cuttingType}
                        </span>
                      )}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-neutral-dark/50 shrink-0">{item.weight || '1 Pack'}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action button CTA */}
        <div className="pt-2 flex flex-col gap-3">
          {order.status === 'dispatched' && (
            <>
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-xs text-blue-800 font-bold flex items-center gap-2.5 pl-4">
                <FaTruck className="text-sm text-blue-600 animate-bounce" />
                <span>Verify and check off all items above to dispatch from the kitchen.</span>
              </div>
              <Button 
                onClick={handlePickUpOrder} 
                loading={submitting} 
                disabled={!isAllItemsChecked()}
                className="w-full flex gap-2 justify-center items-center py-4 bg-[#8B0000] hover:bg-[#6b0000] text-white rounded-2xl text-xs font-black uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-[#8B0000]/10 hover:shadow-lg"
              >
                <FaTruck />
                <span>Mark as Picked Up (In Transit)</span>
              </Button>
            </>
          )}

          {order.status === 'picked_up' && (
            <>
              {/* Payment Details Box */}
              <div className={`p-4.5 rounded-2xl border text-xs font-semibold flex flex-col gap-2.5 pl-4 ${
                isCod 
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-950' 
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-950'
              }`}>
                <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider">
                  <FaCoins className={`text-base ${isCod ? 'text-amber-600' : 'text-emerald-600'}`} />
                  <span>Payment terms</span>
                </div>
                
                <div className="flex flex-col gap-1.5 pl-6">
                  <div className="flex justify-between">
                    <span className={isCod ? 'text-amber-800/80 font-bold' : 'text-emerald-800/80 font-bold'}>Payment Method:</span>
                    <span className="font-black uppercase">{order.paymentMethod || 'COD'}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black mt-1">
                    <span>{isCod ? 'Collect Cash Payout:' : 'Paid Amount:'}</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Verification PIN Input */}
              <div className="bg-white p-4.5 rounded-[32px] border border-neutral-border shadow-sm flex flex-col gap-3">
                <div className="flex flex-col gap-1 text-left px-0.5">
                  <h4 className="text-[10px] font-black text-neutral-dark/40 uppercase tracking-widest flex items-center gap-1.5">
                    <FaPen className="text-[9px]" /> Delivery Verification PIN
                  </h4>
                  <p className="text-[10.5px] text-neutral-dark/50 font-bold leading-none mt-0.5">Ask the customer for their 4-digit order PIN</p>
                </div>

                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    maxLength={4}
                    value={trackingState.deliveryPinInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setTrackingState(prev => ({ ...prev, deliveryPinInput: val }));
                    }}
                    placeholder="Enter 4-Digit PIN"
                    className="w-full tracking-widest text-center text-xl font-black font-mono py-3 rounded-2xl border border-neutral-border outline-none bg-neutral-light focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-all text-neutral-dark"
                  />
                  
                  {/* PIN Verification Message Badge */}
                  {trackingState.deliveryPinInput.length === 4 ? (
                    isPinCorrect ? (
                      <div className="px-3.5 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl text-[10px] font-black uppercase text-center flex items-center justify-center gap-1.5">
                        <FaCheckCircle className="text-xs" />
                        <span>PIN Verified Successfully</span>
                      </div>
                    ) : (
                      <div className="px-3.5 py-2 bg-red-500/10 border border-red-500/20 text-primary rounded-xl text-[10px] font-black uppercase text-center">
                        ✕ Invalid Delivery PIN. Try again.
                      </div>
                    )
                  ) : trackingState.deliveryPinInput.length > 0 ? (
                    <div className="px-3.5 py-2 bg-neutral-light border border-neutral-border/60 text-neutral-dark/40 rounded-xl text-[10px] font-black uppercase text-center">
                      Entering PIN code...
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Handover Checkbox */}
              <label className="flex items-start gap-3.5 p-4.5 bg-white border border-neutral-border rounded-[24px] shadow-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={trackingState.amountCollectedConfirmed}
                  onChange={(e) => setTrackingState(prev => ({ ...prev, amountCollectedConfirmed: e.target.checked }))}
                  className="w-5 h-5 rounded text-[#8B0000] focus:ring-[#8B0000] border-neutral-border accent-[#8B0000] mt-0.5 shrink-0"
                />
                <span className="text-[11.5px] font-extrabold text-neutral-dark leading-snug">
                  {isCod 
                    ? `I confirm that I have collected cash payment of ${formatPrice(order.total)} from the customer.`
                    : `I confirm that I have successfully handed over the order package to the customer.`}
                </span>
              </label>

              <Button 
                onClick={handleCompleteDelivery} 
                loading={submitting} 
                disabled={!trackingState.amountCollectedConfirmed || !isPinCorrect || !trackingState.arrived}
                className="w-full flex gap-2 justify-center items-center py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-500/10 hover:shadow-lg"
              >
                <FaCheckCircle />
                <span>{!trackingState.arrived ? 'Drive to destination first' : 'Mark as Delivered'}</span>
              </Button>
            </>
          )}

          {order.status === 'delivered' && (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl text-xs text-green-800 font-bold flex items-center justify-center gap-2 pl-4">
              <FaCheckCircle className="text-sm text-green-600" />
              <span>Order Completed successfully!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
