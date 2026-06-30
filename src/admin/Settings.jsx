import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getStoreConfigDb, saveStoreConfigDb } from '../firebase/database';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { FaCog, FaCheckCircle } from 'react-icons/fa';

export const Settings = () => {
  const { currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'super_admin';

  const [config, setConfig] = useState({
    minOrder: 150,
    deliveryFee: 30,
    storeStatus: 'open',
    deliveryRadius: 15,
    maintenanceMode: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadConfig = async () => {
      setLoading(true);
      try {
        const data = await getStoreConfigDb();
        setConfig(data);
      } catch (err) {
        console.error('Failed to load config:', err);
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveStoreConfigDb(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Failed to save settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-neutral-light px-4 py-5 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-neutral-light px-4 py-5 flex flex-col gap-4 pb-20 text-left">
      <div>
        <h2 className="text-lg font-bold text-neutral-dark flex items-center gap-2">
          <FaCog className="text-primary" /> Store Settings
        </h2>
        <p className="text-[10px] text-neutral-dark/50 font-semibold mt-0.5">
          {isSuperAdmin ? 'Full system configuration • Super Admin' : 'Configure store parameters'}
        </p>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 animate-pulse">
          <FaCheckCircle /> Settings saved to Firestore successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-4">
        {/* Store Operations */}
        <div className="bg-white p-5 rounded-3xl border border-neutral-border flex flex-col gap-4 shadow-xs">
          <h4 className="text-[10px] font-bold text-neutral-dark/40 uppercase tracking-wider">Store Operations</h4>
          
          <Input
            label="Minimum Order Value (₹)"
            type="number"
            value={config.minOrder}
            onChange={(e) => setConfig({ ...config, minOrder: Number(e.target.value) })}
          />

          <Input
            label="Standard Delivery Fee (₹)"
            type="number"
            value={config.deliveryFee}
            onChange={(e) => setConfig({ ...config, deliveryFee: Number(e.target.value) })}
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-neutral-dark opacity-85">Store Status</label>
            <select
              value={config.storeStatus}
              onChange={(e) => setConfig({ ...config, storeStatus: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-neutral-border bg-neutral-light transition-all outline-none focus:border-primary focus:bg-white text-sm font-semibold"
            >
              <option value="open">🟢 Accepting Orders (Open)</option>
              <option value="closed">🔴 Temporarily Offline (Closed)</option>
            </select>
          </div>
        </div>

        {/* Super Admin Only Settings */}
        {isSuperAdmin && (
          <div className="bg-white p-5 rounded-3xl border border-red-100 flex flex-col gap-4 shadow-xs">
            <div className="flex items-center gap-2">
              <h4 className="text-[10px] font-bold text-red-700/60 uppercase tracking-wider">Super Admin Settings</h4>
              <span className="text-[8px] px-1.5 py-0.5 bg-red-50 text-red-600 border border-red-200 rounded-full font-bold">RESTRICTED</span>
            </div>

            <Input
              label="Delivery Radius (km)"
              type="number"
              value={config.deliveryRadius}
              onChange={(e) => setConfig({ ...config, deliveryRadius: Number(e.target.value) })}
            />

            <div className="flex items-center justify-between p-3 bg-neutral-light rounded-xl border border-neutral-border">
              <div>
                <span className="text-sm font-semibold text-neutral-dark">Maintenance Mode</span>
                <p className="text-[10px] text-neutral-dark/50 font-semibold mt-0.5">Disables ordering for all customers</p>
              </div>
              <button
                type="button"
                onClick={() => setConfig({ ...config, maintenanceMode: !config.maintenanceMode })}
                className={`w-12 h-6 rounded-full border transition-all relative ${
                  config.maintenanceMode 
                    ? 'bg-red-500 border-red-500' 
                    : 'bg-neutral-border border-neutral-border'
                }`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${
                  config.maintenanceMode ? 'left-[26px]' : 'left-0.5'
                }`} />
              </button>
            </div>
          </div>
        )}

        <Button type="submit" disabled={saving} className="w-full">
          {saving ? 'Saving...' : '💾 Save Configurations'}
        </Button>
      </form>
    </div>
  );
};
export default Settings;
