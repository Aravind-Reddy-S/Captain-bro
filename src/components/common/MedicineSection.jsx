import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  FaUpload,
  FaCheckCircle,
  FaMotorcycle,
  FaShieldAlt,
  FaClock,
  FaTag,
  FaArrowRight,
  FaTimes,
  FaFileMedical,
  FaCapsules,
  FaFileAlt,
  FaExclamationTriangle
} from 'react-icons/fa';
import medicineBanner from '../../assets/images/medicine_banner.png';
import { 
  createMedicineOrderDb, 
  subscribeToMedicineOrderByIdDb,
  subscribeToOrderTrackingDb
} from '../../firebase/database';
import { uploadPrescriptionImage } from '../../firebase/storage';

const ROUTE_PATH = [
  { lat: 17.9689, lng: 79.5941 },
  { lat: 17.9730, lng: 79.5910 },
  { lat: 17.9780, lng: 79.5870 },
  { lat: 17.9830, lng: 79.5830 },
  { lat: 17.9880, lng: 79.5790 },
  { lat: 17.9920, lng: 79.5750 },
  { lat: 17.9960, lng: 79.5710 },
  { lat: 18.0000, lng: 79.5680 },
  { lat: 18.0040, lng: 79.5650 },
  { lat: 18.0076, lng: 79.5623 }
];

export const MedicineSection = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [phone, setPhone] = useState('');
  const [prescription, setPrescription] = useState(null);
  const [medicineList, setMedicineList] = useState('');
  const [orderStep, setOrderStep] = useState(0); // 0: Form, 1: Stepper, 2: Confirmed, 3: Rejected
  const [subStep, setSubStep] = useState(0); // 0: Uploading, 1: Pharmacist Approving, 2: Packing, 3: Dispatched
  const [countdown, setCountdown] = useState(900); // 15 mins in seconds
  const [isDragging, setIsDragging] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [riderLocation, setRiderLocation] = useState(null);

  const fileInputRef = useRef(null);

  // Real-time listener for active medicine order
  useEffect(() => {
    if (!activeOrderId) {
      setActiveOrder(null);
      return;
    }
    const unsubscribe = subscribeToMedicineOrderByIdDb(activeOrderId, (order) => {
      setActiveOrder(order);
      // Map statuses:
      // 'pending_review' -> step 1, subStep 0/1 (Uploading details / review)
      // 'approved' -> step 1, subStep 1/2 (Pharmacist Approved / Packing)
      // 'packed' -> step 1, subStep 2/3 (Medicines Sealed & Checked / Dispatching)
      // 'dispatched' -> step 2 (Out for delivery!)
      // 'picked_up' -> step 2 (Out for delivery / Rider picked up)
      // 'delivered' -> step 2 (Delivered)
      // 'rejected' -> step 3 (Rejected by pharmacist)
      if (order.status === 'pending_review') {
        setOrderStep(1);
        setSubStep(0);
      } else if (order.status === 'approved') {
        setOrderStep(1);
        setSubStep(1);
      } else if (order.status === 'packed') {
        setOrderStep(1);
        setSubStep(2);
      } else if (order.status === 'dispatched' || order.status === 'picked_up') {
        setOrderStep(2);
      } else if (order.status === 'delivered') {
        setOrderStep(2);
      } else if (order.status === 'rejected') {
        setOrderStep(3);
      }
    });
    return () => unsubscribe();
  }, [activeOrderId]);

  // Subscribe to tracking coordinates for real-time scooter mapping
  useEffect(() => {
    if (!activeOrderId || orderStep !== 2) {
      setRiderLocation(null);
      return;
    }
    const unsubscribe = subscribeToOrderTrackingDb(activeOrderId, (tracking) => {
      if (tracking?.coordinates) {
        setRiderLocation(tracking.coordinates);
      }
    });
    return () => unsubscribe();
  }, [activeOrderId, orderStep]);

  // Compute live scooter left offset percentage
  const progressPercent = useMemo(() => {
    if (activeOrder?.status === 'delivered') return 88;
    if (!riderLocation) return 45;
    const idx = ROUTE_PATH.findIndex(p => 
      Math.abs(p.lat - riderLocation.latitude) < 0.001 && 
      Math.abs(p.lng - riderLocation.longitude) < 0.001
    );
    if (idx === -1) return 45;
    return Math.round((idx / (ROUTE_PATH.length - 1)) * 88);
  }, [riderLocation, activeOrder]);

  // Countdown timer for delivery
  useEffect(() => {
    let interval = null;
    if (orderStep === 2 && activeOrder?.status === 'dispatched' && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [orderStep, countdown, activeOrder]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setPrescription(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPrescription(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientName || !phone) {
      alert('Please fill in the Patient Name and Phone Number.');
      return;
    }
    if (!prescription && !medicineList.trim()) {
      alert('Please upload a prescription or list your medicines.');
      return;
    }

    try {
      setIsSubmitting(true);
      setOrderStep(1);
      setSubStep(0);

      let prescriptionUrl = '';
      if (prescription) {
        prescriptionUrl = await uploadPrescriptionImage(prescription);
      }

      const orderData = {
        patientName,
        phone,
        prescriptionUrl,
        medicineList: medicineList.trim(),
        status: 'pending_review',
        createdAt: new Date().toISOString()
      };

      const created = await createMedicineOrderDb(orderData);
      setActiveOrderId(created.id);
    } catch (error) {
      console.error('Error creating medicine order:', error);
      alert('Failed to place medicine order. Please try again.');
      setOrderStep(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setIsDrawerOpen(false);
    setPatientName('');
    setPhone('');
    setPrescription(null);
    setMedicineList('');
    setOrderStep(0);
    setSubStep(0);
    setCountdown(900);
    setActiveOrderId(null);
    setActiveOrder(null);
    setIsSubmitting(false);
  };

  return (
    <div className="w-full mt-2 mb-4">
      {/* Premium Medicine Banner Container */}
      <div
        className="w-full rounded-[10px] p-2 min-[360px]:p-2.5 min-[400px]:p-3 border border-[#F5D0D0] relative overflow-hidden transition-all duration-300 hover:shadow-md shadow-sm bg-[#FFF8F8]"
      >
        {/* Main Banner Grid: Left side Image, Right side Text & CTA */}
        <div className="flex gap-2 min-[360px]:gap-2.5 min-[400px]:gap-3 items-center">

          {/* Left Side: Attached Image Banner */}
          <div
            onClick={() => setIsDrawerOpen(true)}
            className="w-[50%] sm:w-[220px] aspect-square sm:aspect-auto sm:h-[220px] flex-shrink-0 rounded-md overflow-hidden shadow-xs border border-red-100/50 cursor-pointer group relative bg-neutral-light"
          >
            <img
              src={medicineBanner}
              alt="Medicines Delivered"
              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
            />
            {/* Soft Hover Overlay Hint */}
            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="bg-white/95 text-[8px] font-black text-primary px-2 py-1 rounded shadow-sm">ORDER NOW</span>
            </div>
          </div>

          {/* Right Side: Text & Order Now Button */}
          <div className="flex-1 flex flex-col justify-between min-w-0 text-left py-0.5 self-stretch sm:self-auto sm:h-[200px]">

            {/* Heading */}
            <h2 className="text-[13px] min-[360px]:text-[14px] min-[400px]:text-[15px] min-[480px]:text-[16.5px] sm:text-[18px] font-black leading-tight text-primary tracking-tight pr-4 sm:pr-14">
              Medicines Delivered in <br /> 10-20 Minutes
            </h2>

            {/* Subtitle */}
            <p className="text-[8px] min-[360px]:text-[8.5px] min-[400px]:text-[9.5px] min-[480px]:text-[10.5px] sm:text-[11px] text-neutral-dark/90 font-semibold leading-relaxed">
              Upload your prescription and get genuine medicines delivered quickly and safely.
            </p>

            {/* Feature Chips */}
            <div className="flex flex-col gap-0.5 min-[360px]:gap-1 text-[7.5px] min-[360px]:text-[8px] min-[400px]:text-[9px] min-[480px]:text-[9.5px] sm:text-[10px] font-bold text-green-700 my-0.5">
              <span className="flex items-center">✓ Genuine Medicines</span>
              <span className="flex items-center">✓ Prescription Upload</span>
              <span className="flex items-center">✓ Fast Delivery</span>
            </div>

            {/* Order Now Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="w-full py-2 min-[360px]:py-2.5 bg-[#8B0000] hover:bg-[#720000] border border-[#720000] rounded-md text-[9.5px] min-[360px]:text-[10px] min-[400px]:text-[11px] min-[480px]:text-[11.5px] font-black text-white flex items-center justify-center gap-1 active:scale-[0.98] transition-all cursor-pointer shadow-sm"
            >
              <span>Order Medicines</span>
              <FaArrowRight className="text-[7px] min-[360px]:text-[8px] min-[480px]:text-[9px]" />
            </button>

          </div>
        </div>

      </div>

      {/* Slide-up Interactive Drawer (Mobile style) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-neutral-dark/60 backdrop-blur-xs">

          {/* Backdrop Closer */}
          <div className="absolute inset-0" onClick={resetForm}></div>

          {/* Drawer Sheet */}
          <div className="bg-white rounded-md max-h-[90vh] overflow-y-auto w-full max-w-[480px] mx-auto shadow-2xl relative z-10 flex flex-col border-t border-neutral-border transform transition-transform duration-300">

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-border">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-xl bg-red-100 flex items-center justify-center text-primary">
                  <FaCapsules className="text-xs text-red-600" />
                </div>
                <h3 className="text-sm font-black text-neutral-dark">Captain Bro Medicines</h3>
              </div>
              <button
                onClick={resetForm}
                className="p-1.5 rounded-full hover:bg-neutral-light text-neutral-dark/60 hover:text-neutral-dark transition-all cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>

            {/* Stepper Flow Container */}
            <div className="p-5 flex-1 flex flex-col gap-4">

              {/* STEP 0: THE ORDERING FORM */}
              {orderStep === 0 && (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">

                  {/* Name field */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-neutral-dark/65">Patient Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Sireesha K."
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 border border-neutral-border rounded-md text-xs font-semibold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 bg-neutral-light"
                    />
                  </div>

                  {/* Phone field */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-neutral-dark/65">Contact Phone Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 border border-neutral-border rounded-md text-xs font-semibold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 bg-neutral-light"
                    />
                  </div>

                  {/* Drag and Drop File Upload Area */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase text-neutral-dark/65">Upload Prescription (Rx)</label>

                    <div
                      onClick={triggerFileSelect}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200
                        ${isDragging ? 'border-primary bg-red-50/50 scale-[0.99]' : 'border-neutral-border hover:border-primary/50 hover:bg-neutral-light/50'}
                      `}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/*,application/pdf"
                      />

                      {prescription ? (
                        <div className="flex flex-col items-center text-center gap-1.5 w-full">
                          <FaFileMedical className="text-2xl text-red-600 animate-bounce" />
                          <div className="max-w-xs truncate text-xs font-bold text-neutral-dark">
                            {prescription.name}
                          </div>
                          <span className="text-[9px] text-neutral-dark/40 font-bold">
                            {(prescription.size / 1024).toFixed(1)} KB • Click to replace
                          </span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-center gap-1.5 py-2">
                          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-600 shadow-sm border border-red-100">
                            <FaUpload className="text-sm" />
                          </div>
                          <span className="text-xs font-bold text-neutral-dark">Drag & Drop prescription here</span>
                          <span className="text-[9px] text-neutral-dark/40 font-semibold">Or tap to browse photos or PDF (Max 5MB)</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Manual Medicines List Area */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black uppercase text-neutral-dark/65">List Medicines Manually</label>
                      <span className="text-[9px] text-neutral-dark/40 font-bold">Optional</span>
                    </div>
                    <textarea
                      placeholder="e.g. Paracetamol 650mg - 2 strips, Vitamin C - 1 strip..."
                      value={medicineList}
                      onChange={(e) => setMedicineList(e.target.value)}
                      rows="4"
                      className="w-full px-3.5 py-2.5 border border-neutral-border rounded-md text-xs font-semibold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 bg-neutral-light resize-none"
                    ></textarea>
                  </div>

                  {/* Disclaimer / Info */}
                  <div className="bg-amber-50 border border-amber-200/50 rounded-lg p-3 text-[10px] text-amber-800 font-semibold leading-relaxed flex gap-2">
                    <span className="text-xs select-none">⚠️</span>
                    <p>A valid prescription signed by a registered practitioner is mandatory for prescription-only medicines. Our registered pharmacist will review it before dispatch.</p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#8B0000] hover:bg-[#720000] rounded-md text-xs font-black text-white flex items-center justify-center gap-1 shadow-md shadow-red-900/10 active:scale-[0.98] transition-all cursor-pointer mt-1"
                  >
                    <span>Submit & Order Medicines</span>
                    <FaArrowRight className="text-[10px]" />
                  </button>

                </form>
              )}

              {/* STEP 1: PROCESSING STEPPER ANIMATION */}
              {orderStep === 1 && (
                <div className="flex flex-col py-6 items-center text-center gap-6">

                  {/* Glowing Animated Icon */}
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center border-2 border-red-100 animate-pulse">
                      <FaCapsules className="text-2xl text-red-600 animate-spin" style={{ animationDuration: '3s' }} />
                    </div>
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-white font-black text-[9px] flex items-center justify-center animate-bounce">
                      Rx
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-black text-neutral-dark">Processing Prescription</h4>
                    <p className="text-[10.5px] text-neutral-dark/50 font-semibold">Submitting details to Captain Bro pharmacy node</p>
                  </div>

                  {/* Stepper Steps UI */}
                  <div className="w-full max-w-[280px] flex flex-col gap-3.5 text-left pl-6 relative">

                    {/* Visual Vertical line */}
                    <div className="absolute left-[33px] top-2 bottom-2 w-0.5 bg-neutral-border"></div>

                    {/* Step 1: Upload */}
                    <div className="flex items-center gap-3 relative z-10">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors duration-300
                        ${subStep >= 0 ? 'bg-red-600 border-red-600 text-white shadow-sm' : 'bg-white border-neutral-border text-neutral-dark/40'}
                      `}>
                        {subStep > 0 ? '✓' : '1'}
                      </div>
                      <span className={`text-xs font-extrabold transition-colors duration-300 ${subStep >= 0 ? 'text-neutral-dark' : 'text-neutral-dark/40'}`}>
                        Uploading Prescription details
                      </span>
                    </div>

                    {/* Step 2: Pharmacist review */}
                    <div className="flex items-center gap-3 relative z-10">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors duration-300
                        ${subStep >= 1 ? 'bg-red-600 border-red-600 text-white shadow-sm' : 'bg-white border-neutral-border text-neutral-dark/40'}
                      `}>
                        {subStep > 1 ? '✓' : '2'}
                      </div>
                      <span className={`text-xs font-extrabold transition-colors duration-300 ${subStep >= 1 ? 'text-neutral-dark' : 'text-neutral-dark/40'}`}>
                        {subStep === 1 ? 'Pharmacist reviewing Rx...' : 'Pharmacist Approved'}
                      </span>
                    </div>

                    {/* Step 3: Packing */}
                    <div className="flex items-center gap-3 relative z-10">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors duration-300
                        ${subStep >= 2 ? 'bg-red-600 border-red-600 text-white shadow-sm' : 'bg-white border-neutral-border text-neutral-dark/40'}
                      `}>
                        {subStep > 2 ? '✓' : '3'}
                      </div>
                      <span className={`text-xs font-extrabold transition-colors duration-300 ${subStep >= 2 ? 'text-neutral-dark' : 'text-neutral-dark/40'}`}>
                        {subStep === 2 ? 'Packing items hygienically...' : 'Medicines Sealed & Checked'}
                      </span>
                    </div>

                    {/* Step 4: Dispatch */}
                    <div className="flex items-center gap-3 relative z-10">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors duration-300
                        ${subStep >= 3 ? 'bg-red-600 border-red-600 text-white shadow-sm' : 'bg-white border-neutral-border text-neutral-dark/40'}
                      `}>
                        4
                      </div>
                      <span className={`text-xs font-extrabold transition-colors duration-300 ${subStep >= 3 ? 'text-neutral-dark' : 'text-neutral-dark/40'}`}>
                        Dispatching to Rider
                      </span>
                    </div>

                  </div>

                  {/* Horizontal progress bar */}
                  <div className="w-full bg-neutral-light rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-red-600 h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${(subStep / 3) * 100}%` }}
                    ></div>
                  </div>

                </div>
              )}

              {/* STEP 2: CONFIRMED / TRACKING */}
              {orderStep === 2 && (
                <div className="flex flex-col py-4 items-center text-center gap-5">

                  {/* Big Checkmark */}
                  <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-100 flex items-center justify-center text-green-600 shadow-md animate-pulse">
                    <FaCheckCircle className="text-3xl text-green-600" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase text-green-700 bg-green-50 border border-green-200/50 rounded-full px-3 py-0.5 self-center">Order Confirmed</span>
                    <h3 className="text-base font-black text-neutral-dark mt-1">Order #{activeOrder?.id || 'CB-MED-9402'}</h3>
                    <p className="text-[10.5px] text-neutral-dark/50 font-semibold leading-normal text-center">
                      {activeOrder?.status === 'delivered' 
                        ? 'Your medicine box has been delivered!' 
                        : activeOrder?.status === 'picked_up'
                          ? 'Rider is in transit with your medicines!'
                          : 'Your medicine box is out for delivery!'}
                    </p>
                  </div>

                  {/* Live countdown timer card / Delivered status card */}
                  {activeOrder?.status === 'delivered' ? (
                    <div className="w-full bg-green-50 border border-green-200/50 rounded-xl p-4 flex flex-col items-center gap-1">
                      <span className="text-[9px] font-black uppercase text-green-700 tracking-wider">Status</span>
                      <span className="text-xl font-black text-green-700 leading-none tracking-tight my-1">
                        Successfully Delivered
                      </span>
                      <span className="text-[9px] text-neutral-dark/65 font-bold">Thank you for ordering with Captain Bro!</span>
                    </div>
                  ) : (
                    <div className="w-full bg-[#8B0000]/5 border border-[#8B0000]/15 rounded-xl p-4 flex flex-col items-center gap-1">
                      <span className="text-[9px] font-black uppercase text-[#8B0000] tracking-wider">Estimated Delivery Time</span>
                      <span className="text-3xl font-black text-primary font-mono tabular-nums leading-none tracking-tight my-1">
                        {formatTime(countdown)}
                      </span>
                      <span className="text-[9px] text-neutral-dark/65 font-bold">Quick. Safe. Reliable.</span>
                    </div>
                  )}

                  {/* Delivery Details list */}
                  <div className="w-full border border-neutral-border/60 rounded-xl p-3 flex flex-col gap-2.5 text-left text-xs bg-neutral-light">
                    <div className="flex justify-between font-bold">
                      <span className="text-neutral-dark/50">Patient Name:</span>
                      <span className="text-neutral-dark">{patientName}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span className="text-neutral-dark/50">Contact:</span>
                      <span className="text-neutral-dark">{phone}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span className="text-neutral-dark/50">Delivery Address:</span>
                      <span className="text-neutral-dark text-right max-w-[200px] truncate">Current Location, Warangal</span>
                    </div>
                    {activeOrder?.riderName && (
                      <div className="flex justify-between font-bold items-center border-t border-neutral-border/40 pt-2">
                        <span className="text-neutral-dark/50 flex items-center gap-1">
                          🛵 Delivery Rider:
                        </span>
                        <span className="text-teal-700 font-extrabold text-xs text-right max-w-[200px] truncate">
                          {activeOrder.riderName} ({activeOrder.riderPhone})
                        </span>
                      </div>
                    )}
                    {prescription && (
                      <div className="flex justify-between font-bold items-center border-t border-neutral-border/40 pt-2 mt-0.5">
                        <span className="text-neutral-dark/50 flex items-center gap-1">
                          <FaFileAlt className="text-[10px]" /> Prescription:
                        </span>
                        <span className="text-red-700 bg-red-50 border border-red-100 rounded px-1.5 py-0.5 text-[10px] truncate max-w-[150px]">
                          {prescription.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Track banner simulating map */}
                  <div className="w-full h-16 rounded-xl bg-neutral-border/25 border border-neutral-border/40 relative overflow-hidden flex items-center justify-between p-4">
                    {/* Road representation */}
                    <div className="absolute inset-x-0 h-1 bg-neutral-border/70 top-1/2 -translate-y-1/2"></div>

                    {/* Start dot (Shop) */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-3.5 h-3.5 rounded-full bg-primary border-2 border-white shadow-sm flex items-center justify-center">
                        <span className="text-[6px] text-white font-bold">+</span>
                      </div>
                      <span className="text-[7.5px] font-black text-neutral-dark/50 mt-1">Pharmacy</span>
                    </div>

                    {/* Progress scooter */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 z-20 flex flex-col items-center animate-[bounce_1.5s_infinite_ease-in-out] transition-all duration-300"
                      style={{ left: `${progressPercent}%` }}
                    >
                      <FaMotorcycle className="text-red-600 text-sm" />
                    </div>

                    {/* End dot (Home) */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-3.5 h-3.5 rounded-full bg-green-600 border-2 border-white shadow-sm flex items-center justify-center">
                        <span className="text-[6px] text-white font-bold">✓</span>
                      </div>
                      <span className="text-[7.5px] font-black text-green-700 mt-1 font-extrabold">You</span>
                    </div>
                  </div>

                  {/* Close button */}
                  <button
                    onClick={resetForm}
                    className="w-full py-3 bg-[#8B0000] hover:bg-[#720000] rounded-xl text-xs font-black text-white flex items-center justify-center gap-1 shadow-md shadow-red-900/10 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <span>Done</span>
                  </button>

                </div>
              )}

              {/* STEP 3: REJECTED SCREEN */}
              {orderStep === 3 && (
                <div className="flex flex-col py-6 items-center text-center gap-5">
                  <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center text-red-600 shadow-md">
                    <FaExclamationTriangle className="text-3xl text-red-600" />
                  </div>

                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black uppercase text-red-700 bg-red-50 border border-red-200/50 rounded-full px-3 py-0.5 self-center">Order Rejected</span>
                    <h3 className="text-base font-black text-neutral-dark mt-1">Order #{activeOrder?.id}</h3>
                    <p className="text-[10.5px] text-neutral-dark/50 font-semibold">Your medicine prescription was rejected by the pharmacist.</p>
                  </div>

                  <div className="bg-red-50 border border-red-200/50 rounded-lg p-3 text-xs text-red-800 font-semibold leading-relaxed w-full">
                    <p>Reason: Verification failed. The submitted prescription is invalid or expired. Please upload a valid Rx or contact support.</p>
                  </div>

                  <button
                    onClick={() => {
                      setOrderStep(0);
                      setActiveOrderId(null);
                      setActiveOrder(null);
                    }}
                    className="w-full py-3 bg-[#8B0000] hover:bg-[#720000] rounded-xl text-xs font-black text-white flex items-center justify-center gap-1 shadow-md shadow-red-900/10 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <span>Try Again</span>
                  </button>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default MedicineSection;
