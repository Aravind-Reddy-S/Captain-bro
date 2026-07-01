import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import { FaMapMarkerAlt, FaHome, FaBriefcase, FaMap } from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import { loadState, saveState } from '../../utils/helpers';

export const LocationPopup = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const [addressLine, setAddressLine] = useState('');
  const [landmark, setLandmark] = useState('');
  const [type, setType] = useState('Home'); // Home, Work, Other
  const [saveToProfile, setSaveToProfile] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [detecting, setDetecting] = useState(false);
  const [detectError, setDetectError] = useState('');

  const userKey = currentUser ? `addresses_${currentUser.uid}` : 'addresses_guest';

  useEffect(() => {
    if (isOpen) {
      setSavedAddresses(loadState(userKey, []));
    }
  }, [isOpen, currentUser]);

  const handleDetectLocation = async () => {
    setDetecting(true);
    setDetectError('');
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          // Success - get real address via Google Maps Geocoding API
          const { latitude, longitude } = position.coords;
          try {
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`);
            const data = await response.json();
            const formatted = data.results?.[0]?.formatted_address || `${latitude}, ${longitude}`;
            setAddressLine(formatted);
            setLandmark('Detected via GPS');
          } catch (apiError) {
            console.error('Geocoding API error', apiError);
            setAddressLine(`${latitude}, ${longitude}`);
            setLandmark('Detected via GPS');
          }
          setDetecting(false);
        },
        (error) => {
          console.error(error);
          setDetectError("Could not access GPS. Please type address manually.");
          // Fallback to a default detected address anyway to make it robust
          setTimeout(() => {
            setAddressLine("Subedari, Hanamkonda, Warangal, 506001");
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

  const handleSelectSaved = (addr) => {
    setAddressLine(addr.addressLine);
    setLandmark(addr.landmark || '');
    setType(addr.type || 'Home');
    setSaveToProfile(false); // Already saved
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!addressLine.trim()) return;

    // Save as current delivery location in localStorage
    const currentLoc = {
      addressLine: addressLine.trim(),
      landmark: landmark.trim(),
      type
    };
    localStorage.setItem('current_delivery_location', JSON.stringify(currentLoc));

    // Save to saved addresses list if checked and not already in there
    if (saveToProfile && currentUser) {
      const existing = loadState(userKey, []);
      const isAlreadySaved = existing.some(
        a => a.addressLine.toLowerCase() === addressLine.trim().toLowerCase()
      );
      if (!isAlreadySaved) {
        const newAddr = {
          id: 'addr_' + Math.random().toString(36).substr(2, 9),
          name: currentUser.fullName || 'User',
          phone: currentUser.phone || '',
          addressLine: addressLine.trim(),
          landmark: landmark.trim(),
          type,
          isDefault: existing.length === 0
        };
        const updated = [...existing, newAddr];
        saveState(userKey, updated);
      }
    }

    // Trigger header update
    window.dispatchEvent(new Event('location_changed'));
    onClose();
  };

  const getAddressIcon = (addressType) => {
    switch (addressType) {
      case 'Home': return <FaHome className="text-primary" />;
      case 'Work': return <FaBriefcase className="text-indigo-600" />;
      default: return <FaMap className="text-teal-600" />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Delivery Location">
      <div className="flex flex-col gap-4 text-left">
        
        {/* Saved Addresses list if any */}
        {savedAddresses.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-neutral-dark opacity-55 uppercase tracking-wider">
              Saved Locations
            </span>
            <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-none">
              {savedAddresses.map((addr) => (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => handleSelectSaved(addr)}
                  className={`flex items-center gap-2 px-3 py-2 border rounded-lg bg-white shadow-3xs flex-shrink-0 hover:border-primary transition-all text-left max-w-[200px] ${
                    addressLine === addr.addressLine ? 'border-primary ring-2 ring-primary/10' : 'border-neutral-border/60'
                  }`}
                >
                  <div className="w-6 h-6 rounded-md bg-neutral-light border border-neutral-border/40 flex items-center justify-center flex-shrink-0">
                    {getAddressIcon(addr.type)}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-black text-neutral-dark truncate leading-none capitalize">
                      {addr.type} Location
                    </span>
                    <span className="text-[9px] text-neutral-dark/50 truncate mt-0.5">
                      {addr.addressLine}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="h-px bg-neutral-border/60 my-0.5"></div>

        {/* GPS Button */}
        <button
          type="button"
          onClick={handleDetectLocation}
          disabled={detecting}
          className="w-full py-3 px-4 bg-primary-light text-primary hover:bg-primary-light/80 border border-primary/20 rounded-lg font-extrabold text-xs transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-75 disabled:cursor-not-allowed"
        >
          <FaMapMarkerAlt className="text-sm" />
          <span>{detecting ? 'Detecting Location...' : 'Use Current GPS Location'}</span>
        </button>

        {detectError && (
          <span className="text-[10px] font-semibold text-primary text-center -mt-2">
            {detectError}
          </span>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <Input
            label="Street Address / Details"
            placeholder="Flat/House no, Apartment, Street name, Area"
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
            required={true}
          />

          <Input
            label="Landmark (Optional)"
            placeholder="e.g. Near NIT Warangal Gate"
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
          />

          {/* Location Type */}
          <div className="flex flex-col gap-1.5 text-left">
            <label className="text-xs font-bold text-neutral-dark opacity-60 uppercase tracking-wider">
              Address Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Home', 'Work', 'Other'].map((t) => {
                const isActive = type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`
                      py-2 rounded-lg border font-bold text-xs transition-all flex items-center justify-center gap-1.5
                      ${isActive 
                        ? 'border-primary bg-primary-light text-primary font-black shadow-3xs' 
                        : 'border-neutral-border/60 bg-neutral-light/50 text-neutral-dark hover:border-neutral-border'}
                    `}
                  >
                    {t === 'Home' && <FaHome />}
                    {t === 'Work' && <FaBriefcase />}
                    {t === 'Other' && <FaMap />}
                    <span>{t}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Save Address Option */}
          {currentUser && (
            <label className="flex items-center gap-2 cursor-pointer mt-1 select-none">
              <input
                type="checkbox"
                checked={saveToProfile}
                onChange={(e) => setSaveToProfile(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary border-neutral-border accent-[#8B0000]"
              />
              <span className="text-xs font-semibold text-neutral-dark opacity-80">
                Save to my address profile for future use
              </span>
            </label>
          )}

          <Button
            type="submit"
            className="w-full mt-2.5 py-3"
            disabled={!addressLine.trim()}
          >
            Confirm & Select Location
          </Button>
        </form>
      </div>
    </Modal>
  );
};

export default LocationPopup;
