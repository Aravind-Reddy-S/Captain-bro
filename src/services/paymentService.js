import { getFunctions, httpsCallable } from 'firebase/functions';
import { app, isMockFirebase } from '../firebase/firebaseConfig';

const rawRazorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || '';
const isRazorpayPlaceholder = !rawRazorpayKey || 
  rawRazorpayKey.toLowerCase().includes('placeholder') || 
  rawRazorpayKey.toLowerCase().includes('your_') || 
  rawRazorpayKey.toLowerCase().includes('paste_your');

const isRazorpayMock = isMockFirebase || isRazorpayPlaceholder;
const functions = getFunctions(app);

/**
 * Dynamically injects the Razorpay Checkout script if it is not already present.
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/**
 * Initiates the payment process.
 * If in mock mode or if the API key is set to a placeholder, it displays a premium simulated Razorpay modal overlay.
 * Otherwise, it uses the official Razorpay Checkout SDK.
 */
export const initiatePayment = async ({
  amount,
  orderId,
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
  onFailure
}) => {
  const isMock = isRazorpayMock;

  if (isMock) {
    // Show high-fidelity simulated Razorpay overlay
    showMockRazorpayModal({
      amount,
      orderId,
      customerName,
      onSuccess,
      onFailure
    });
  } else {
    // Real Razorpay flow
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      onFailure(new Error('Failed to load Razorpay payment SDK. Please check your internet connection.'));
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: Math.round(amount * 100), // in paise
      currency: 'INR',
      name: 'Mana Warangal Foods',
      description: 'Order Payment',
      order_id: orderId,
      handler: function (response) {
        onSuccess({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature
        });
      },
      prefill: {
        name: customerName,
        email: customerEmail || 'customer@wfoods.com',
        contact: customerPhone || '9876543210'
      },
      theme: {
        color: '#8B0000' // primary red color
      },
      modal: {
        ondismiss: function () {
          onFailure(new Error('Payment cancelled by customer.'));
        }
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  }
};

/**
 * Spawns a beautiful, custom, styled overlay simulating the Razorpay payment modal.
 */
const showMockRazorpayModal = ({ amount, orderId, customerName, onSuccess, onFailure }) => {
  // Prevent duplicate overlays
  if (document.getElementById('mock-razorpay-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'mock-razorpay-overlay';
  overlay.className = 'fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] backdrop-blur-xs font-sans p-4';

  const modalHtml = `
    <div class="bg-white w-full max-w-[360px] rounded-lg shadow-2xl border border-neutral-border flex flex-col overflow-hidden text-left scale-95 transition-all duration-300">
      
      <!-- Razorpay Header -->
      <div class="bg-[#1C2541] p-5 text-white flex flex-col gap-1.5 relative">
        <div class="flex justify-between items-center">
          <span class="text-xs font-extrabold tracking-widest text-blue-400">RAZORPAY MOCK GATEWAY</span>
          <button id="close-rzp-mock" class="text-white/60 hover:text-white text-lg font-bold leading-none cursor-pointer">×</button>
        </div>
        <h3 class="text-base font-black mt-1">Mana Warangal Foods</h3>
        <p class="text-[10px] text-white/60 font-semibold">Order Reciept: ${orderId || 'Mock_ID'}</p>
        
        <div class="absolute right-5 bottom-4 flex flex-col items-end">
          <span class="text-[8px] font-bold text-white/50 uppercase">Amount to Pay</span>
          <span class="text-lg font-extrabold text-white">₹${amount.toFixed(2)}</span>
        </div>
      </div>

      <!-- Test Warning Banner -->
      <div class="bg-amber-50 border-b border-amber-200/50 px-5 py-2 flex items-center gap-2 text-amber-800 text-[10px] font-semibold">
        <span>⚠️</span>
        <span>Test Mode: No real money will be charged.</span>
      </div>

      <!-- Body / Actions -->
      <div class="p-5 flex flex-col gap-4 bg-neutral-light/20">
        <div class="flex flex-col gap-1.5">
          <span class="text-[9px] font-bold text-neutral-dark/45 uppercase tracking-wider">Payer Details</span>
          <div class="p-3 bg-white border border-neutral-border/60 rounded-md flex flex-col gap-1">
            <div class="flex justify-between text-xs font-semibold">
              <span class="text-neutral-dark/45">Name</span>
              <span class="text-neutral-dark">${customerName}</span>
            </div>
            <div class="flex justify-between text-xs font-semibold">
              <span class="text-neutral-dark/45">Method</span>
              <span class="text-[#8B0000] font-bold">Razorpay Online UPI</span>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-2.5 mt-2">
          <button id="mock-success-btn" class="w-full py-3 bg-[#8B0000] hover:bg-[#6B0000] text-white text-xs font-extrabold rounded-lg cursor-pointer shadow-md active:scale-95 transition-all flex justify-center items-center gap-1.5">
            <span>✓</span> Simulate Success Payment
          </button>
          
          <button id="mock-fail-btn" class="w-full py-3 bg-neutral-light hover:bg-neutral-border/40 text-neutral-dark/80 text-xs font-extrabold rounded-lg cursor-pointer transition-all border border-neutral-border active:scale-95 text-center">
            Cancel / Simulate Failure
          </button>
        </div>
      </div>

      <!-- Footer Branding -->
      <div class="py-2.5 bg-neutral-light border-t border-neutral-border text-center flex justify-center items-center gap-1 text-[8px] font-bold text-neutral-dark/30">
        <span>Securely processed by</span>
        <span class="text-blue-500 font-extrabold">Razorpay</span>
      </div>
    </div>
  `;

  overlay.innerHTML = modalHtml;
  document.body.appendChild(overlay);

  // Trigger Scale transition effect
  setTimeout(() => {
    const box = overlay.querySelector('.scale-95');
    if (box) {
      box.classList.remove('scale-95');
      box.classList.add('scale-100');
    }
  }, 50);

  const cleanUp = () => {
    if (document.body.contains(overlay)) {
      document.body.removeChild(overlay);
    }
  };

  // Bind Events
  document.getElementById('close-rzp-mock').onclick = () => {
    cleanUp();
    onFailure(new Error('Payment window closed by user.'));
  };

  document.getElementById('mock-fail-btn').onclick = () => {
    cleanUp();
    onFailure(new Error('Simulated payment failure / transaction declined.'));
  };

  document.getElementById('mock-success-btn').onclick = () => {
    cleanUp();
    // Simulate Razorpay verification response payload
    const mockPaymentId = 'pay_' + Math.random().toString(36).substr(2, 9);
    const mockOrderId = orderId || 'order_' + Math.random().toString(36).substr(2, 9);
    const mockSignature = 'sig_' + Math.random().toString(36).substr(2, 16);
    
    onSuccess({
      razorpay_order_id: mockOrderId,
      razorpay_payment_id: mockPaymentId,
      razorpay_signature: mockSignature
    });
  };
};

/**
 * Creates a Razorpay Order by invoking the backend Firebase Cloud Function or simulating it locally.
 */
export const createRazorpayOrderOnServer = async (amount) => {
  const isMock = isRazorpayMock;

  if (isMock) {
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
      success: true,
      orderId: 'rzp_ord_' + Math.random().toString(36).substr(2, 9),
      amount: Math.round(amount * 100),
      currency: 'INR'
    };
  } else {
    const createRazorpayOrder = httpsCallable(functions, 'createRazorpayOrder');
    const result = await createRazorpayOrder({ amount });
    return result.data;
  }
};

/**
 * Verifies Razorpay Payment Signature by invoking the backend Firebase Cloud Function or simulating it locally.
 */
export const verifyRazorpayPaymentOnServer = async (paymentDetails) => {
  const isMock = isRazorpayMock;

  if (isMock) {
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
      success: true,
      verified: true
    };
  } else {
    const verifyRazorpayPayment = httpsCallable(functions, 'verifyRazorpayPayment');
    const result = await verifyRazorpayPayment(paymentDetails);
    return result.data;
  }
};
