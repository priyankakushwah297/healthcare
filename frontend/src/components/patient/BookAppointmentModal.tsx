import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Stethoscope,
  Building,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  PhoneCall,
  Home,
  ShieldCheck,
  ArrowRight,
  Receipt,
  MapPin
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useHospital } from '../../context/HospitalContext';
import { VisitMode } from '../../types';
import { AVAILABLE_TIME_SLOTS } from '../../data/initialData';

export const BookAppointmentModal: React.FC = () => {
  const {
    isBookModalOpen,
    closeBookModal,
    departments,
    users,
    currentUser,
    bookAppointment,
    openAuthModal,
    setActiveTab
  } = useHospital();

  // Booking steps: 1 = Form, 2 = Confirmation Summary, 3 = Payment, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [department, setDepartment] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState('');
  const [visitMode, setVisitMode] = useState<VisitMode>('Clinic');
  const [symptoms, setSymptoms] = useState('');

  // Patient info (if guest, can type name & mobile)
  const [patientName, setPatientName] = useState('');
  const [patientMobile, setPatientMobile] = useState('');
  const [homeLocation, setHomeLocation] = useState(currentUser?.address || '');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedBookingRef, setConfirmedBookingRef] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Pre-fill user data if logged in
  useEffect(() => {
    if (currentUser) {
      setPatientName(currentUser.fullName);
      setPatientMobile(currentUser.mobile);
      if (currentUser.address) {
        setHomeLocation(currentUser.address);
      }
    }
  }, [currentUser]);

  // Set default department on open
  useEffect(() => {
    if (departments.length > 0 && !department) {
      setDepartment(departments[0].name);
    }
  }, [departments, department]);

  // Filter doctors based on selected department
  const availableDoctors = users.filter(
    u => u.role === 'doctor' && (!department || u.department === department)
  );

  useEffect(() => {
    if (availableDoctors.length > 0) {
      setDoctorId(availableDoctors[0].id);
    } else {
      setDoctorId('');
    }
  }, [department]);

  useEffect(() => {
    if (AVAILABLE_TIME_SLOTS.length > 0 && !timeSlot) {
      setTimeSlot(AVAILABLE_TIME_SLOTS[0]);
    }
  }, []);

  if (!isBookModalOpen) return null;

  const selectedDoctor = users.find(u => u.id === doctorId);
  const consultationFee = selectedDoctor?.consultationFee || 750;

  // STEP 1 -> STEP 2: Validation and Summary
  const handleProceedToConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!department) {
      setErrorMsg('Please select a Department.');
      return;
    }
    if (!doctorId || !selectedDoctor) {
      setErrorMsg('Please select a Doctor.');
      return;
    }
    if (!date) {
      setErrorMsg('Please select an appointment Date.');
      return;
    }
    if (!timeSlot) {
      setErrorMsg('Please choose an available Time Slot.');
      return;
    }
    if (!visitMode) {
      setErrorMsg('Please choose a Visit Mode.');
      return;
    }
    if (visitMode === 'Homecare' && !homeLocation.trim()) {
      setErrorMsg('Please enter your Home Location address for the home visit.');
      return;
    }
    if (!symptoms.trim()) {
      setErrorMsg('Please enter symptoms or reason for consultation.');
      return;
    }
    if (!currentUser && (!patientName.trim() || !patientMobile.trim())) {
      setErrorMsg('Please provide your Full Name and Mobile Number.');
      return;
    }

    setStep(2);
  };

  // STEP 2 -> STEP 3: Proceed to Payment
  const handleProceedToPayment = () => {
    setStep(3);
  };

  // STEP 3 -> STEP 4: Process Payment & Book
  const handleConfirmAndPay = async () => {
    setIsProcessing(true);
    setErrorMsg('');

    try {
      const booked = await bookAppointment({
        patientId: currentUser?.patientId || currentUser?.id || `guest-${Date.now()}`,
        patientName: currentUser?.fullName || patientName,
        patientMobile: currentUser?.mobile || patientMobile,
        patientGender: currentUser?.gender,
        patientAge: currentUser?.dobOrAge,
        doctorId: selectedDoctor?.id || doctorId,
        doctorName: selectedDoctor?.fullName || 'Consultant Specialist',
        doctorSpecialization: selectedDoctor?.specialization,
        department,
        date,
        timeSlot,
        visitMode,
        homeLocation: visitMode === 'Homecare' ? homeLocation.trim() : undefined,
        notes: visitMode === 'Homecare' ? `Home Visit Address: ${homeLocation.trim()}` : undefined,
        symptoms: symptoms.trim() + (visitMode === 'Homecare' ? ` | Home Address: ${homeLocation.trim()}` : ''),
        status: date === new Date().toISOString().split('T')[0] ? 'today' : 'upcoming',
        paymentStatus: 'paid',
        amount: consultationFee,
        paymentMethod: paymentMethod === 'UPI' ? 'UPI / QR Code' : paymentMethod === 'Card' ? 'Credit / Debit Card' : 'Net Banking'
      });

      setConfirmedBookingRef(booked.bookingRef);
      setIsProcessing(false);
      setStep(4);

      // Fire festive celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore if not supported
      }
    } catch (err) {
      setIsProcessing(false);
      setErrorMsg('Failed to process appointment. Please try again.');
    }
  };

  const handleFinish = () => {
    closeBookModal();
    setStep(1);
    setActiveTab('appointments');
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-scaleIn relative">
        
        {/* Header */}
        <div className="bg-[#123B5D] px-5 sm:px-6 py-3.5 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#159A9C]/20 border border-[#159A9C] flex items-center justify-center text-white">
              <Calendar className="w-4 h-4 text-[#159A9C]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Book Doctor Appointment</h3>
              <p className="text-[11px] text-slate-300">
                Step {step} of 4: {step === 1 ? 'Details' : step === 2 ? 'Review & Confirm' : step === 3 ? 'Payment' : 'Confirmation'}
              </p>
            </div>
          </div>
          <button
            onClick={closeBookModal}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="grid grid-cols-4 gap-1 px-6 pt-3 bg-[#F7FAFC] border-b border-[#E2E8F0] shrink-0">
          <div className={`h-1.5 rounded-full ${step >= 1 ? 'bg-[#1769AA]' : 'bg-slate-200'}`} />
          <div className={`h-1.5 rounded-full ${step >= 2 ? 'bg-[#1769AA]' : 'bg-slate-200'}`} />
          <div className={`h-1.5 rounded-full ${step >= 3 ? 'bg-[#1769AA]' : 'bg-slate-200'}`} />
          <div className={`h-1.5 rounded-full ${step >= 4 ? 'bg-[#16845B]' : 'bg-slate-200'}`} />
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1 text-[#1E293B]">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#C0392B]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* STEP 1: All Mandatory Fields Form */}
          {step === 1 && (
            <form onSubmit={handleProceedToConfirm} className="space-y-4">
              {/* Patient info if not logged in */}
              {!currentUser && (
                <div className="p-3 bg-[#E8F6F6]/60 border border-[#159A9C]/30 rounded-xl space-y-2 mb-2">
                  <p className="text-xs font-semibold text-[#123B5D]">Patient Contact Information</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-[#1E293B] mb-1">
                        Full Name <span className="text-[#C0392B]">*</span>
                      </label>
                      <input
                        type="text"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="Your Full Name"
                        required
                        className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-[#1E293B] mb-1">
                        Mobile Number <span className="text-[#C0392B]">*</span>
                      </label>
                      <input
                        type="tel"
                        value={patientMobile}
                        onChange={(e) => setPatientMobile(e.target.value)}
                        placeholder="10-digit mobile"
                        required
                        className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Department Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                  Department <span className="text-[#C0392B]">*</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-2.5 bg-[#F7FAFC] border border-[#E2E8F0] focus:border-[#1769AA] rounded-xl text-xs font-medium text-[#1E293B] outline-hidden cursor-pointer"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Doctor Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                  Doctor <span className="text-[#C0392B]">*</span>
                </label>
                <div className="relative">
                  <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <select
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    required
                    className="w-full pl-9 pr-4 py-2.5 bg-[#F7FAFC] border border-[#E2E8F0] focus:border-[#1769AA] rounded-xl text-xs font-medium text-[#1E293B] outline-hidden cursor-pointer"
                  >
                    {availableDoctors.length === 0 ? (
                      <option value="">No doctors listed for this department</option>
                    ) : (
                      availableDoctors.map((doc) => (
                        <option key={doc.id} value={doc.id}>
                          {doc.fullName} — {doc.specialization} (₹{doc.consultationFee})
                        </option>
                      ))
                    )}
                  </select>
                </div>
                {selectedDoctor && (
                  <p className="text-[11px] text-[#159A9C] mt-1 font-medium">
                    Available Days: {selectedDoctor.availableDays || 'Mon - Sat'} | {selectedDoctor.workingHours || '09:00 AM - 04:00 PM'}
                  </p>
                )}
              </div>

              {/* Date and Time Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                    Appointment Date <span className="text-[#C0392B]">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <input
                      type="date"
                      value={date}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] focus:border-[#1769AA] rounded-xl text-xs font-medium text-[#1E293B] outline-hidden cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                    Time Slot <span className="text-[#C0392B]">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] focus:border-[#1769AA] rounded-xl text-xs font-medium text-[#1E293B] outline-hidden cursor-pointer"
                    >
                      {AVAILABLE_TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Visit Mode (Clinic, Homecare) */}
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1.5">
                  Visit Mode <span className="text-[#C0392B]">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setVisitMode('Clinic')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                      visitMode === 'Clinic'
                        ? 'bg-[#E8F6F6] text-[#123B5D] border-[#159A9C] ring-1 ring-[#159A9C]'
                        : 'bg-[#F7FAFC] text-[#64748B] border-[#E2E8F0] hover:bg-slate-100'
                    }`}
                  >
                    <Building className="w-4 h-4 text-[#159A9C]" />
                    <span>Clinic Visit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setVisitMode('Homecare');
                      setTimeout(() => {
                        document.getElementById('modal-homecare-address-textarea')?.focus();
                      }, 100);
                    }}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                      visitMode === 'Homecare'
                        ? 'bg-[#E8F6F6] text-[#123B5D] border-[#159A9C] ring-1 ring-[#159A9C]'
                        : 'bg-[#F7FAFC] text-[#64748B] border-[#E2E8F0] hover:bg-slate-100'
                    }`}
                  >
                    <Home className={`w-4 h-4 ${visitMode === 'Homecare' ? 'text-[#159A9C]' : 'text-slate-500'}`} />
                    <span>Homecare</span>
                  </button>
                </div>

                {/* Conditional Home Location / Address Input for Homecare */}
                {visitMode === 'Homecare' && (
                  <div className="mt-2.5 p-3.5 bg-gradient-to-br from-[#E8F6F6]/70 via-[#F0F9FF]/50 to-white rounded-xl border border-[#159A9C]/40 space-y-1.5 animate-fadeIn shadow-2xs">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-[#123B5D] flex items-center space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#159A9C] shrink-0" />
                        <span>Address <span className="text-[#C0392B]">*</span></span>
                      </label>
                      <span className="text-[9px] font-bold text-[#159A9C] bg-[#E8F6F6] px-2 py-0.5 rounded-full border border-[#159A9C]/30">
                        Doctor Destination
                      </span>
                    </div>
                    <textarea
                      id="modal-homecare-address-textarea"
                      value={homeLocation}
                      onChange={(e) => setHomeLocation(e.target.value)}
                      placeholder="Describe your complete home address with landmark (e.g. Flat/House No., Building Name, Street, Landmark, City & PIN code) so doctor can visit..."
                      rows={2}
                      required
                      className="w-full p-2.5 bg-white border border-[#159A9C]/40 focus:border-[#159A9C] focus:ring-1 focus:ring-[#159A9C]/20 rounded-lg text-xs text-[#1E293B] outline-none resize-none placeholder:text-slate-400 font-medium"
                    />
                    <p className="text-[10px] text-[#159A9C] font-medium">
                      📍 Clinical doctor &amp; nursing team will reach this address at scheduled slot.
                    </p>
                  </div>
                )}
              </div>

              {/* Symptoms / Reason */}
              <div>
                <label className="block text-xs font-semibold text-[#1E293B] mb-1">
                  Symptoms / Reason for Consultation <span className="text-[#C0392B]">*</span>
                </label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe your health symptoms, duration, previous treatments, or reason for visit..."
                  rows={3}
                  required
                  className="w-full p-3 bg-[#F7FAFC] border border-[#E2E8F0] focus:border-[#1769AA] rounded-xl text-xs font-medium text-[#1E293B] outline-hidden"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#1769AA] hover:bg-[#123B5D] text-white py-2.5 px-4 rounded-xl font-semibold text-xs transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <span>Confirm Appointment Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: Review & Summary */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-[#E8F6F6] p-4 rounded-xl border border-[#159A9C]/30 text-[#123B5D]">
                <h4 className="font-bold text-sm text-[#123B5D] mb-3 flex items-center space-x-2">
                  <Receipt className="w-4 h-4 text-[#159A9C]" />
                  <span>Appointment Summary</span>
                </h4>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between border-b border-[#159A9C]/20 pb-1.5">
                    <span className="text-[#64748B]">Department:</span>
                    <span className="font-semibold text-[#1E293B]">{department}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#159A9C]/20 pb-1.5">
                    <span className="text-[#64748B]">Consulting Doctor:</span>
                    <span className="font-semibold text-[#1E293B]">{selectedDoctor?.fullName}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#159A9C]/20 pb-1.5">
                    <span className="text-[#64748B]">Date & Time:</span>
                    <span className="font-semibold text-[#1E293B]">{date} at {timeSlot}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#159A9C]/20 pb-1.5">
                    <span className="text-[#64748B]">Visit Mode:</span>
                    <span className="font-semibold text-[#159A9C] bg-white px-2 py-0.5 rounded border border-[#159A9C]/30">
                      {visitMode}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-[#159A9C]/20 pb-1.5">
                    <span className="text-[#64748B]">Patient:</span>
                    <span className="font-semibold text-[#1E293B]">
                      {currentUser?.fullName || patientName} ({currentUser?.mobile || patientMobile})
                    </span>
                  </div>
                  {visitMode === 'Homecare' && (
                    <div className="flex justify-between border-b border-[#159A9C]/20 pb-1.5">
                      <span className="text-[#64748B]">Home Address:</span>
                      <span className="font-semibold text-[#123B5D] text-right max-w-xs">{homeLocation}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1">
                    <span className="text-[#64748B]">Reason / Symptoms:</span>
                    <span className="font-medium text-[#1E293B] max-w-[240px] text-right truncate">
                      {symptoms}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Calculation Box */}
              <div className="bg-[#F7FAFC] p-3.5 rounded-xl border border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <p className="text-xs text-[#64748B]">Total Consultation Fee:</p>
                  <p className="text-[11px] text-[#159A9C]">Includes digital prescription & hospital registration</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-[#123B5D]">₹{consultationFee}</span>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#64748B] text-xs font-semibold rounded-xl"
                >
                  Edit Details
                </button>
                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  className="w-2/3 bg-[#1769AA] hover:bg-[#123B5D] text-white py-2.5 text-xs font-semibold rounded-xl shadow-md transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Proceed to Payment (₹{consultationFee})</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Page */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center pb-2">
                <p className="text-xs text-[#64748B]">Healthcare Secure Checkout</p>
                <h4 className="text-xl font-bold text-[#123B5D]">Pay ₹{consultationFee}</h4>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#1E293B]">Select Payment Option</label>
                
                <div
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-colors ${
                    paymentMethod === 'UPI'
                      ? 'border-[#159A9C] bg-[#E8F6F6]'
                      : 'border-[#E2E8F0] hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center font-bold text-xs text-[#159A9C]">
                      UPI
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#123B5D]">Instant UPI / QR / Google Pay / PhonePe</p>
                      <p className="text-[10px] text-[#64748B]">Zero transaction fee</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="pay_method"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                  />
                </div>

                <div
                  onClick={() => setPaymentMethod('Card')}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-colors ${
                    paymentMethod === 'Card'
                      ? 'border-[#159A9C] bg-[#E8F6F6]'
                      : 'border-[#E2E8F0] hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center font-bold text-xs text-[#1769AA]">
                      <CreditCard className="w-4 h-4 text-[#1769AA]" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#123B5D]">Credit / Debit Card</p>
                      <p className="text-[10px] text-[#64748B]">Visa, MasterCard, RuPay</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="pay_method"
                    checked={paymentMethod === 'Card'}
                    onChange={() => setPaymentMethod('Card')}
                  />
                </div>

                <div
                  onClick={() => setPaymentMethod('NetBanking')}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-colors ${
                    paymentMethod === 'NetBanking'
                      ? 'border-[#159A9C] bg-[#E8F6F6]'
                      : 'border-[#E2E8F0] hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center font-bold text-xs text-purple-600">
                      NB
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#123B5D]">Net Banking / All Indian Banks</p>
                      <p className="text-[10px] text-[#64748B]">HDFC, SBI, ICICI, Axis & others</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="pay_method"
                    checked={paymentMethod === 'NetBanking'}
                    onChange={() => setPaymentMethod('NetBanking')}
                  />
                </div>
              </div>

              <div className="pt-3 flex space-x-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={isProcessing}
                  className="w-1/3 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#64748B] text-xs font-semibold rounded-xl"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAndPay}
                  disabled={isProcessing}
                  className="w-2/3 bg-[#16845B] hover:bg-emerald-800 text-white py-2.5 text-xs font-semibold rounded-xl shadow-md transition-colors flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{isProcessing ? 'Verifying & Confirming...' : `Pay ₹${consultationFee} & Book`}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Appointment Booked Successfully Confirmation */}
          {step === 4 && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#16845B] mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-[#123B5D]">Appointment Booked Successfully!</h4>
                <p className="text-xs text-[#64748B] mt-1">
                  Your appointment booking reference is <strong className="text-[#159A9C]">{confirmedBookingRef}</strong>
                </p>
              </div>

              <div className="bg-[#F7FAFC] p-4 rounded-xl border border-[#E2E8F0] text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Doctor:</span>
                  <span className="font-semibold text-[#123B5D]">{selectedDoctor?.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Date & Time:</span>
                  <span className="font-semibold text-[#123B5D]">{date} at {timeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Visit Mode:</span>
                  <span className="font-semibold text-[#159A9C]">{visitMode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Payment Status:</span>
                  <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                    PAID (₹{consultationFee})
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-[#64748B]">
                A confirmation SMS & reminder has been dispatched to your mobile. The appointment has been updated in your Scheduled Appointments dashboard.
              </p>

              <button
                type="button"
                onClick={handleFinish}
                className="w-full bg-[#1769AA] hover:bg-[#123B5D] text-white py-2.5 rounded-xl font-semibold text-xs transition-colors shadow-md cursor-pointer"
              >
                View in My Scheduled Appointments
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
