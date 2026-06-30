import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  subscribeToMedicineOrdersDb, 
  updateMedicineOrderStatusDb 
} from '../firebase/database';
import { getUsers } from '../services/userService';
import { updateOrderFields } from '../services/orderService';
import { formatDate } from '../utils/helpers';
import { 
  FaArrowLeft, 
  FaCapsules, 
  FaCheck, 
  FaTimes, 
  FaClipboardList, 
  FaUser, 
  FaPhoneAlt, 
  FaFileMedical, 
  FaExclamationTriangle,
  FaFileAlt,
  FaCheckCircle,
  FaTruck,
  FaBoxes
} from 'react-icons/fa';

export const Medicines = () => {
  const navigate = useNavigate();
  const [medicineOrders, setMedicineOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);
  const [riders, setRiders] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToMedicineOrdersDb((orders) => {
      setMedicineOrders(orders);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchRiders = async () => {
      try {
        const allUsers = await getUsers();
        setRiders(allUsers.filter(u => u.role === 'rider'));
      } catch (err) {
        console.error('Error fetching riders:', err);
      }
    };
    fetchRiders();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateMedicineOrderStatusDb(id, newStatus);
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  const handleAssignRider = async (orderId, riderId) => {
    if (!riderId) return;
    const selectedRider = riders.find(r => r.uid === riderId);
    try {
      await updateOrderFields(orderId, {
        riderId,
        riderName: selectedRider?.fullName || '',
        riderPhone: selectedRider?.phone || ''
      });
      alert('Rider assigned successfully!');
    } catch (err) {
      alert('Error assigning rider: ' + err.message);
    }
  };

  const getStatusCount = (status) => {
    if (status === 'all') return medicineOrders.length;
    return medicineOrders.filter(o => o.status === status).length;
  };

  const sortedOrders = useMemo(() => {
    return [...medicineOrders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [medicineOrders]);

  const filteredOrders = useMemo(() => {
    return sortedOrders.filter(o => filterStatus === 'all' || o.status === filterStatus);
  }, [sortedOrders, filterStatus]);

  const getStatusBadgeStyles = (status) => {
    switch (status) {
      case 'pending_review':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'approved':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'packed':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'dispatched':
        return 'bg-pink-50 text-pink-700 border-pink-200';
      case 'delivered':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
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
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/admin')}
            className="p-2 bg-neutral-light hover:bg-neutral-border/20 border border-neutral-border rounded-xl active:scale-95 transition-all text-neutral-dark cursor-pointer"
            title="Back to Dashboard"
          >
            <FaArrowLeft className="text-xs" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <FaCapsules className="text-[#8B0000] text-sm animate-pulse" />
              <h2 className="text-lg font-extrabold text-neutral-dark tracking-tight">Medicine Requests</h2>
            </div>
            <p className="text-[10.5px] text-neutral-dark/55 font-semibold mt-0.5">Approve prescriptions and track deliveries in real-time</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {['all', 'pending_review', 'approved', 'packed', 'dispatched', 'delivered', 'rejected'].map((tab) => {
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

      {/* Requests List */}
      {loading ? (
        <div className="p-16 text-center text-xs font-semibold text-neutral-dark/40">Loading requests...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-16 bg-white border border-neutral-border rounded-3xl text-center flex flex-col items-center justify-center gap-3">
          <FaClipboardList className="text-3xl text-neutral-dark/20" />
          <h4 className="text-sm font-bold text-neutral-dark/50">No requests found</h4>
          <p className="text-[10px] text-neutral-dark/40 font-semibold -mt-1.5">There are no medicine orders matching status "{filterStatus.replace('_', ' ')}"</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredOrders.map((order) => {
            const orderDateStr = order.createdAt ? formatDate(order.createdAt) : 'Date unavailable';
            
            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-neutral-border transition-all duration-300 flex flex-col overflow-hidden shadow-xs hover:shadow-md"
              >
                {/* Header info */}
                <div className="flex justify-between items-center px-4 py-3 border-b border-neutral-border/60 bg-neutral-light/10">
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-neutral-dark uppercase tracking-wide">
                      ID: {order.id.slice(-8).toUpperCase()}
                    </span>
                    <span className="text-[9px] text-neutral-dark/45 font-bold mt-0.5">{orderDateStr}</span>
                  </div>
                  
                  {/* Status Badge */}
                  <span className={`px-3 py-1 text-[9px] font-black uppercase rounded-full border tracking-wider flex items-center gap-1.5 ${getStatusBadgeStyles(order.status)}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-4 flex flex-col md:flex-row gap-4">
                  {/* Prescription Image / Placeholder */}
                  {order.prescriptionUrl ? (
                    <div 
                      className="relative group cursor-pointer w-24 h-24 rounded-2xl overflow-hidden border border-neutral-border bg-neutral-light flex-shrink-0 mx-auto md:mx-0 shadow-xs" 
                      onClick={() => setSelectedImage(order.prescriptionUrl)}
                    >
                      <img 
                        src={order.prescriptionUrl} 
                        alt="Prescription" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300" 
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-black uppercase">
                        View Rx
                      </div>
                    </div>
                  ) : (
                    <div className="w-24 h-24 rounded-2xl border border-neutral-border border-dashed bg-neutral-light flex flex-col items-center justify-center gap-1 flex-shrink-0 mx-auto md:mx-0 text-neutral-dark/30">
                      <FaFileMedical className="text-2xl" />
                      <span className="text-[9px] font-bold">List Only</span>
                    </div>
                  )}

                  {/* Details */}
                  <div className="flex-1 flex flex-col gap-3 text-left">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-neutral-dark/80">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-neutral-dark/45 font-bold uppercase tracking-wider">Patient Details</span>
                        <div className="flex items-center gap-1.5 text-neutral-dark font-extrabold">
                          <FaUser className="text-[10px] text-neutral-dark/40" />
                          {order.patientName}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] text-neutral-dark/45 font-bold uppercase tracking-wider">Contact</span>
                        <a href={`tel:${order.phone}`} className="flex items-center gap-1.5 text-[#8B0000] font-extrabold hover:underline">
                          <FaPhoneAlt className="text-[10px]" />
                          {order.phone}
                        </a>
                      </div>
                    </div>

                    {/* Assigned Rider Indicator */}
                    {order.riderName && (
                      <div className="text-[10px] font-extrabold text-teal-700 bg-teal-50 border border-teal-200/50 px-3 py-1.5 rounded-2xl w-fit flex items-center gap-1.5">
                        <span>🛵 Assigned Partner: <strong>{order.riderName}</strong> ({order.riderPhone})</span>
                      </div>
                    )}

                    {/* Medicine List */}
                    {order.medicineList && (
                      <div className="p-3 bg-neutral-light/50 border border-neutral-border/40 rounded-2xl">
                        <span className="text-[9px] text-neutral-dark/45 font-bold uppercase tracking-wider block mb-1">Medicine List</span>
                        <p className="text-xs text-neutral-dark/85 font-semibold whitespace-pre-line leading-relaxed">
                          {order.medicineList}
                        </p>
                      </div>
                    )}

                    {/* Actions panel */}
                    <div className="flex flex-wrap gap-3 pt-2 border-t border-neutral-border/40 mt-1 items-end">
                      
                      {/* Assign Rider selector */}
                      {['approved', 'packed'].includes(order.status) && riders.length > 0 && (
                        <div className="flex flex-col gap-1 p-3 bg-[#8B0000]/[0.01] border border-neutral-border/55 rounded-2xl w-full sm:w-[280px]">
                          <label className="text-[9.5px] font-black text-neutral-dark/55 uppercase tracking-wide leading-none">
                            Assign Delivery Partner
                          </label>
                          <select
                            onChange={(e) => handleAssignRider(order.id, e.target.value)}
                            value={order.riderId || ''}
                            className="w-full mt-1.5 px-3 py-2 rounded-xl border border-neutral-border bg-white text-xs font-bold text-neutral-dark outline-none focus:border-[#8B0000] transition-all"
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

                      <div className="flex gap-2">
                        {order.status === 'pending_review' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'approved')}
                              className="py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white text-[10px] font-black rounded-xl uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                            >
                              <FaCheck /> Approve Rx
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'rejected')}
                              className="py-2.5 px-4 bg-red-50 hover:bg-red-100 border border-red-200 text-[#8B0000] text-[10px] font-black rounded-xl uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                            >
                              <FaTimes /> Reject
                            </button>
                          </>
                        )}

                        {order.status === 'approved' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'packed')}
                              className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black rounded-xl uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                            >
                              <FaBoxes /> Pack medicines
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'rejected')}
                              className="py-2.5 px-4 bg-red-50 hover:bg-red-100 border border-red-200 text-[#8B0000] text-[10px] font-black rounded-xl uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                            >
                              <FaTimes /> Reject
                            </button>
                          </>
                        )}

                        {order.status === 'packed' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'dispatched')}
                            disabled={!order.riderId}
                            className="py-2.5 px-4 bg-pink-600 hover:bg-pink-700 disabled:bg-neutral-border text-white text-[10px] font-black rounded-xl uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                          >
                            <FaTruck /> Dispatch Order
                          </button>
                        )}

                        {order.status === 'dispatched' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, 'delivered')}
                            className="py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white text-[10px] font-black rounded-xl uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1 cursor-pointer"
                          >
                            <FaCheckCircle /> Mark Delivered
                          </button>
                        )}
                      </div>

                      {order.status === 'delivered' && (
                        <div className="text-[10px] font-black text-green-700 flex items-center gap-1">
                          <FaCheckCircle /> Request completed & delivered
                        </div>
                      )}

                      {order.status === 'rejected' && (
                        <div className="text-[10px] font-black text-red-600 flex items-center gap-1">
                          <FaExclamationTriangle /> Request Rejected
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

      {/* Prescription Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-dark/90 p-4 backdrop-blur-xs cursor-zoom-out"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-full max-h-full bg-white p-3 rounded-3xl overflow-hidden shadow-2xl flex flex-col items-center gap-3 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center w-full px-1">
              <span className="text-[10px] font-black text-neutral-dark/50 uppercase flex items-center gap-1">
                <FaFileAlt /> Prescription Viewer
              </span>
              <button 
                onClick={() => setSelectedImage(null)}
                className="p-1 rounded-full hover:bg-neutral-light text-neutral-dark/60 hover:text-neutral-dark transition-all cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>
            <img 
              src={selectedImage} 
              alt="Prescription Full" 
              className="max-w-[90vw] max-h-[75vh] object-contain rounded-2xl border border-neutral-border shadow-xs" 
            />
            <button 
              className="py-2.5 bg-[#8B0000] hover:bg-[#720000] text-white font-black text-xs rounded-xl w-full transition-colors cursor-pointer"
              onClick={() => setSelectedImage(null)}
            >
              Close Viewer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Medicines;
