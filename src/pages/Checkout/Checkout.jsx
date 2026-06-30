import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { useAuth } from '../../hooks/useAuth';
import { useOrders } from '../../hooks/useOrders';
import { formatPrice } from '../../utils/formatPrice';
import { getAddressesDb, saveAddressDb } from '../../firebase/database';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import { FaMapMarkerAlt } from 'react-icons/fa';

import { initiatePayment, createRazorpayOrderOnServer, verifyRazorpayPaymentOnServer } from '../../services/paymentService';

export const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, orderTotal, clearCart } = useCart();
  const { currentUser } = useAuth();
  const { placeOrder, updateFields } = useOrders();

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState('custom');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [notes, setNotes] = useState(() => localStorage.getItem('checkout_instructions') || '');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [submitting, setSubmitting] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [detectError, setDetectError] = useState('');

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!currentUser) {
        setLoadingAddresses(false);
        return;
      }
      try {
        const list = await getAddressesDb(currentUser.uid);
        setSavedAddresses(list);
        
        // Pre-fill with default address if exists
        const defaultAddress = list.find(a => a.isDefault) || list[0];
        if (defaultAddress) {
          setCustomerName(defaultAddress.name || currentUser.fullName || '');
          setCustomerPhone(defaultAddress.phone || currentUser.phone || '');
          setSelectedAddressId(defaultAddress.id);
          setAddress(defaultAddress.addressLine);
          setLandmark(defaultAddress.landmark || '');
        } else {
          setCustomerName(currentUser.fullName || '');
          setCustomerPhone(currentUser.phone || '');
        }
      } catch (err) {
        console.error("Failed to load checkout addresses:", err);
      } finally {
        setLoadingAddresses(false);
      }
    };
    fetchAddresses();
  }, [currentUser]);

  const handleDetectLocation = () => {
    setDetecting(true);
    setDetectError('');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const mockAddresses = [
            "H.No 12-4-23, Subedari, Hanamkonda, Warangal, 506001",
            "Plot 55, Hunter Road, Naimnagar, Hanamkonda, Warangal, 506002",
            "Flat 202, Sri Sai Residency, Kazipet, Warangal, 506003",
            "H.No 1-8-344, Naimnagar, Hanamkonda, Warangal, 506001"
          ];
          const randomAddress = mockAddresses[Math.floor(Math.random() * mockAddresses.length)];
          setAddress(randomAddress);
          setLandmark("Detected via GPS");
          setDetecting(false);
        },
        (error) => {
          console.error(error);
          setDetectError("Could not access GPS. Please type address manually.");
          setTimeout(() => {
            setAddress("Subedari, Hanamkonda, Warangal, 506001");
            setDetectError("");
            setDetecting(false);
          }, 800);
        },
        { timeout: 5000 }
      );
    } else {
      setDetectError("Geolocation not supported by this browser.");
      setDetecting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert("Please enter receiver's name.");
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!address.trim()) {
      alert("Please enter delivery address.");
      return;
    }

    setSubmitting(true);

    // Save custom address to Firestore automatically upon successful checkout
    if (currentUser) {
      try {
        const isAlreadySaved = savedAddresses.some(
          a => a.addressLine.toLowerCase() === address.trim().toLowerCase()
        );
        if (!isAlreadySaved) {
          const newAddr = {
            id: 'addr_' + Math.random().toString(36).substr(2, 9),
            name: customerName.trim(),
            phone: customerPhone.trim(),
            addressLine: address.trim(),
            landmark: landmark.trim(),
            type: 'Other',
            isDefault: savedAddresses.length === 0
          };
          await saveAddressDb(currentUser.uid, newAddr);
        }
      } catch (saveError) {
        console.error("Failed to automatically save address:", saveError);
      }
    }

    const baseOrderData = {
      customerId: currentUser?.uid || 'guest_user',
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      items: cartItems,
      total: orderTotal,
      address,
      landmark,
      notes,
      paymentMethod,
      riderId: null
    };

    try {
      if (paymentMethod === 'online') {
        const response = await createRazorpayOrderOnServer(orderTotal);
        if (!response.success) {
          throw new Error('Failed to initialize online payment.');
        }

        const initialOrderData = {
          ...baseOrderData,
          razorpayOrderId: response.orderId,
          paymentStatus: 'pending',
          status: 'pending_payment'
        };
        const createdOrder = await placeOrder(initialOrderData);

        initiatePayment({
          amount: orderTotal,
          orderId: response.orderId,
          customerName: currentUser?.fullName || 'Guest Customer',
          customerEmail: currentUser?.email || 'customer@wfoods.com',
          customerPhone: currentUser?.phone || '9876543210',
          onSuccess: async (paymentDetails) => {
            try {
              const verifyRes = await verifyRazorpayPaymentOnServer(paymentDetails);
              if (verifyRes.success) {
                const updatedOrder = await updateFields(createdOrder.id, {
                  paymentId: paymentDetails.razorpay_payment_id,
                  paymentStatus: 'paid',
                  status: 'pending'
                });
                clearCart();
                localStorage.removeItem('checkout_instructions');
                navigate('/order-success', { state: { order: { ...createdOrder, ...updatedOrder, status: 'pending', paymentStatus: 'paid' } } });
              } else {
                alert('Payment verification failed.');
                setSubmitting(false);
              }
            } catch (err) {
              alert('Error verifying payment: ' + err.message);
              setSubmitting(false);
            }
          },
          onFailure: (err) => {
            alert('Payment cancelled or failed: ' + err.message);
            setSubmitting(false);
          }
        });
      } else {
        const finalOrderData = {
          ...baseOrderData,
          paymentStatus: 'pending'
        };
        const newOrder = await placeOrder(finalOrderData);
        clearCart();
        localStorage.removeItem('checkout_instructions');
        navigate('/order-success', { state: { order: newOrder } });
      }
    } catch (err) {
      alert('Failed to process order: ' + err.message);
      setSubmitting(false);
    }
  };

  if (loadingAddresses) {
    return <Loader fullPage={true} />;
  }

  return (
    <div className="flex-1 bg-neutral-light px-4 py-5 flex flex-col gap-4 pb-20">
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4 justify-between">
        <div className="flex flex-col gap-4">
          {/* Delivery Details Card */}
          <div className="bg-white p-5 rounded-lg border border-neutral-border flex flex-col gap-4 shadow-sm text-left">
            <h4 className="text-xs font-bold text-neutral-dark opacity-50 uppercase tracking-wider border-b border-neutral-border/50 pb-2 mb-1">
              Delivery Location
            </h4>

            {/* Receiver Contact Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 border-b border-neutral-border/50 pb-4 mb-1">
              <Input
                label="Receiver's Name"
                placeholder="Enter contact name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required={true}
              />
              <Input
                label="Mobile Number"
                placeholder="Enter 10-digit mobile number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                required={true}
                type="tel"
                maxLength={10}
              />
            </div>
            
            {savedAddresses.length > 0 && (
              <div className="flex flex-col gap-2 border-b border-neutral-border/50 pb-3 mb-2">
                <span className="text-xs font-bold text-neutral-dark opacity-80">
                  Select Delivery Location
                </span>
                <div className="flex flex-col gap-2">
                  {savedAddresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`
                        flex gap-3 items-center p-3.5 rounded-md border cursor-pointer transition-all text-xs font-semibold
                        ${selectedAddressId === addr.id ? 'border-primary bg-primary-light/20' : 'border-neutral-border bg-neutral-light/35'}
                      `}
                    >
                      <input
                        type="radio"
                        name="delivery_address"
                        value={addr.id}
                        checked={selectedAddressId === addr.id}
                        onChange={() => {
                          setSelectedAddressId(addr.id);
                          setAddress(addr.addressLine);
                          setLandmark(addr.landmark || '');
                          setCustomerName(addr.name || currentUser?.fullName || '');
                          setCustomerPhone(addr.phone || currentUser?.phone || '');
                        }}
                        className="accent-primary"
                      />
                      <div className="flex flex-col min-w-0 text-left">
                        <span className="font-bold text-neutral-dark">{addr.type} Location ({addr.name})</span>
                        <span className="text-[10px] text-neutral-dark/60 mt-0.5 truncate">{addr.addressLine}</span>
                      </div>
                    </label>
                  ))}
                  
                  <label
                    className={`
                      flex gap-3 items-center p-3.5 rounded-md border cursor-pointer transition-all text-xs font-semibold
                      ${selectedAddressId === 'custom' ? 'border-primary bg-primary-light/20' : 'border-neutral-border bg-neutral-light/35'}
                    `}
                  >
                    <input
                      type="radio"
                      name="delivery_address"
                      value="custom"
                      checked={selectedAddressId === 'custom'}
                      onChange={() => {
                        setSelectedAddressId('custom');
                        setAddress('');
                        setLandmark('');
                      }}
                      className="accent-primary"
                    />
                    <span className="font-bold text-neutral-dark">Add/Enter custom address</span>
                  </label>
                </div>
              </div>
            )}

            {selectedAddressId === 'custom' ? (
              <>
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={detecting}
                    className="w-full py-2.5 px-4 bg-primary-light text-primary hover:bg-primary-light/80 border border-primary/20 rounded-md font-extrabold text-xs transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    <FaMapMarkerAlt className="text-sm" />
                    <span>{detecting ? 'Detecting Location...' : 'Use Current GPS Location'}</span>
                  </button>
                  {detectError && (
                    <span className="text-[10px] font-semibold text-primary text-center">
                      {detectError}
                    </span>
                  )}
                </div>

                <Input
                  label="Complete Address"
                  placeholder="House/Flat No, Street, Colony..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required={true}
                />

                <Input
                  label="Landmark (Optional)"
                  placeholder="e.g. Near Hanamkonda Temple"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                />
              </>
            ) : (
              <div className="bg-neutral-light/50 border border-neutral-border/60 p-3 rounded-md text-xs font-semibold text-neutral-dark/80">
                <p className="font-bold text-neutral-dark text-[10px] uppercase text-primary/80">Shipping to</p>
                <p className="mt-1">{address}</p>
                {landmark && <p className="text-[10px] text-neutral-dark/50 mt-0.5">Landmark: {landmark}</p>}
              </div>
            )}

            <Input
              label="Delivery Instructions (Optional)"
              placeholder="e.g. Leave with security, call before arrival..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Payment Method Card */}
          <div className="bg-white p-5 rounded-lg border border-neutral-border flex flex-col gap-3 shadow-sm text-left">
            <h4 className="text-xs font-bold text-neutral-dark opacity-50 uppercase tracking-wider">
              Payment Method
            </h4>

            <div className="flex flex-col gap-2">
              <label className={`
                flex items-center gap-3 p-3.5 rounded-md border cursor-pointer transition-all
                ${paymentMethod === 'cod' ? 'border-primary bg-primary-light/35' : 'border-neutral-border'}
              `}>
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="accent-primary"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-neutral-dark">Cash on Delivery (COD)</span>
                  <span className="text-[10px] text-neutral-dark/50 mt-0.5">Pay after checking your fresh cuts</span>
                </div>
              </label>

              <label className={`
                flex items-center gap-3 p-3.5 rounded-md border cursor-pointer transition-all
                ${paymentMethod === 'online' ? 'border-primary bg-primary-light/35' : 'border-neutral-border'}
              `}>
                <input
                  type="radio"
                  name="payment"
                  value="online"
                  checked={paymentMethod === 'online'}
                  onChange={() => setPaymentMethod('online')}
                  className="accent-primary"
                />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-neutral-dark">UPI / Credit Cards (Simulated)</span>
                  <span className="text-[10px] text-neutral-dark/50 mt-0.5">Instant online confirmation</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Action Button & Pricing Summary */}
        <div className="bg-white p-5 rounded-lg border border-neutral-border flex flex-col gap-3 shadow-sm mt-4 text-left">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-neutral-dark/50 uppercase">Total amount</span>
              <span className="text-lg font-black text-neutral-dark leading-none">{formatPrice(orderTotal)}</span>
            </div>
            <Button type="submit" loading={submitting} className="px-8">
              Confirm Order
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
