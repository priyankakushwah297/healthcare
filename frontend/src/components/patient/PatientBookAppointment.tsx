import React, { useState, useEffect } from 'react';
import {
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
  QrCode,
  Download,
  CalendarCheck,
  ChevronLeft,
  DollarSign,
  HeartPulse,
  Sparkles,
  Award,
  MapPin
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useHospital } from '../../context/HospitalContext';
import { VisitMode, Appointment } from '../../types';
import { AVAILABLE_TIME_SLOTS } from '../../data/initialData';
import { PatientNavTabs } from './PatientNavTabs';

export const PatientBookAppointment: React.FC<{ hideTabs?: boolean }> = ({ hideTabs }) => {
  const {
    departments,
    users,
    staff,
    currentUser,
    bookAppointment,
    setActiveTab
  } = useHospital();

  // Booking steps: 1 = Form, 2 = Summary / Confirmation, 3 = Payment, 4 = Successful Booking
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

  // Patient Info
  const [patientName, setPatientName] = useState(currentUser?.fullName || '');
  const [patientMobile, setPatientMobile] = useState(currentUser?.mobile || '');
  const [homeLocation, setHomeLocation] = useState(currentUser?.address || '');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'NetBanking' | 'CashAtDesk'>('UPI');
  const [upiId, setUpiId] = useState('patient@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('834');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Sync user info if changed
  useEffect(() => {
    if (currentUser) {
      setPatientName(currentUser.fullName);
      setPatientMobile(currentUser.mobile);
      if (currentUser.address) {
        setHomeLocation(currentUser.address);
      }
    }
  }, [currentUser]);

  // Set default department
  useEffect(() => {
    if (departments.length > 0 && !department) {
      setDepartment(departments[0].name);
    }
  }, [departments, department]);

  // Unified dynamic doctor list merging users and staff to ensure all doctor profiles & photos are available
  const allDoctors = React.useMemo(() => {
    const list: any[] = [];
    const seenIds = new Set<string>();
    const seenNames = new Set<string>();

    // 1. First add from staff
    staff.filter(s => (s.type === 'doctor' || s.staffType === 'doctor') && s.isActive !== false).forEach(s => {
      const cleanName = (s.fullName || s.name || '').trim();
      if (s.id) seenIds.add(s.id);
      if (s.staffId) seenIds.add(s.staffId);
      if (cleanName) seenNames.add(cleanName.toLowerCase());

      const matchingUser = users.find(u => u.staffId === s.staffId || u.doctorId === s.staffId || u.id === s.id || (u.fullName && u.fullName.toLowerCase() === cleanName.toLowerCase()));

      list.push({
        id: matchingUser?.id || s.id,
        staffId: s.staffId,
        doctorId: s.staffId,
        fullName: cleanName,
        department: s.department || matchingUser?.department || 'General Medicine',
        specialization: s.specialization || s.roleTitle || matchingUser?.specialization || 'Consultant Specialist',
        qualification: s.qualification || matchingUser?.qualification || 'MBBS, MD',
        experience: s.experience || matchingUser?.experience || '10+ Years Experience',
        consultationFee: s.consultationFee || matchingUser?.consultationFee || 750,
        workingHours: s.workingHours || s.shiftTiming || matchingUser?.workingHours || '09:00 AM - 04:00 PM',
        availableDays: s.availableDays || matchingUser?.availableDays,
        profilePhoto: s.profilePhoto || matchingUser?.profilePhoto || (matchingUser as any)?.avatar || 'https://images.unsplash.com/photo-1594824813570-87b64010b991?w=250&auto=format&fit=crop&q=80',
        role: 'doctor'
      });
    });

    // 2. Add from users (if not in staff)
    users.filter(u => u.role === 'doctor' && u.isActive !== false).forEach(u => {
      const cleanName = (u.fullName || '').trim();
      const hasId = seenIds.has(u.id) || (u.doctorId && seenIds.has(u.doctorId)) || (u.staffId && seenIds.has(u.staffId));
      const hasName = cleanName && seenNames.has(cleanName.toLowerCase());

      if (!hasId && !hasName) {
        seenIds.add(u.id);
        if (cleanName) seenNames.add(cleanName.toLowerCase());

        list.push({
          id: u.id,
          staffId: u.doctorId || u.staffId || u.id,
          doctorId: u.doctorId || u.staffId,
          fullName: cleanName,
          department: u.department || 'General Medicine',
          specialization: u.specialization || 'Consultant Specialist',
          qualification: u.qualification || 'MBBS, MD',
          experience: u.experience || '10+ Years Experience',
          consultationFee: u.consultationFee || 750,
          workingHours: u.workingHours || '09:00 AM - 04:00 PM',
          availableDays: u.availableDays,
          profilePhoto: u.profilePhoto || (u as any)?.avatar || 'https://images.unsplash.com/photo-1594824813570-87b64010b991?w=250&auto=format&fit=crop&q=80',
          role: 'doctor'
        });
      }
    });

    return list;
  }, [staff, users]);

  // Filter doctors based on selected department
  const availableDoctors = allDoctors.filter(
    doc => (!department || (doc.department || '').toLowerCase() === (department || '').toLowerCase())
  );

  useEffect(() => {
    if (availableDoctors.length > 0) {
      if (!doctorId || !availableDoctors.some(d => d.id === doctorId || d.staffId === doctorId)) {
        setDoctorId(availableDoctors[0].id);
      }
    } else {
      setDoctorId('');
    }
  }, [department, availableDoctors, doctorId]);

  useEffect(() => {
    if (AVAILABLE_TIME_SLOTS.length > 0 && !timeSlot) {
      setTimeSlot(AVAILABLE_TIME_SLOTS[0]);
    }
  }, []);

  const selectedDoctor = allDoctors.find(d => d.id === doctorId || d.staffId === doctorId || d.doctorId === doctorId) || availableDoctors[0];
  const consultationFee = selectedDoctor?.consultationFee || 750;
  const hospitalTax = 0;
  const totalPayable = consultationFee + hospitalTax;

  // Minimum selectable date is today
  const todayStr = new Date().toISOString().split('T')[0];

  // STEP 1 -> STEP 2: Validate Mandatory Fields and proceed to Confirmation Summary
  const handleValidateAndProceed = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!department) {
      setErrorMsg('Please select a Department *');
      return;
    }
    if (!doctorId || !selectedDoctor) {
      setErrorMsg('Please select a Doctor *');
      return;
    }
    if (!date) {
      setErrorMsg('Please select an appointment Date *');
      return;
    }
    if (!timeSlot) {
      setErrorMsg('Please select an available Time Slot *');
      return;
    }
    if (!visitMode) {
      setErrorMsg('Please choose a Visit Mode (Clinic / Homecare) *');
      return;
    }
    if (visitMode === 'Homecare' && !homeLocation.trim()) {
      setErrorMsg('Please enter your complete Home Location / Address for the home visit *');
      return;
    }
    if (!symptoms.trim()) {
      setErrorMsg('Please enter symptoms or reason for consultation *');
      return;
    }
    if (!patientName.trim() || !patientMobile.trim()) {
      setErrorMsg('Patient Name and Mobile Number are required *');
      return;
    }

    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // STEP 2 -> STEP 3: Proceed to Payment Page
  const handleProceedToPayment = () => {
    setStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // STEP 3 -> STEP 4: Process Payment & Book Appointment
  const handleConfirmAndPay = async () => {
    setIsProcessing(true);
    setErrorMsg('');

    try {
      // Simulate bank / payment gateway latency
      await new Promise(r => setTimeout(r, 1200));

      const booked = await bookAppointment({
        patientId: currentUser?.patientId || currentUser?.id || `pat-${Date.now()}`,
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
        status: date === todayStr ? 'today' : 'upcoming',
        paymentStatus: 'paid',
        amount: totalPayable,
        paymentMethod: paymentMethod === 'UPI' ? 'UPI / QR Code' : paymentMethod === 'Card' ? 'Credit / Debit Card' : paymentMethod === 'NetBanking' ? `Net Banking (${selectedBank})` : 'Pay at Clinic Desk'
      });

      setCreatedAppointment(booked);
      setIsProcessing(false);
      setStep(4);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }
    } catch (err) {
      setIsProcessing(false);
      setErrorMsg('Failed to process appointment. Please try again.');
    }
  };

  // Download Appointment Slip simulation
  const handleDownloadSlip = () => {
    const slipText = `
===================================================
      HEALTHCARE & RESEARCH CENTRE
              APPOINTMENT BOOKING SLIP
===================================================
Booking Ref: ${createdAppointment?.bookingRef || 'KLP-APT-8821'}
Date of Booking: ${new Date().toLocaleDateString()}
Status: CONFIRMED & SCHEDULED

PATIENT DETAILS:
Name: ${createdAppointment?.patientName || patientName}
Contact: ${createdAppointment?.patientMobile || patientMobile}
Patient ID: ${currentUser?.patientId || 'PAT-2026-1001'}

APPOINTMENT DETAILS:
Doctor: ${createdAppointment?.doctorName} (${createdAppointment?.doctorSpecialization || 'Specialist'})
Department: ${createdAppointment?.department}
Appointment Date: ${createdAppointment?.date}
Time Slot: ${createdAppointment?.timeSlot}
Visit Mode: ${createdAppointment?.visitMode} Consultation
${createdAppointment?.visitMode === 'Homecare' ? `Home Visit Address: ${createdAppointment?.homeLocation || homeLocation}\n` : ''}Reason: ${createdAppointment?.symptoms}

PAYMENT SUMMARY:
Consultation Fee: ₹${createdAppointment?.amount}
Payment Status: PAID (${createdAppointment?.paymentMethod})

INSTRUCTIONS FOR PATIENT:
1. Please arrive 15 minutes prior to your scheduled slot for vital checks.
2. For Homecare visits, clinical staff will contact you 30 minutes before arrival.
3. Bring previous prescriptions and diagnostic reports if available.
===================================================
`;
    const blob = new Blob([slipText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Appointment-Slip-${createdAppointment?.bookingRef || 'KLP'}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fadeIn text-[#1E293B] font-sans">
      {!hideTabs && <PatientNavTabs currentTab="book-appointment" />}

      {/* Main Flow Card */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        
        {/* Step Indicator Header */}
        <div className="bg-[#123B5D] px-6 py-5 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-semibold text-[#159A9C] uppercase tracking-wider">
                Instant OPD & Homecare Booking
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
                Book a Doctor Appointment
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                Follow the 4 simple steps to schedule your consultation with leading specialists.
              </p>
            </div>

            {/* Stepper Pill Indicators */}
            <div className="flex items-center space-x-2 bg-white/10 p-1.5 rounded-xl text-xs backdrop-blur-xs">
              <div className={`px-3 py-1 rounded-lg font-bold flex items-center space-x-1.5 ${
                step === 1 ? 'bg-[#159A9C] text-white' : step > 1 ? 'bg-emerald-600 text-white' : 'text-slate-300'
              }`}>
                <span>1. Form</span>
              </div>
              <div className={`px-3 py-1 rounded-lg font-bold flex items-center space-x-1.5 ${
                step === 2 ? 'bg-[#159A9C] text-white' : step > 2 ? 'bg-emerald-600 text-white' : 'text-slate-300'
              }`}>
                <span>2. Summary</span>
              </div>
              <div className={`px-3 py-1 rounded-lg font-bold flex items-center space-x-1.5 ${
                step === 3 ? 'bg-[#159A9C] text-white' : step > 3 ? 'bg-emerald-600 text-white' : 'text-slate-300'
              }`}>
                <span>3. Payment</span>
              </div>
              <div className={`px-3 py-1 rounded-lg font-bold flex items-center space-x-1.5 ${
                step === 4 ? 'bg-emerald-600 text-white' : 'text-slate-300'
              }`}>
                <span>4. Success</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="grid grid-cols-4 h-1.5 bg-[#E2E8F0]">
          <div className={`h-full ${step >= 1 ? 'bg-[#1769AA]' : ''}`} />
          <div className={`h-full ${step >= 2 ? 'bg-[#1769AA]' : ''}`} />
          <div className={`h-full ${step >= 3 ? 'bg-[#1769AA]' : ''}`} />
          <div className={`h-full ${step >= 4 ? 'bg-[#16845B]' : ''}`} />
        </div>

        {/* Form Body Container */}
        <div className="p-6 sm:p-8">
          
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-[#C0392B] text-xs font-semibold rounded-xl flex items-center space-x-3 animate-fadeIn">
              <AlertCircle className="w-5 h-5 shrink-0 text-[#C0392B]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 1: All Mandatory Fields Form (Marked with Star *) */}
          {/* ========================================================================= */}
          {step === 1 && (
            <form onSubmit={handleValidateAndProceed} className="space-y-6">
              
              <div className="p-4 bg-[#F7FAFC] rounded-xl border border-[#E2E8F0] mb-4">
                <p className="text-xs text-[#64748B]">
                  All fields marked with <strong className="text-[#C0392B]">*</strong> are mandatory. Please provide accurate symptoms to help your doctor prepare.
                </p>
              </div>

              {/* Patient Basic Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                    Patient Full Name <span className="text-[#C0392B]">*</span>
                  </label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Enter patient full name"
                    required
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] focus:border-[#1769AA] rounded-xl text-xs text-[#1E293B] outline-hidden transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                    Mobile Number <span className="text-[#C0392B]">*</span>
                  </label>
                  <input
                    type="tel"
                    value={patientMobile}
                    onChange={(e) => setPatientMobile(e.target.value)}
                    placeholder="10-digit mobile number"
                    required
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] focus:border-[#1769AA] rounded-xl text-xs text-[#1E293B] outline-hidden transition-colors"
                  />
                </div>
              </div>

              {/* Department & Doctor Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* 1. Department Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                    Select Department <span className="text-[#C0392B]">*</span>
                  </label>
                  <select
                    id="book-department-select"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] focus:border-[#1769AA] rounded-xl text-xs text-[#1E293B] font-medium outline-hidden transition-colors cursor-pointer"
                  >
                    <option value="">-- Choose Department --</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name} ({dept.headOfDepartment})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-[#64748B] mt-1">
                    Specialized clinical care departments available 24/7.
                  </p>
                </div>

                {/* 2. Doctor Dropdown (Dynamic based on selected department) */}
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                    Select Doctor <span className="text-[#C0392B]">*</span>
                  </label>
                  <select
                    id="book-doctor-select"
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] focus:border-[#1769AA] rounded-xl text-xs text-[#1E293B] font-medium outline-hidden transition-colors cursor-pointer"
                  >
                    <option value="">-- Choose Doctor --</option>
                    {availableDoctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.fullName} ({doc.specialization || doc.qualification}) - ₹{doc.consultationFee || 750}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-[#64748B] mt-1">
                    {availableDoctors.length} specialist(s) available in {department || 'selected department'}.
                  </p>
                </div>
              </div>

              {/* Doctor Quick Badge Summary */}
              {selectedDoctor && (
                <div className="p-4 bg-[#E8F6F6]/50 border border-[#159A9C]/30 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#123B5D] to-[#1769AA] text-white flex items-center justify-center font-bold text-sm overflow-hidden ring-2 ring-[#159A9C]/40 shrink-0 shadow-xs">
                      {selectedDoctor.profilePhoto ? (
                        <img
                          src={selectedDoctor.profilePhoto}
                          alt={selectedDoctor.fullName}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = selectedDoctor.gender === 'Female' 
                              ? 'https://images.unsplash.com/photo-1594824813570-87b64010b991?w=250&auto=format&fit=crop&q=80'
                              : 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=250&auto=format&fit=crop&q=80';
                          }}
                        />
                      ) : (
                        <span className="text-sm font-bold">{(selectedDoctor.fullName?.charAt(4) || selectedDoctor.fullName?.charAt(0) || 'D').toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#123B5D]">{selectedDoctor.fullName}</h4>
                      <p className="text-[11px] text-[#64748B]">
                        {selectedDoctor.qualification} • {selectedDoctor.specialization} ({selectedDoctor.experience || '10+ yrs exp'})
                      </p>
                      <p className="text-[10px] text-[#159A9C] font-semibold">
                        OPD Hours: {selectedDoctor.workingHours || '09:00 AM - 04:00 PM'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-[#64748B] block">Consultation Fee</span>
                    <span className="text-sm font-bold text-[#1769AA]">₹{consultationFee}</span>
                  </div>
                </div>
              )}

              {/* Date & Time Slot Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* 3. Date Picker */}
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                    Appointment Date <span className="text-[#C0392B]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      min={todayStr}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] focus:border-[#1769AA] rounded-xl text-xs text-[#1E293B] font-medium outline-hidden transition-colors"
                    />
                  </div>
                  <p className="text-[11px] text-[#64748B] mt-1">
                    Select a date starting today or upcoming days.
                  </p>
                </div>

                {/* 4. Time Slot Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                    Available Time Slot <span className="text-[#C0392B]">*</span>
                  </label>
                  <select
                    id="book-timeslot-select"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] focus:border-[#1769AA] rounded-xl text-xs text-[#1E293B] font-medium outline-hidden transition-colors cursor-pointer"
                  >
                    <option value="">-- Select Time Slot --</option>
                    {AVAILABLE_TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-[#64748B] mt-1">
                    Guaranteed 20-minute doctor consultation window.
                  </p>
                </div>
              </div>

              {/* 5. Visit Mode Options (Clinic / Homecare) */}
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-2">
                  Visit Mode <span className="text-[#C0392B]">*</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  
                  {/* Clinic Option */}
                  <div
                    onClick={() => setVisitMode('Clinic')}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start space-x-3.5 ${
                      visitMode === 'Clinic'
                        ? 'border-[#159A9C] bg-[#E8F6F6]/40 shadow-xs'
                        : 'border-[#E2E8F0] hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      visitMode === 'Clinic' ? 'bg-[#159A9C] text-white' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h4 className="font-bold text-xs text-[#123B5D]">Clinic Visit</h4>
                        {visitMode === 'Clinic' && <CheckCircle2 className="w-3.5 h-3.5 text-[#159A9C]" />}
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-0.5">
                        In-person consultation at hospital OPD wing.
                      </p>
                    </div>
                  </div>

                  {/* Homecare Option */}
                  <div
                    onClick={() => {
                      setVisitMode('Homecare');
                      setTimeout(() => {
                        document.getElementById('homecare-address-textarea')?.focus();
                      }, 100);
                    }}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start space-x-3.5 ${
                      visitMode === 'Homecare'
                        ? 'border-[#159A9C] bg-[#E8F6F6]/40 shadow-xs ring-1 ring-[#159A9C]'
                        : 'border-[#E2E8F0] hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      visitMode === 'Homecare' ? 'bg-[#159A9C] text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Home className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h4 className="font-bold text-xs text-[#123B5D]">Homecare Visit</h4>
                        {visitMode === 'Homecare' && <CheckCircle2 className="w-3.5 h-3.5 text-[#159A9C]" />}
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-0.5">
                        Doctor &amp; Nursing visit at your residence.
                      </p>
                    </div>
                  </div>

                </div>

                {/* Conditional Home Location / Address for Homecare Visit */}
                {visitMode === 'Homecare' && (
                  <div className="mt-4 p-4 sm:p-5 bg-gradient-to-br from-[#E8F6F6]/70 via-[#F0F9FF]/50 to-white rounded-2xl border-2 border-[#159A9C]/40 shadow-xs space-y-3 animate-fadeIn">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-[#159A9C]/20">
                      <div className="flex items-center space-x-2 text-[#123B5D] font-bold text-xs">
                        <div className="w-6 h-6 rounded-lg bg-[#159A9C] text-white flex items-center justify-center">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <span>Address <span className="text-[#C0392B]">*</span></span>
                      </div>
                      <span className="text-[10px] font-bold text-[#159A9C] bg-[#E8F6F6] px-2.5 py-0.5 rounded-full border border-[#159A9C]/30 w-fit">
                        Doctor Visit Destination
                      </span>
                    </div>

                    <div>
                      <textarea
                        id="homecare-address-textarea"
                        rows={3}
                        value={homeLocation}
                        onChange={(e) => setHomeLocation(e.target.value)}
                        placeholder="Describe your complete home address with landmark (e.g. Flat/House No., Building Name, Street/Colony, Nearby Landmark, City & PIN code) so the doctor can navigate directly..."
                        className="w-full px-3.5 py-2.5 bg-white border border-[#159A9C]/40 focus:border-[#159A9C] focus:ring-2 focus:ring-[#159A9C]/20 rounded-xl text-xs text-[#1E293B] outline-none transition-all resize-none placeholder:text-slate-400 font-medium"
                        required
                      />
                      <div className="flex items-center justify-between text-[11px] text-[#159A9C] font-medium mt-1.5">
                        <span>📍 Doctor &amp; nursing staff will visit this exact residence location at the scheduled slot.</span>
                        <span className="text-[10px] text-[#159A9C] font-semibold">{homeLocation.length} chars</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 6. Symptoms / Reason for Consultation */}
              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1.5">
                  Symptoms / Reason for Consultation <span className="text-[#C0392B]">*</span>
                </label>
                <textarea
                  id="book-symptoms-textarea"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  rows={3}
                  placeholder="Describe your symptoms, previous medical history, pain level, or reason for booking (e.g. persistent fever for 3 days, joint pain, routine cardiac checkup)..."
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] focus:border-[#1769AA] rounded-xl text-xs text-[#1E293B] outline-hidden transition-colors resize-none"
                />
                <div className="flex items-center justify-between text-[11px] text-[#64748B] mt-1">
                  <span>Be specific to ensure comprehensive clinical examination.</span>
                  <span>{symptoms.length} characters</span>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className="px-4 py-2.5 bg-[#F7FAFC] hover:bg-slate-100 border border-[#E2E8F0] text-[#123B5D] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                {/* Confirm Appointment CTA */}
                <button
                  type="submit"
                  id="submit-book-appointment-btn"
                  className="px-6 py-2.5 bg-[#1769AA] hover:bg-[#123B5D] text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center space-x-2 cursor-pointer active:scale-95"
                >
                  <span>Confirm Appointment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: Appointment Confirmation & Summary Page */}
          {/* ========================================================================= */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div>
                  <h3 className="text-base font-bold text-[#123B5D]">Review Appointment Details</h3>
                  <p className="text-xs text-[#64748B]">
                    Please verify all information before proceeding to secure payment.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#159A9C] bg-[#E8F6F6] px-2.5 py-1 rounded-full">
                  Step 2 of 4
                </span>
              </div>

              {/* Summary Breakdown Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Doctor & Schedule Card */}
                <div className="p-4 bg-[#F7FAFC] rounded-xl border border-[#E2E8F0] space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-[#123B5D] pb-2 border-b border-slate-200">
                    <Stethoscope className="w-4 h-4 text-[#1769AA]" />
                    <span>Consultation & Schedule</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Department:</span>
                      <strong className="text-[#1E293B]">{department}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Doctor:</span>
                      <strong className="text-[#123B5D]">{selectedDoctor?.fullName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Qualification:</span>
                      <span className="text-[#1E293B]">{selectedDoctor?.qualification || 'MBBS, MD'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Appointment Date:</span>
                      <strong className="text-[#1E293B]">{date}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Time Slot:</span>
                      <strong className="text-[#159A9C]">{timeSlot}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#64748B]">Visit Mode:</span>
                      <span className="px-2 py-0.5 bg-[#E8F6F6] text-[#159A9C] font-bold rounded-md">
                        {visitMode} Consultation
                      </span>
                    </div>
                  </div>
                </div>

                {/* Patient & Symptoms Card */}
                <div className="p-4 bg-[#F7FAFC] rounded-xl border border-[#E2E8F0] space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-[#123B5D] pb-2 border-b border-slate-200">
                    <User className="w-4 h-4 text-[#159A9C]" />
                    <span>Patient Information & Symptoms</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Patient Name:</span>
                      <strong className="text-[#1E293B]">{patientName}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Contact Phone:</span>
                      <strong className="text-[#1E293B]">{patientMobile}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748B]">Patient ID:</span>
                      <span className="text-[#1E293B] font-mono">{currentUser?.patientId || 'PAT-2026-1001'}</span>
                    </div>

                    {visitMode === 'Homecare' && (
                      <div className="pt-2 border-t border-slate-200">
                        <span className="text-[#64748B] block mb-1 font-semibold text-[#123B5D] flex items-center space-x-1">
                          <MapPin className="w-3.5 h-3.5 text-[#159A9C]" />
                          <span>Home Visit Address:</span>
                        </span>
                        <div className="p-2.5 bg-[#E8F6F6]/60 rounded-lg border border-[#159A9C]/30 text-xs text-[#123B5D] font-medium">
                          {homeLocation}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-200">
                      <span className="text-[#64748B] block mb-1">Symptoms / Chief Complaint:</span>
                      <div className="p-2 bg-white rounded-lg border border-[#E2E8F0] text-xs text-[#1E293B] italic">
                        "{symptoms}"
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Consultation Fee Breakdown */}
              <div className="p-4 bg-gradient-to-r from-[#E8F6F6]/50 to-sky-50 rounded-xl border border-[#159A9C]/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#64748B]">Specialist OPD Consultation Fee:</span>
                  <span className="font-semibold text-[#1E293B]">₹{consultationFee}.00</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#64748B]">Hospital Registration & Tech Charges:</span>
                  <span className="font-semibold text-[#16845B]">FREE (₹0.00)</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-bold">
                  <span className="text-[#123B5D]">Total Payable Amount:</span>
                  <span className="text-lg text-[#1769AA]">₹{totalPayable}.00</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 bg-[#F7FAFC] hover:bg-slate-100 border border-[#E2E8F0] text-[#123B5D] rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Edit Details</span>
                </button>

                <button
                  type="button"
                  id="proceed-to-payment-btn"
                  onClick={handleProceedToPayment}
                  className="px-6 py-2.5 bg-[#1769AA] hover:bg-[#123B5D] text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center space-x-2 cursor-pointer active:scale-95"
                >
                  <span>Proceed to Payment (₹{totalPayable})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: Payment Page (UPI / Card / NetBanking / Clinic Desk) */}
          {/* ========================================================================= */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div>
                  <h3 className="text-base font-bold text-[#123B5D]">Select Payment Method</h3>
                  <p className="text-xs text-[#64748B]">
                    Secure 256-bit encrypted healthcare payment checkout.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#64748B] block">Amount to Pay</span>
                  <span className="text-lg font-bold text-[#1769AA]">₹{totalPayable}.00</span>
                </div>
              </div>

              {/* Payment Method Selector Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                    paymentMethod === 'UPI'
                      ? 'border-[#159A9C] bg-[#E8F6F6]/40 font-bold text-[#123B5D]'
                      : 'border-[#E2E8F0] hover:bg-[#F7FAFC] text-[#64748B]'
                  }`}
                >
                  <QrCode className="w-5 h-5 mx-auto mb-1 text-[#159A9C]" />
                  <span className="text-xs block">UPI / QR Code</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('Card')}
                  className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                    paymentMethod === 'Card'
                      ? 'border-[#1769AA] bg-sky-50/50 font-bold text-[#123B5D]'
                      : 'border-[#E2E8F0] hover:bg-[#F7FAFC] text-[#64748B]'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mx-auto mb-1 text-[#1769AA]" />
                  <span className="text-xs block">Credit / Debit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('NetBanking')}
                  className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                    paymentMethod === 'NetBanking'
                      ? 'border-[#123B5D] bg-slate-50 font-bold text-[#123B5D]'
                      : 'border-[#E2E8F0] hover:bg-[#F7FAFC] text-[#64748B]'
                  }`}
                >
                  <Building className="w-5 h-5 mx-auto mb-1 text-[#123B5D]" />
                  <span className="text-xs block">Net Banking</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CashAtDesk')}
                  className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer ${
                    paymentMethod === 'CashAtDesk'
                      ? 'border-emerald-600 bg-emerald-50/50 font-bold text-[#123B5D]'
                      : 'border-[#E2E8F0] hover:bg-[#F7FAFC] text-[#64748B]'
                  }`}
                >
                  <Receipt className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                  <span className="text-xs block">Pay at Hospital Desk</span>
                </button>
              </div>

              {/* Payment Details Container */}
              <div className="p-5 bg-[#F7FAFC] rounded-2xl border border-[#E2E8F0]">
                
                {/* Method 1: UPI Option */}
                {paymentMethod === 'UPI' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                      <div className="text-center sm:text-left space-y-2">
                        <span className="text-xs font-bold text-[#159A9C] uppercase tracking-wider">
                          Instant Scan & Pay
                        </span>
                        <h4 className="font-bold text-sm text-[#123B5D]">
                          Scan QR with any UPI App (GPay, PhonePe, Paytm, BHIM)
                        </h4>
                        <p className="text-xs text-[#64748B]">
                          UPI ID: <strong className="text-[#1E293B]">hospital@okhdfcbank</strong>
                        </p>
                        <div className="flex items-center justify-center sm:justify-start space-x-2 pt-1">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                            Verified Merchant
                          </span>
                          <span className="text-[11px] text-[#64748B]">Auto-verifies instantly</span>
                        </div>
                      </div>

                      {/* Mock QR Box */}
                      <div className="bg-white p-3 rounded-xl border border-slate-300 shadow-xs flex flex-col items-center shrink-0">
                        <div className="w-32 h-32 bg-slate-900 rounded-lg p-2 flex items-center justify-center text-white relative">
                          <QrCode className="w-24 h-24 text-white" />
                          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#159A9C]/20 to-transparent animate-pulse rounded-lg" />
                        </div>
                        <span className="text-[10px] font-bold text-[#123B5D] mt-2">
                          Amount: ₹{totalPayable}.00
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200">
                      <label className="block text-xs font-bold text-[#1E293B] mb-1">
                        Or enter UPI ID / VPA
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="yourname@okhdfcbank"
                          className="flex-1 px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setUpiId('patient.verified@upi')}
                          className="px-3 py-2 bg-[#E8F6F6] text-[#159A9C] rounded-xl text-xs font-bold"
                        >
                          Verify VPA
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Method 2: Card Option */}
                {paymentMethod === 'Card' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-[#1E293B] mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#1E293B] mb-1">Expiry Date</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#1E293B] mb-1">CVV</label>
                        <input
                          type="password"
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Method 3: Net Banking Option */}
                {paymentMethod === 'NetBanking' && (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-[#1E293B] mb-1">Select Bank</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Bank', 'Punjab National Bank'].map((bank) => (
                        <button
                          key={bank}
                          type="button"
                          onClick={() => setSelectedBank(bank)}
                          className={`p-2.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                            selectedBank === bank
                              ? 'border-[#1769AA] bg-sky-50 font-bold text-[#1769AA]'
                              : 'border-[#E2E8F0] bg-white text-[#1E293B]'
                          }`}
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Method 4: Pay at Hospital Desk */}
                {paymentMethod === 'CashAtDesk' && (
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                    <p className="font-bold">Pay at Hospital OPD Billing Counter</p>
                    <p>
                      Your slot will be reserved immediately. You can make payment via Cash, Card, or UPI at the registration desk when checking in.
                    </p>
                  </div>
                )}

              </div>

              {/* Payment Security Notice */}
              <div className="flex items-center space-x-2 text-[11px] text-[#64748B]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>PCI-DSS Compliant • 100% Refundable if appointment cancelled up to 2 hours prior.</span>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={isProcessing}
                  className="px-4 py-2.5 bg-[#F7FAFC] hover:bg-slate-100 border border-[#E2E8F0] text-[#123B5D] rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back to Summary</span>
                </button>

                <button
                  type="button"
                  id="confirm-and-pay-btn"
                  onClick={handleConfirmAndPay}
                  disabled={isProcessing}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center space-x-2 cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing Payment...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Pay ₹{totalPayable} & Confirm Booking</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: Successful Booking Confirmation Screen */}
          {/* ========================================================================= */}
          {step === 4 && (
            <div className="text-center py-6 space-y-6 animate-fadeIn">
              
              {/* Success Badge */}
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center shadow-lg ring-8 ring-emerald-50 animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">
                  Booking Confirmed & Scheduled
                </span>
                <h2 className="text-2xl font-bold text-[#123B5D] mt-2">
                  Appointment Booked Successfully!
                </h2>
                <p className="text-xs text-[#64748B] max-w-md mx-auto">
                  Your appointment is confirmed with <strong>{createdAppointment?.doctorName}</strong>. A confirmation SMS & WhatsApp reminder have been dispatched.
                </p>
              </div>

              {/* Formal Confirmation Card */}
              <div className="max-w-lg mx-auto bg-[#F7FAFC] rounded-2xl p-6 border border-[#E2E8F0] text-left space-y-4 shadow-xs">
                
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase">Booking Reference</span>
                    <h4 className="font-mono font-bold text-base text-[#123B5D]">
                      {createdAppointment?.bookingRef || 'KLP-APT-8921'}
                    </h4>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg">
                    PAID (₹{createdAppointment?.amount})
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#64748B] block">Doctor:</span>
                    <strong className="text-[#1E293B]">{createdAppointment?.doctorName}</strong>
                    <p className="text-[11px] text-[#64748B]">{createdAppointment?.department}</p>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Appointment Schedule:</span>
                    <strong className="text-[#1E293B]">{createdAppointment?.date}</strong>
                    <p className="text-[11px] text-[#159A9C] font-semibold">{createdAppointment?.timeSlot}</p>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Visit Mode:</span>
                    <strong className="text-[#123B5D]">{createdAppointment?.visitMode} Consultation</strong>
                  </div>
                  <div>
                    <span className="text-[#64748B] block">Patient Name:</span>
                    <strong className="text-[#1E293B]">{createdAppointment?.patientName}</strong>
                  </div>
                  {createdAppointment?.visitMode === 'Homecare' && (
                    <div className="col-span-2 p-2.5 bg-[#E8F6F6] rounded-xl border border-[#159A9C]/30">
                      <span className="text-[10px] font-bold text-[#159A9C] block uppercase">Home Visit Location</span>
                      <strong className="text-xs text-[#123B5D] font-medium">{createdAppointment?.homeLocation || homeLocation}</strong>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-[#64748B] space-y-1">
                  <p className="font-semibold text-[#123B5D]">Next Steps & Instructions:</p>
                  <p>• For Clinic visit: Report at OPD Counter 3 at least 15 mins prior.</p>
                  <p>• For Homecare: Doctor and nursing staff will reach your registered address at the scheduled slot.</p>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadSlip}
                  className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-slate-100 border border-[#E2E8F0] text-[#123B5D] rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Appointment Slip</span>
                </button>

                {/* Redirect back to Scheduled Appointments on Patient Dashboard */}
                <button
                  type="button"
                  id="go-to-scheduled-appointments-btn"
                  onClick={() => setActiveTab('dashboard')}
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#1769AA] hover:bg-[#123B5D] text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-md hover:shadow-lg cursor-pointer active:scale-95"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Go to Scheduled Appointments →</span>
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
