import { useEffect, useState } from 'react';
import { useAdmin } from '../hooks/useAdmin';
import Loader from '../components/common/Loader';
import { FaMotorcycle, FaMapMarkerAlt, FaClock, FaSyncAlt } from 'react-icons/fa';

export const Riders = () => {
  const { riders, loading, fetchRiders, addRider } = useAdmin();
  const [refreshing, setRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    drivingLicense: '',
    aadharNumber: '',
    password: ''
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRiders();
  }, [fetchRiders]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRiders();
    setRefreshing(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const { fullName, phone, drivingLicense, aadharNumber, password } = formData;
    if (!fullName.trim()) return setErrorMsg('Full Name is required.');
    if (!phone.trim() || !/^\d{10}$/.test(phone)) return setErrorMsg('Please enter a valid 10-digit mobile number.');
    if (!drivingLicense.trim()) return setErrorMsg('Driving License is required.');
    if (!aadharNumber.trim() || !/^\d{12}$/.test(aadharNumber)) return setErrorMsg('Please enter a valid 12-digit Aadhaar number.');
    if (password && password.length < 6) return setErrorMsg('Password must be at least 6 characters.');

    setSubmitting(true);
    try {
      await addRider({ fullName, phone, drivingLicense, aadharNumber, password });
      setSuccessMsg('Rider registered successfully!');
      setFormData({ fullName: '', phone: '', drivingLicense: '', aadharNumber: '', password: '' });
      setTimeout(() => {
        setShowAddForm(false);
        setSuccessMsg('');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to add rider.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'idle':
        return (
          <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 animate-pulse-glow">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Online (Idle)
          </span>
        );
      case 'delivering':
        return (
          <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-600 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Busy (Transit)
          </span>
        );
      case 'offline':
      default:
        return (
          <span className="px-2.5 py-1 bg-neutral-light border border-neutral-border text-neutral-dark/50 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-dark/30"></span>
            Offline
          </span>
        );
    }
  };

  return (
    <div className="flex-1 bg-neutral-light px-4 py-5 flex flex-col gap-4 pb-20 text-left overflow-y-auto">
      
      {/* Dashboard Header Panel */}
      <div className="flex justify-between items-center bg-white p-4.5 rounded-[24px] border border-neutral-border shadow-xs">
        <div>
          <h2 className="text-base font-black text-neutral-dark">Delivery Partners</h2>
          <p className="text-[10px] text-neutral-dark/50 font-semibold mt-0.5">Track rider status, active shifts & GPS positions</p>
        </div>
        <div className="flex gap-2 items-center">
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="px-3 py-2 bg-[#8B0000] hover:bg-[#6b0000] text-white rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all shadow-md shadow-[#8B0000]/10 hover:shadow-lg active:scale-95 cursor-pointer"
            >
              Add Rider
            </button>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className={`p-2 bg-neutral-light hover:bg-neutral-border/40 text-neutral-dark rounded-xl transition-all border border-neutral-border/60 ${refreshing ? 'animate-spin' : ''}`}
          >
            <FaSyncAlt className="text-xs" />
          </button>
        </div>
      </div>

      {/* Add Rider Form Card */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-white p-5 rounded-[28px] border border-neutral-border shadow-sm flex flex-col gap-4 text-left animate-fade-in relative">
          <div className="absolute top-0 left-0 h-1.5 w-full bg-[#8B0000] rounded-t-[28px]"></div>
          <div>
            <h3 className="text-sm font-black text-neutral-dark flex items-center gap-2">
              <FaMotorcycle className="text-[#8B0000]" /> Add New Delivery Partner
            </h3>
            <p className="text-[10px] text-neutral-dark/50 font-semibold mt-0.5">Register a new rider profile and credentials</p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-primary text-xs font-bold rounded-2xl">
              ✕ {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold rounded-2xl">
              ✓ {successMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-neutral-dark/55 uppercase tracking-wide">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter Rider's Name"
                required
                className="px-3.5 py-2.5 rounded-xl border border-neutral-border bg-neutral-light/50 focus:bg-white text-xs font-bold text-neutral-dark outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-neutral-dark/55 uppercase tracking-wide">Mobile Number</label>
              <input
                type="tel"
                name="phone"
                maxLength={10}
                value={formData.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setFormData(prev => ({ ...prev, phone: val }));
                }}
                placeholder="10-Digit Mobile Number"
                required
                className="px-3.5 py-2.5 rounded-xl border border-neutral-border bg-neutral-light/50 focus:bg-white text-xs font-bold text-neutral-dark outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-neutral-dark/55 uppercase tracking-wide">Driving License Number</label>
              <input
                type="text"
                name="drivingLicense"
                value={formData.drivingLicense}
                onChange={handleInputChange}
                placeholder="Driving License (e.g. TS1234567)"
                required
                className="px-3.5 py-2.5 rounded-xl border border-neutral-border bg-neutral-light/50 focus:bg-white text-xs font-bold text-neutral-dark outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-neutral-dark/55 uppercase tracking-wide">Aadhaar Number</label>
              <input
                type="text"
                name="aadharNumber"
                maxLength={12}
                value={formData.aadharNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  setFormData(prev => ({ ...prev, aadharNumber: val }));
                }}
                placeholder="12-Digit Aadhaar Number"
                required
                className="px-3.5 py-2.5 rounded-xl border border-neutral-border bg-neutral-light/50 focus:bg-white text-xs font-bold text-neutral-dark outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-neutral-dark/55 uppercase tracking-wide">Password (For Direct Login)</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password (default: rider123)"
                className="px-3.5 py-2.5 rounded-xl border border-neutral-border bg-neutral-light/50 focus:bg-white text-xs font-bold text-neutral-dark outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>

          <div className="flex gap-2.5 justify-end mt-1.5">
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className="px-4 py-2.5 bg-neutral-light hover:bg-neutral-border/30 border border-neutral-border text-neutral-dark rounded-xl text-[10.5px] font-black uppercase transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2.5 bg-primary hover:bg-[#6b0000] text-white rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all shadow-md shadow-primary/10 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? 'Adding...' : 'Add Rider'}
            </button>
          </div>
        </form>
      )}

      {loading && riders.length === 0 ? (
        <Loader />
      ) : riders.length === 0 ? (
        <div className="p-8 bg-white border border-neutral-border rounded-[32px] text-center text-xs font-bold text-neutral-dark/40 shadow-xs flex flex-col items-center gap-2">
          <FaMotorcycle className="text-3xl opacity-20" />
          <span>No registered delivery riders found in DB.</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {riders.map((r) => {
            const hasLocation = r.latitude && r.longitude;
            const updatedTimeStr = r.updatedAt ? new Date(r.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
            
            return (
              <div 
                key={r.uid} 
                className="bg-white p-4.5 rounded-[28px] border border-neutral-border flex flex-col gap-3.5 shadow-sm transition-all hover:shadow-md relative overflow-hidden text-left"
              >
                <div className={`absolute top-0 left-0 w-1.5 h-full ${
                  r.status === 'idle' ? 'bg-emerald-500' :
                  r.status === 'delivering' ? 'bg-amber-500' :
                  'bg-neutral-dark/20'
                }`}></div>

                {/* Card Top Header */}
                <div className="flex justify-between items-start pl-1">
                  <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-2xl bg-neutral-light border border-neutral-border/60 flex items-center justify-center text-neutral-dark/60 text-base shadow-inner">
                      <FaMotorcycle />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h4 className="text-xs font-black text-neutral-dark truncate">{r.fullName}</h4>
                      <p className="text-[10px] text-neutral-dark/55 font-semibold mt-0.5">{r.phone || 'No phone number'}</p>
                    </div>
                  </div>
                  {getStatusBadge(r.status)}
                </div>

                {/* License & Aadhaar Details */}
                <div className="grid grid-cols-2 gap-2 text-[10.5px] text-neutral-dark/70 font-bold bg-neutral-light/25 p-3 rounded-2xl border border-neutral-border/40 ml-1">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-neutral-dark/45 uppercase tracking-wide">Driving License</span>
                    <span className="font-extrabold text-neutral-dark mt-0.5 truncate">{r.drivingLicense || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] font-bold text-neutral-dark/45 uppercase tracking-wide">Aadhaar Number</span>
                    <span className="font-extrabold text-neutral-dark mt-0.5 truncate">
                      {r.aadharNumber ? `XXXX XXXX ${r.aadharNumber.slice(-4)}` : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Live tracking block */}
                {r.status !== 'offline' && hasLocation ? (
                  <div className="bg-neutral-light/50 border border-neutral-border/40 p-3 rounded-2xl pl-4 text-xs font-semibold text-neutral-dark/80 flex flex-col gap-2">
                    <div className="flex items-start gap-2.5">
                      <FaMapMarkerAlt className="text-primary mt-0.5 shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="text-[8px] font-bold text-neutral-dark/40 uppercase">Last GPS Position</span>
                        <span className="text-[10.5px] font-extrabold text-neutral-dark mt-0.5">
                          {r.latitude.toFixed(5)}, {r.longitude.toFixed(5)}
                        </span>
                      </div>
                    </div>

                    {updatedTimeStr && (
                      <div className="flex items-center gap-1 text-[9px] text-neutral-dark/45 font-bold pl-5 border-t border-neutral-border/20 pt-1.5 mt-0.5">
                        <FaClock />
                        <span>Last pinged at {updatedTimeStr}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-neutral-light/30 border border-neutral-border/30 rounded-2xl pl-4 text-[10.5px] font-bold text-neutral-dark/40 text-center ml-1">
                    No active GPS tracker telemetry
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Riders;
