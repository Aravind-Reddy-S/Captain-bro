import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../utils/formatPrice';
import Button from '../../components/common/Button';
import { FaMinus, FaPlus, FaTrash, FaShoppingBag } from 'react-icons/fa';

export const Cart = () => {
  const navigate = useNavigate();
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    cartTotal, 
    deliveryFee, 
    orderTotal 
  } = useCart();

  const getImageUrl = (imageName) => {
    try {
      if (!imageName) return 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300';
      if (imageName.startsWith('data:image') || imageName.startsWith('http') || imageName.startsWith('/')) {
        return imageName;
      }
      return new URL(`../../assets/images/${imageName}`, import.meta.url).href;
    } catch (e) {
      return 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300';
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="flex-1 bg-neutral-light px-6 flex flex-col items-center justify-center text-center animate-float">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-neutral-dark/40 text-xl border border-neutral-border mb-4">
          <FaShoppingBag />
        </div>
        <h3 className="text-base font-bold text-neutral-dark">
          Your Cart is Empty
        </h3>
        <p className="text-xs text-neutral-dark/60 font-semibold mt-1 max-w-[200px]">
          Looks like you haven't added any fresh cuts yet.
        </p>
        <Button onClick={() => navigate('/products')} className="mt-5" size="sm">
          Browse Products
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-neutral-light px-4 py-5 flex flex-col gap-4 pb-20">
      {/* Cart Items List */}
      <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
        {cartItems.map((item) => {
          const itemKey = item.cartItemId || item.id;
          return (
            <div
              key={itemKey}
              className="bg-white p-3 rounded-lg border border-neutral-border flex gap-3 items-center text-left relative shadow-xs"
            >
              {/* Image */}
              <div className="w-20 h-20 bg-neutral-light rounded-md overflow-hidden flex items-center justify-center p-1.5 border border-neutral-border/40">
                <img
                  src={getImageUrl(item.image)}
                  alt={item.name}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300';
                  }}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-neutral-dark truncate">
                  {item.name}
                </h4>
                <p className="text-[10px] text-neutral-dark/50 mt-0.5 font-semibold">
                  Unit: {item.weight} • {formatPrice(item.price)}
                </p>
                {item.cuttingType && (
                  <span className="inline-block bg-primary-light text-[#8B0000] text-[8px] font-extrabold px-2 py-0.5 rounded border border-primary/10 uppercase tracking-wider mt-1">
                    ✂️ {item.cuttingType}
                  </span>
                )}
                <span className="text-xs font-extrabold text-neutral-dark block mt-1.5">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>

              {/* Controls */}
              <div className="flex flex-col items-end gap-2.5">
                <button
                  onClick={() => removeFromCart(itemKey)}
                  className="text-neutral-dark/40 hover:text-primary p-1 rounded-full hover:bg-red-50 transition-all"
                >
                  <FaTrash className="text-[11px]" />
                </button>

                <div className="flex items-center border border-neutral-border rounded-md bg-neutral-light overflow-hidden">
                  <button
                    onClick={() => updateQuantity(itemKey, item.quantity - 1)}
                    className="p-1.5 text-neutral-dark hover:bg-neutral-border/40"
                  >
                    <FaMinus className="text-[10px]" />
                  </button>
                  <span className="px-2 font-bold text-neutral-dark text-xs">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                    className="p-1.5 text-neutral-dark hover:bg-neutral-border/40"
                  >
                    <FaPlus className="text-[10px]" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bill Details */}
      <div className="bg-white p-5 rounded-lg border border-neutral-border flex flex-col gap-3 shadow-sm text-left">
        <h4 className="text-xs font-bold text-neutral-dark opacity-50 uppercase tracking-wider">
          Bill Details
        </h4>
        
        <div className="flex flex-col gap-2 border-b border-neutral-border pb-3 text-xs font-semibold text-neutral-dark/80">
          <div className="flex justify-between">
            <span>Item Subtotal</span>
            <span>{formatPrice(cartTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Partner Fee</span>
            <span>{deliveryFee === 0 ? <span className="text-green-600 font-bold">FREE</span> : formatPrice(deliveryFee)}</span>
          </div>
          {deliveryFee > 0 && (
            <p className="text-[9px] text-green-600 font-semibold -mt-1">
              Add {formatPrice(500 - cartTotal)} more for free delivery!
            </p>
          )}
        </div>

        <div className="flex justify-between items-center pt-1">
          <span className="text-sm font-bold text-neutral-dark">Grand Total</span>
          <span className="text-lg font-black text-neutral-dark">{formatPrice(orderTotal)}</span>
        </div>

        <Button onClick={() => navigate('/checkout')} className="w-full mt-2">
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
};
export default Cart;
