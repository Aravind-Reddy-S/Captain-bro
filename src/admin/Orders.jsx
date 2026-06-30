import React, { useContext, useEffect, useState } from 'react';
import { OrderContext } from '../context/OrderContext';
import { getUsers } from '../services/userService';
import { formatPrice } from '../utils/formatPrice';
import { formatDate } from '../utils/helpers';
import Loader from '../components/common/Loader';
import { 
  FaTrash, 
  FaCheckCircle, 
  FaTruck, 
  FaClock, 
  FaUser, 
  FaPhoneAlt, 
  FaMapMarkerAlt, 
  FaDownload, 
  FaCheck, 
  FaTimes, 
  FaMotorcycle, 
  FaUtensils, 
  FaClipboardList, 
  FaRegCopy,
  FaInbox
} from 'react-icons/fa';

export const Orders = () => {
  const { orders, loading, fetchOrders, changeStatus } = useContext(OrderContext);
  const [filterStatus, setFilterStatus] = useState('all');
  const [riders, setRiders] = useState([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [verifiedItems, setVerifiedItems] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchOrders();
    const fetchRiders = async () => {
      const u = await getUsers();
      setRiders(u.filter(x => x.role === 'rider'));
    };
    fetchRiders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await changeStatus(orderId, newStatus);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAssignRider = async (orderId, riderId) => {
    if (!riderId) return;
    try {
      await changeStatus(orderId, 'dispatched', riderId);
    } catch (err) {
      alert(err.message);
    }
  };

  const toggleSelectOrder = (orderId) => {
    setSelectedOrderIds(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const toggleVerifyItem = (orderId, itemId) => {
    const key = `${orderId}_${itemId}`;
    setVerifiedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const isOrderItemsVerified = (order) => {
    if (!['accepted', 'preparing'].includes(order.status)) return true;
    if (!order.items || order.items.length === 0) return true;
    return order.items.every(item => verifiedItems[`${order.id}_${item.id || item.name}`]);
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (selectedOrderIds.length === 0) return;
    
    if (newStatus === 'dispatched') {
      const unverified = selectedOrderIds.filter(id => {
        const order = orders.find(o => o.id === id);
        return order && !isOrderItemsVerified(order);
      });
      if (unverified.length > 0) {
        alert("Some selected orders have unverified items. Please verify all items before bulk dispatching.");
        return;
      }
    }

    try {
      let count = 0;
      for (const orderId of selectedOrderIds) {
        await changeStatus(orderId, newStatus);
        count++;
      }
      setSelectedOrderIds([]);
      fetchOrders();
    } catch (err) {
      alert("Error updating bulk orders: " + err.message);
    }
  };

  const handleCopyId = (orderId) => {
    navigator.clipboard.writeText(orderId);
    setCopiedId(orderId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handlePrintLabel = (order, item) => {
    const printWindow = window.open('', '_blank', 'width=450,height=300');
    if (!printWindow) {
      alert("Please allow popups to print labels.");
      return;
    }

    const now = new Date();
    const packingDate = now.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const packingTime = now.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const itemPrice = item.price ? `₹${item.price * (item.quantity || 1)}` : 'N/A';

    const labelHtml = `
      <html>
        <head>
          <title>Print Label - ${item.name}</title>
          <style>
            @page {
              size: 80mm 50mm;
              margin: 0;
            }
            body {
              font-family: 'Courier New', Courier, monospace;
              width: 80mm;
              height: 50mm;
              padding: 3mm 4mm;
              box-sizing: border-box;
              margin: 0;
              background-color: #fff;
              color: #000;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
            }
            .header {
              text-align: center;
              font-size: 13px;
              font-weight: 1000;
              border-bottom: 1.5px dashed #000;
              padding-bottom: 2px;
              margin-bottom: 3px;
            }
            .product-name {
              font-size: 13px;
              font-weight: 1000;
              margin: 2px 0;
              word-wrap: break-word;
              text-transform: uppercase;
              line-height: 1.2;
            }
            .details {
              font-size: 10.5px;
              line-height: 1.25;
            }
            .row {
              display: flex;
              justify-content: space-between;
            }
            .footer {
              border-top: 1.5px dashed #000;
              padding-top: 2.5px;
              margin-top: 3.5px;
              font-size: 11.5px;
              text-align: center;
              font-weight: 1000;
            }
            .bold {
              font-weight: 1000;
            }
          </style>
        </head>
        <body>
          <div class="header">MANA WARANGAL FOODS</div>
          <div class="product-name">${item.name}</div>
          <div class="details">
            <div class="row">
              <span>CUSTOMER:</span>
              <span class="bold">${(order.customerName || 'N/A').toUpperCase()}</span>
            </div>
            <div class="row">
              <span>WEIGHT:</span>
              <span class="bold">${(item.weight || '1 PACK').toUpperCase()}</span>
            </div>
            <div class="row">
              <span>PRICE:</span>
              <span class="bold">${itemPrice}</span>
            </div>
            <div class="row">
              <span>ORDER ID:</span>
              <span class="bold">#${order.id.slice(-8).toUpperCase()}</span>
            </div>
          </div>
          <div class="footer">
            PACKED: ${packingDate} ${packingTime}
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(labelHtml);
    printWindow.document.close();
  };

  const handleExportCSV = () => {
    const exportOrders = orders.filter(order => order.status !== 'pending_payment');
    if (exportOrders.length === 0) {
      alert("No orders to export.");
      return;
    }

    const headers = [
      "Order ID",
      "Customer Name",
      "Customer Phone",
      "Address",
      "Total Amount",
      "Status",
      "Payment Method",
      "Payment Status",
      "Created At"
    ];

    const csvRows = [
      headers.join(","),
      ...exportOrders.map(order => [
        `"${order.id}"`,
        `"${(order.customerName || '').replace(/"/g, '""')}"`,
        `"${(order.customerPhone || '').replace(/"/g, '""')}"`,
        `"${(order.address || '').replace(/"/g, '""')}"`,
        order.total,
        `"${order.status}"`,
        `"${order.paymentMethod || ''}"`,
        `"${order.paymentStatus || ''}"`,
        `"${order.createdAt || ''}"`
      ].join(","))
    ];

    const blob = new Blob([csvRows.join("\n")], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sort orders descending by createdAt/created_at to make sure new orders appear on top
  const sortedOrders = [...orders].sort((a, b) => {
    return new Date(b.createdAt || b.created_at || 0) - new Date(a.createdAt || a.created_at || 0);
  });

  const filteredOrders = sortedOrders.filter(
    (order) => (filterStatus === 'all' || order.status === filterStatus) && order.status !== 'pending_payment'
  );

  const getStatusCount = (status) => {
    if (status === 'all') {
      return orders.filter(o => o.status !== 'pending_payment').length;
    }
    return orders.filter(o => o.status === status).length;
  };

  const getStatusBadgeStyles = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'accepted':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'preparing':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'dispatched':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'picked_up':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'delivered':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-neutral-light text-neutral-dark border-neutral-border';
    }
  };

  return (
    <div className="flex-1 bg-neutral-light px-4 py-6 flex flex-col gap-5 pb-20 text-left">
      
      {/* Header Panel */}
      <div className="bg-white p-5 rounded-3xl border border-neutral-border flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 h-1.5 w-full bg-[#8B0000]"></div>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-extrabold text-neutral-dark tracking-tight">Order Dashboard</h2>
            {selectedOrderIds.length > 0 ? (
              <span className="px-2.5 py-0.5 bg-[#8B0000]/10 border border-[#8B0000]/20 text-[#8B0000] text-[10px] font-black rounded-full animate-pulse">
                {selectedOrderIds.length} Selected
              </span>
            ) : (
              <span className="px-2.5 py-0.5 bg-neutral-dark/5 border border-neutral-dark/10 text-neutral-dark/50 text-[10px] font-bold rounded-full">
                0 Selected
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-dark/55 font-semibold mt-0.5">Track, manage, and dispatch orders chronologically</p>
        </div>
        
        <div className="flex gap-2.5 items-center sm:self-center">
          {filteredOrders.length > 0 && (
            <button
              onClick={() => {
                const allFilteredIds = filteredOrders.map(o => o.id);
                const allSelected = allFilteredIds.every(id => selectedOrderIds.includes(id));
                if (allSelected) {
                  setSelectedOrderIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
                } else {
                  setSelectedOrderIds(prev => [...new Set([...prev, ...allFilteredIds])]);
                }
              }}
              className="px-4 py-2 bg-neutral-light hover:bg-neutral-border/30 border border-neutral-border text-neutral-dark rounded-xl text-[10.5px] font-black uppercase transition-all duration-200 cursor-pointer flex items-center gap-1.5"
            >
              {filteredOrders.every(o => selectedOrderIds.includes(o.id)) ? 'Deselect All' : 'Select Page'}
            </button>
          )}
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-[#8B0000] hover:bg-[#6B0000] text-white rounded-xl text-[10.5px] font-extrabold uppercase tracking-wider transition-all duration-200 shadow-md shadow-[#8B0000]/10 hover:shadow-lg active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <FaDownload /> Export CSV
          </button>
        </div>
      </div>

      {/* Bulk Action Panel */}
      {selectedOrderIds.length > 0 && (
        <div className="bg-[#8B0000]/5 border border-[#8B0000]/15 p-4 rounded-2xl flex flex-col md:flex-row gap-3 justify-between md:items-center text-xs font-bold text-neutral-dark animate-fade-in">
          <div className="flex flex-col">
            <span className="text-[#8B0000] font-black text-sm">{selectedOrderIds.length} Order(s) Selected</span>
            <span className="text-[10px] text-neutral-dark/50 mt-0.5">Apply bulk status to checked orders</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleBulkStatusChange('accepted')}
              className="px-3.5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              Bulk Accept
            </button>
            <button
              onClick={() => handleBulkStatusChange('preparing')}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              Bulk Prepare
            </button>
            <button
              onClick={() => handleBulkStatusChange('dispatched')}
              className="px-3.5 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              Bulk Dispatch
            </button>
            <button
              onClick={() => setSelectedOrderIds([])}
              className="px-3.5 py-2 bg-neutral-light border border-neutral-border text-neutral-dark rounded-xl text-[10px] font-extrabold uppercase transition-all hover:bg-neutral-border/30 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {['all', 'pending', 'accepted', 'preparing', 'dispatched', 'picked_up', 'delivered', 'cancelled'].map((tab) => {
          const count = getStatusCount(tab);
          const isSelected = filterStatus === tab;
          return (
            <button
              key={tab}
              onClick={() => setFilterStatus(tab)}
              className={`
                px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 cursor-pointer
                ${isSelected 
                  ? 'bg-neutral-dark border-neutral-dark text-white shadow-md' 
                  : 'bg-white border-neutral-border text-neutral-dark/85 hover:border-neutral-dark/30 hover:bg-neutral-light'}
              `}
            >
              <span>{tab.replace('_', ' ')}</span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] ${
                isSelected ? 'bg-white/20 text-white' : 'bg-neutral-light text-neutral-dark/60 font-bold'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Order Cards List */}
      {loading && orders.length === 0 ? (
        <Loader />
      ) : filteredOrders.length === 0 ? (
        <div className="p-16 bg-white border border-neutral-border rounded-3xl text-center flex flex-col items-center justify-center gap-3">
          <FaInbox className="text-3xl text-neutral-dark/20" />
          <h4 className="text-sm font-bold text-neutral-dark/50">No orders found</h4>
          <p className="text-[10px] text-neutral-dark/40 font-semibold -mt-1.5">There are no orders matching status "{filterStatus.replace('_', ' ')}"</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredOrders.map((order) => {
            const isSelected = selectedOrderIds.includes(order.id);
            const verified = isOrderItemsVerified(order);
            const orderDateStr = (order.createdAt || order.created_at) ? formatDate(order.createdAt || order.created_at) : 'Date unavailable';
            
            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl border transition-all duration-300 flex flex-col overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 ${
                  isSelected ? 'border-[#8B0000] ring-2 ring-[#8B0000]/5 bg-[#8B0000]/[0.015]' : 'border-neutral-border'
                }`}
              >
                {/* Card Top Header */}
                <div className="flex justify-between items-center px-4 py-3.5 border-b border-neutral-border/60 bg-neutral-light/10">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectOrder(order.id)}
                      className="w-4.5 h-4.5 rounded text-primary focus:ring-primary border-neutral-border accent-primary cursor-pointer transition-all hover:scale-105"
                    />
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-neutral-dark uppercase tracking-wide">
                          ID: {order.id.slice(-8).toUpperCase()}
                        </span>
                        <button
                          onClick={() => handleCopyId(order.id)}
                          className="text-neutral-dark/40 hover:text-[#8B0000] transition-colors"
                          title="Copy Full ID"
                        >
                          {copiedId === order.id ? (
                            <span className="text-[9px] font-black text-green-600">Copied!</span>
                          ) : (
                            <FaRegCopy className="text-[10px]" />
                          )}
                        </button>
                      </div>
                      <span className="text-[9px] text-neutral-dark/45 font-bold mt-0.5">{orderDateStr}</span>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-full border tracking-wider flex items-center gap-1.5 ${getStatusBadgeStyles(order.status)}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-4 flex flex-col gap-3.5">
                  {/* Customer Card */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-semibold text-neutral-dark/80">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] text-neutral-dark/45 font-bold uppercase tracking-wider block">Customer info</span>
                      <div className="flex flex-col gap-1 bg-neutral-light/30 border border-neutral-border/40 p-3 rounded-2xl">
                        <div className="flex items-center gap-1.5 text-neutral-dark font-extrabold text-xs">
                          <FaUser className="text-[10px] text-neutral-dark/40" />
                          {order.customerName}
                        </div>
                        <a href={`tel:${order.customerPhone}`} className="flex items-center gap-1.5 text-[#8B0000] font-bold text-xs hover:underline mt-0.5">
                          <FaPhoneAlt className="text-[10px]" />
                          {order.customerPhone}
                        </a>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <span className="text-[9px] text-neutral-dark/45 font-bold uppercase tracking-wider block">Delivery Destination</span>
                      <div className="flex gap-2 items-start bg-neutral-light/30 border border-neutral-border/40 p-3 rounded-2xl min-h-[58px]">
                        <FaMapMarkerAlt className="text-[#8B0000] text-xs mt-0.5 flex-shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-neutral-dark leading-snug text-[11px] truncate-3-lines">{order.address}</span>
                          {order.landmark && (
                            <span className="text-[10px] text-neutral-dark/55 mt-0.5 font-bold">Landmark: {order.landmark}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Items list card */}
                  <div className="p-3 bg-neutral-light/35 border border-neutral-border/50 rounded-2xl flex flex-col gap-2.5">
                    <div className="flex justify-between items-center border-b border-neutral-border/40 pb-2 mb-0.5">
                      <span className="text-[9.5px] font-black text-neutral-dark/45 uppercase tracking-wider flex items-center gap-1">
                        <FaClipboardList className="text-[10px]" />
                        Items to Pack
                      </span>
                      {['accepted', 'preparing'].includes(order.status) && (
                        <span className={`text-[9.5px] font-extrabold ${verified ? 'text-green-600' : 'text-[#8B0000] animate-pulse'}`}>
                          {verified ? '✓ Verification complete' : '⚠️ Verify items to assign rider'}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {order.items?.map((item) => {
                        const itemId = item.id || item.name;
                        const isChecked = !!verifiedItems[`${order.id}_${itemId}`];
                        const canVerify = ['accepted', 'preparing'].includes(order.status);
                        
                        return (
                          <div key={itemId} className="flex justify-between items-center text-xs font-bold text-neutral-dark">
                            <div className="flex items-center gap-2.5">
                              {canVerify ? (
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => toggleVerifyItem(order.id, itemId)}
                                  className="w-4 h-4 rounded text-[#8B0000] focus:ring-[#8B0000] border-neutral-border accent-[#8B0000] cursor-pointer transition-all hover:scale-110"
                                />
                              ) : (
                                <span className="w-1.5 h-1.5 rounded-full bg-neutral-dark/30" />
                              )}
                              <span className={`${isChecked && canVerify ? 'line-through opacity-55 text-neutral-dark/65' : ''} flex flex-col items-start`}>
                                <span>{item.name} <span className="opacity-55 text-[10px] ml-1 font-extrabold">x{item.quantity}</span></span>
                                {item.cuttingType && (
                                  <span className="text-[9px] text-[#8B0000] font-black uppercase mt-0.5">
                                    ✂️ {item.cuttingType}
                                  </span>
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-neutral-dark/60 text-[10px] font-semibold">{item.weight || '1 Pack'}</span>
                              <button
                                onClick={() => handlePrintLabel(order, item)}
                                className="px-2 py-0.5 bg-neutral-light hover:bg-[#8B0000]/10 hover:text-[#8B0000] border border-neutral-border text-neutral-dark/70 rounded-md text-[9px] font-black uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1 active:scale-95"
                                title="Print Label"
                              >
                                🖨️ Label
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Rider Assignment and Action Controls */}
                  <div className="flex flex-col gap-3 pt-2 border-t border-neutral-border/55">
                    
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-neutral-dark/45 font-bold uppercase text-[9px] tracking-wider">Payment details</span>
                      <span className="text-xs font-black text-neutral-dark">{formatPrice(order.total)}</span>
                    </div>

                    {/* Assign Rider selector */}
                    {['accepted', 'preparing'].includes(order.status) && riders.length > 0 && (
                      <div className="flex flex-col gap-1 p-3 bg-[#8B0000]/[0.01] border border-neutral-border/55 rounded-2xl">
                        <label className="text-[9.5px] font-black text-neutral-dark/55 uppercase tracking-wide leading-none flex justify-between items-center">
                          <span>Assign Delivery Partner</span>
                          {!verified && <span className="text-[#8B0000] font-black text-[8.5px] animate-pulse">Items Verification Needed</span>}
                        </label>
                        <select
                          onChange={(e) => handleAssignRider(order.id, e.target.value)}
                          disabled={!verified}
                          defaultValue=""
                          className="w-full mt-1.5 px-3 py-2 rounded-xl border border-neutral-border bg-white text-xs font-bold text-neutral-dark outline-none focus:border-[#8B0000] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          <option value="" disabled>Select delivery rider...</option>
                          {riders.map((r) => (
                            <option key={r.uid} value={r.uid}>
                              🛵 {r.fullName} ({r.phone || 'No phone'})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Main workflow transitions */}
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'accepted')}
                          className="py-2.5 px-2 bg-green-600 hover:bg-green-700 text-white text-[10px] font-black rounded-xl uppercase tracking-wider transition-all active:scale-95 shadow-sm hover:shadow flex justify-center items-center gap-1 cursor-pointer"
                        >
                          <FaCheck /> Accept
                        </button>
                      )}
                      {order.status === 'accepted' && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'preparing')}
                          className="py-2.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black rounded-xl uppercase tracking-wider transition-all active:scale-95 shadow-sm hover:shadow flex justify-center items-center gap-1 cursor-pointer"
                        >
                          <FaUtensils /> Prepare Cut
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'dispatched')}
                          disabled={!verified}
                          className="py-2.5 px-2 bg-pink-600 hover:bg-pink-700 disabled:bg-neutral-border text-white text-[10px] font-black rounded-xl uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed shadow-sm hover:shadow flex justify-center items-center gap-1 cursor-pointer"
                        >
                          <FaTruck /> Dispatch
                        </button>
                      )}
                      {['pending', 'accepted', 'preparing'].includes(order.status) && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'cancelled')}
                          className="py-2.5 px-2 bg-red-50 hover:bg-red-100 border border-red-200 text-[#8B0000] text-[10px] font-black rounded-xl uppercase tracking-wider transition-all hover:border-red-300 col-start-3 flex justify-center items-center gap-1 cursor-pointer"
                        >
                          <FaTimes /> Cancel
                        </button>
                      )}
                      {order.status === 'dispatched' && (
                        <div className="col-span-3 p-3 bg-blue-50/50 border border-blue-200 text-xs text-center text-blue-800 rounded-2xl font-bold flex justify-center items-center gap-1.5 animate-pulse">
                          <FaTruck className="text-blue-600" />
                          <span>Dispatched — Awaiting pickup by rider</span>
                        </div>
                      )}
                      {order.status === 'picked_up' && (
                        <div className="col-span-3 p-3 bg-amber-50/50 border border-amber-200 text-xs text-center text-amber-800 rounded-2xl font-bold flex justify-center items-center gap-1.5">
                          <FaMotorcycle className="text-amber-600 animate-bounce" />
                          <span>Out for Delivery — Rider in transit</span>
                        </div>
                      )}
                      {order.status === 'delivered' && (
                        <div className="col-span-3 p-3 bg-green-50/50 border border-green-200 text-xs text-center text-green-800 rounded-2xl font-bold flex justify-center items-center gap-1.5">
                          <FaCheckCircle className="text-green-600" />
                          <span>Order Completed successfully</span>
                        </div>
                      )}
                      {order.status === 'cancelled' && (
                        <div className="col-span-3 p-3 bg-red-50/50 border border-red-200 text-xs text-center text-red-800 rounded-2xl font-bold flex justify-center items-center gap-1.5">
                          <FaTimes className="text-red-600" />
                          <span>Order Cancelled</span>
                        </div>
                      )}
                    </div>

                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default Orders;
