import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import { useAuth } from '../../hooks/useAuth';
import { formatPrice } from '../../utils/formatPrice';
import { formatDate } from '../../utils/helpers';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import { FaInbox, FaBoxOpen, FaShippingFast, FaCheckCircle, FaExclamationCircle, FaPhoneAlt, FaMotorcycle } from 'react-icons/fa';

export const Orders = () => {
  const navigate = useNavigate();
  const { orders, loading, fetchOrders } = useOrders();
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  const userOrders = orders
    .filter((o) => (o.customerId === currentUser?.uid || o.customerId === 'guest_user') && o.status !== 'pending_payment')
    .sort((a, b) => new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0));

  const getStatusDetails = (status) => {
    const details = {
      pending: { color: 'text-amber-500 bg-amber-50 border-amber-200/50', label: 'Order Placed', icon: <FaBoxOpen /> },
      accepted: { color: 'text-blue-500 bg-blue-50 border-blue-200/50', label: 'Accepted', icon: <FaBoxOpen /> },
      preparing: { color: 'text-indigo-500 bg-indigo-50 border-indigo-200/50', label: 'Preparing Cut', icon: <FaBoxOpen /> },
      dispatched: { color: 'text-blue-500 bg-blue-50 border-blue-200/50', label: 'Dispatched / Ready', icon: <FaBoxOpen /> },
      picked_up: { color: 'text-pink-500 bg-pink-50 border-pink-200/50', label: 'Out for Delivery', icon: <FaShippingFast /> },
      delivered: { color: 'text-green-600 bg-green-50 border-green-200/50', label: 'Delivered', icon: <FaCheckCircle /> },
      cancelled: { color: 'text-red-600 bg-red-50 border-red-200/50', label: 'Cancelled', icon: <FaExclamationCircle /> }
    };
    return details[status] || { color: 'text-neutral-500 bg-neutral-50 border-neutral-200/50', label: status, icon: <FaBoxOpen /> };
  };

  const getImageUrl = (imageName) => {
    try {
      if (!imageName) return '';
      if (imageName.startsWith('data:image') || imageName.startsWith('http') || imageName.startsWith('/')) {
        return imageName;
      }
      return new URL(`../../assets/images/${imageName}`, import.meta.url).href;
    } catch (e) {
      return 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300';
    }
  };

  if (loading) return <Loader fullPage={true} />;

  if (userOrders.length === 0) {
    return (
      <div className="flex-1 bg-neutral-light px-6 flex flex-col items-center justify-center text-center animate-float">
        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-neutral-dark/40 text-xl border border-neutral-border mb-4">
          <FaInbox />
        </div>
        <h3 className="text-base font-bold text-neutral-dark">
          No Orders Yet
        </h3>
        <p className="text-xs text-neutral-dark/60 font-semibold mt-1 max-w-[200px]">
          Place your first order to track it here in real-time.
        </p>
        <Button onClick={() => navigate('/products')} className="mt-5" size="sm">
          Shop Fresh Cuts
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-neutral-light px-4 py-5 flex flex-col gap-4 pb-20">
      <div className="text-left mb-2">
        <h2 className="text-lg font-bold text-neutral-dark">My Order History</h2>
        <p className="text-[10px] text-neutral-dark/50 font-semibold mt-0.5">Track and view summaries of your delivery history</p>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
        {userOrders.map((order) => {
          const statusDetails = getStatusDetails(order.status);
          return (
            <div
              key={order.id}
              onClick={() => navigate(`/orders/${order.id}`)}
              className="bg-white rounded-lg border border-neutral-border p-4 flex flex-col gap-3.5 shadow-sm text-left hover:shadow-md cursor-pointer transition-all duration-200"
            >
              {/* Header */}
              <div className="flex justify-between items-center pb-2.5 border-b border-neutral-border">
                <div className="flex flex-col">
                  <span className="text-[10px] text-neutral-dark/40 font-bold">
                    ORDER ID: {order.id.slice(-6).toUpperCase()}
                  </span>
                  <span className="text-[9px] text-neutral-dark/50 font-semibold mt-0.5">
                    {formatDate(order.createdAt || order.created_at)}
                  </span>
                </div>
                
                <span className={`px-2.5 py-1 rounded text-[9px] font-bold border flex items-center gap-1 ${statusDetails.color}`}>
                  {statusDetails.icon}
                  <span>{statusDetails.label}</span>
                </span>
              </div>

              {/* Items Summary */}
              <div className="flex gap-3 items-center">
                <div className="flex -space-x-4 overflow-hidden py-1">
                  {order.items?.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="inline-block h-10 w-10 rounded-full ring-2 ring-white overflow-hidden bg-neutral-light border border-neutral-border/50 p-1">
                      <img
                        className="h-full w-full object-contain"
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=100';
                        }}
                      />
                    </div>
                  ))}
                  {order.items?.length > 3 && (
                    <div className="flex items-center justify-center h-10 w-10 rounded-full ring-2 ring-white bg-neutral-dark text-white text-[9px] font-bold">
                      +{order.items.length - 3}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-neutral-dark truncate">
                    {order.items?.map((i) => i.name).join(', ')}
                  </p>
                  <p className="text-[10px] text-neutral-dark/60 font-semibold mt-0.5">
                    Total: {order.items?.length || 0} items • {formatPrice(order.total)}
                  </p>
                </div>
              </div>

              {/* Rider Assigned Info */}
              {order.riderId && !['delivered', 'cancelled'].includes(order.status) && (
                <div className="mt-1 pt-3 border-t border-neutral-border flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-secondary-light border border-secondary/20 flex items-center justify-center text-secondary-dark text-xs font-black uppercase">
                      {order.riderName ? order.riderName.substring(0, 2) : <FaMotorcycle />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-neutral-dark/60 uppercase tracking-wider">Delivery Partner</span>
                      <span className="text-xs font-extrabold text-neutral-dark">{order.riderName || 'Assigned'}</span>
                    </div>
                  </div>
                  <a
                    href={`tel:${order.riderPhone || ''}`}
                    className="w-8 h-8 rounded-full bg-green-500 hover:bg-green-600 active:scale-95 text-white flex items-center justify-center transition-all shadow-sm"
                  >
                    <FaPhoneAlt className="text-xs" />
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default Orders;
