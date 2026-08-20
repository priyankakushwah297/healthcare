import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  UserPlus,
  BarChart3,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  ArrowUpRight,
  Stethoscope,
  Activity,
  CreditCard,
  Building,
  Phone,
  PhoneCall,
  Home,
  Check,
  AlertCircle,
  BedDouble,
  Receipt
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { VisitMode, UserProfile, Appointment, Prescription } from '../../types';
import { AVAILABLE_TIME_SLOTS } from '../../data/initialData';
import { PortalSidebar } from '../layout/PortalSidebar';
import { PrescriptionPDFModal } from '../doctor/PrescriptionPDFModal';

export const ReceptionistDashboard: React.FC = () => {
  const {
    users,
    departments,
    appointments,
    prescriptions,
    bookAppointment,
    registerPatientByReceptionist,
    visitAnalytics,
    hospital,
    activeTab
  } = useHospital();

  const [activeSubTab, setActiveSubTab] = useState<string>(() => {
    return (activeTab && ['overview', 'register-patient', 'appointments', 'patient-records', 'billing'].includes(activeTab)) ? activeTab : 'overview';
  });

  const resetRegistrationFlow = () => {
    setRegStep('check-phone');
    setSearchPhone('');
    setFoundPatient(null);
    setRegOtp('123456');
    setRegMsg(null);
    setRegisteredPatientSuccess(null);
    setAptSuccess(null);
    setRegFullName('');
    setRegMobile('');
    setRegEmail('');
    setRegDob('');
    setRegAddress('');
    setRegEmergency('');
    setRegSymptoms('');
  };

  useEffect(() => {
    if (activeTab && ['overview', 'register-patient', 'appointments', 'patient-records', 'billing'].includes(activeTab)) {
      setActiveSubTab(activeTab);
      if (activeTab === 'register-patient' || activeTab === 'register') {
        resetRegistrationFlow();
      }
    }
  }, [activeTab]);

  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [aptSearchTerm, setAptSearchTerm] = useState('');
  const [aptStatusFilter, setAptStatusFilter] = useState('all');
  const [selectedPdfRx, setSelectedPdfRx] = useState<Prescription | null>(null);
  const [isPdfOpen, setIsPdfOpen] = useState(false);

  // Book Appointment State
  const [aptDept, setAptDept] = useState(departments[0]?.name || 'General Medicine');
  const [aptDoctorId, setAptDoctorId] = useState('');
  const [aptPatientId, setAptPatientId] = useState('');
  const [aptDate, setAptDate] = useState(new Date().toISOString().split('T')[0]);
  const [aptTimeSlot, setAptTimeSlot] = useState(AVAILABLE_TIME_SLOTS[0] || '10:00 AM');
  const [aptVisitMode, setAptVisitMode] = useState<VisitMode>('Clinic');
  const [aptSymptoms, setAptSymptoms] = useState('');
  const [aptSuccess, setAptSuccess] = useState<Appointment | null>(null);

  // Register Patient State
  const [regStep, setRegStep] = useState<'check-phone' | 'otp-verify' | 'register-form'>('check-phone');
  const [searchPhone, setSearchPhone] = useState('');
  const [foundPatient, setFoundPatient] = useState<UserProfile | null>(null);
  const [regOtp, setRegOtp] = useState('123456');
  const [regMsg, setRegMsg] = useState<{ type: 'error' | 'success' | 'info'; text: string } | null>(null);

  const [regFullName, setRegFullName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDob, setRegDob] = useState('');
  const [regGender, setRegGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [regBloodGroup, setRegBloodGroup] = useState('O+');
  const [regAddress, setRegAddress] = useState('');
  const [regEmergency, setRegEmergency] = useState('');
  const [regDept, setRegDept] = useState(departments[0]?.name || 'General Medicine');
  const [regDoctorId, setRegDoctorId] = useState('');
  const [regSymptoms, setRegSymptoms] = useState('');
  const [regVisitMode, setRegVisitMode] = useState<VisitMode>('Clinic');
  const [registeredPatientSuccess, setRegisteredPatientSuccess] = useState<UserProfile | null>(null);

  const doctorsList = users.filter(u => u.role === 'doctor');
  
  // Dynamic Unified Patients List
  const patientsList = React.useMemo(() => {
    const list: UserProfile[] = [];
    const seenIds = new Set<string>();
    const seenMobiles = new Set<string>();

    users.filter(u => u.role === 'patient').forEach(u => {
      const cleanMob = (u.mobile || (u as any).mobileNumber || '').replace(/[^0-9]/g, '');
      seenIds.add(u.id);
      if (u.patientId) seenIds.add(u.patientId);
      if (cleanMob) seenMobiles.add(cleanMob);
      list.push(u);
    });

    appointments.forEach(apt => {
      const cleanMob = (apt.patientMobile || '').replace(/[^0-9]/g, '');
      const hasId = apt.patientId && seenIds.has(apt.patientId);
      const hasMobile = cleanMob && seenMobiles.has(cleanMob);

      if (!hasId && !hasMobile && apt.patientName) {
        const id = apt.patientId || `pat-${cleanMob || Date.now()}`;
        seenIds.add(id);
        if (cleanMob) seenMobiles.add(cleanMob);

        list.push({
          id,
          role: 'patient',
          fullName: apt.patientName,
          mobile: apt.patientMobile || '9876543201',
          patientId: apt.patientId || `PAT-${apt.bookingRef}`,
          gender: (apt.patientGender as any) || 'Female',
          dobOrAge: apt.patientAge || '28 Years',
          bloodGroup: 'O+',
          address: apt.homeLocation || 'Local Residence',
          createdAt: apt.createdAt || new Date().toISOString().split('T')[0]
        });
      }
    });

    return list;
  }, [users, appointments]);

  // Distinct Appointments (Deduplicated so each patient shows only 1 time for today/slot)
  const distinctAppointments = React.useMemo(() => {
    const seen = new Set<string>();
    const list: Appointment[] = [];

    appointments.forEach(a => {
      const cleanMob = (a.patientMobile || '').replace(/[^0-9]/g, '');
      const cleanName = (a.patientName || '').trim().toLowerCase();
      const key = `${cleanMob || cleanName}_${a.date || 'today'}`;
      if (!seen.has(key)) {
        seen.add(key);
        list.push(a);
      }
    });

    return list;
  }, [appointments]);

  // Filtered doctors based on selected department
  const filteredAptDoctors = doctorsList.filter(d => !aptDept || d.department === aptDept);

  const handleCheckMobile = (e: React.FormEvent) => {
    e.preventDefault();
    setRegMsg(null);
    const clean = searchPhone.replace(/[^0-9]/g, '');
    if (clean.length < 10) {
      setRegMsg({ type: 'error', text: 'Please enter a valid 10-digit mobile number.' });
      return;
    }

    const found = patientsList.find(p => {
      const pMob = (p.mobile || (p as any).mobileNumber || '').replace(/[^0-9]/g, '');
      return pMob === clean;
    }) || users.find(u => {
      const uMob = (u.mobile || (u as any).mobileNumber || '').replace(/[^0-9]/g, '');
      return uMob === clean;
    });

    if (found) {
      setFoundPatient(found);
      setRegStep('otp-verify');
      setRegOtp('123456');
      setRegMobile(clean);
      setRegMsg({
        type: 'success',
        text: `Registered Patient Found: ${found.fullName} (UHID: ${found.patientId || found.id}). Enter OTP to verify & issue walk-in token.`
      });
    } else {
      setFoundPatient(null);
      setRegMobile(clean);
      setRegFullName('');
      setRegEmail('');
      setRegDob('');
      setRegStep('register-form');
      setRegMsg({
        type: 'info',
        text: `New walk-in patient (+91 ${clean}). Please fill the registration form below.`
      });
    }
  };

  const handleVerifyOtpAndBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundPatient) return;
    if (regOtp.length < 4) {
      setRegMsg({ type: 'error', text: 'Please enter the 6-digit OTP (Universal demo: 123456)' });
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const cleanFoundMob = (foundPatient.mobile || searchPhone).replace(/[^0-9]/g, '');
    const cleanFoundName = (foundPatient.fullName || '').trim().toLowerCase();

    // Check if patient already has an active OPD token for today
    const existingApt = appointments.find(a => {
      const cleanAptMob = (a.patientMobile || '').replace(/[^0-9]/g, '');
      const cleanAptName = (a.patientName || '').trim().toLowerCase();
      const isSamePatient = (cleanFoundMob && cleanAptMob === cleanFoundMob) ||
                            (cleanFoundName && cleanAptName === cleanFoundName) ||
                            (a.patientId === foundPatient.id);
      const isToday = a.date === todayStr || a.status === 'today';
      return isSamePatient && isToday && a.status !== 'completed' && a.status !== 'Completed';
    });

    let targetApt: Appointment;
    if (existingApt) {
      targetApt = existingApt;
      setRegMsg({
        type: 'success',
        text: `Active OPD Token already exists for ${foundPatient.fullName} (Ref: ${existingApt.bookingRef}). Verified for today's visit!`
      });
    } else {
      const docObj = doctorsList.find(d => d.id === regDoctorId) || doctorsList[0];
      targetApt = await bookAppointment({
        patientId: foundPatient.id,
        patientName: foundPatient.fullName,
        patientMobile: foundPatient.mobile || searchPhone,
        patientGender: foundPatient.gender,
        patientAge: foundPatient.dobOrAge,
        doctorId: docObj?.id || 'DOC-KLP-101',
        doctorName: docObj?.fullName || 'Dr. Arvind Sharma',
        doctorSpecialization: docObj?.specialization || 'Consultant',
        department: regDept,
        date: todayStr,
        timeSlot: '11:00 AM - 11:30 AM',
        visitMode: regVisitMode || 'Clinic',
        symptoms: regSymptoms || 'Reception Walk-in OPD Consultation',
        status: 'today',
        paymentStatus: 'paid',
        consultationFee: docObj?.consultationFee || 700
      });
    }

    setRegisteredPatientSuccess(foundPatient);
    setAptSuccess(targetApt);
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const docObj = doctorsList.find(d => d.id === aptDoctorId) || doctorsList[0];
    const patObj = patientsList.find(p => p.id === aptPatientId) || patientsList[0];

    const newApt = await bookAppointment({
      patientId: patObj?.id || 'PAT-101',
      patientName: patObj?.fullName || 'Walk-in Patient',
      patientMobile: patObj?.mobile || '',
      doctorId: docObj?.id || 'DOC-KLP-101',
      doctorName: docObj?.fullName || 'Dr. Arvind Sharma',
      department: aptDept,
      date: aptDate,
      timeSlot: aptTimeSlot,
      visitMode: aptVisitMode,
      symptoms: aptSymptoms,
      status: 'upcoming',
      paymentStatus: 'paid',
      consultationFee: docObj?.consultationFee || 700
    });

    setAptSuccess(newApt);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newUser = await registerPatientByReceptionist({
      fullName: regFullName,
      mobile: regMobile,
      email: regEmail,
      dobOrAge: regDob,
      gender: regGender,
      bloodGroup: regBloodGroup,
      address: regAddress,
      emergencyContact: regEmergency
    });

    setRegisteredPatientSuccess(newUser);
  };

  return (
    <div className="flex flex-col lg:flex-row items-start gap-6 animate-fadeIn font-sans">
      {/* LEFT: Unified Role Sidebar (Hidden on mobile, Drawer opened from top-right Hamburger) */}
      <div className="hidden lg:block lg:w-72 shrink-0 lg:sticky lg:top-20 self-start z-20">
        <PortalSidebar
          currentSubTab={activeSubTab}
          onSelectSubTab={(tabId) => {
            setActiveSubTab(tabId);
            if (tabId === 'register-patient' || tabId === 'register') {
              resetRegistrationFlow();
            } else {
              setAptSuccess(null);
              setRegisteredPatientSuccess(null);
            }
          }}
        />
      </div>

      {/* RIGHT: Dynamic Sub-View */}
      <div className="flex-1 w-full min-w-0 space-y-6">
        {/* 1. OVERVIEW & ANALYTICS */}
        {(activeSubTab === 'overview' || activeSubTab === 'dashboard') && (
        <div className="space-y-6">
          {/* Key Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="apple-card p-5 space-y-1">
              <p className="text-xs font-medium text-[#64748B]">Total Visited Today</p>
              <p className="text-2xl font-extrabold text-[#123B5D] mt-1">{visitAnalytics.totalVisitedToday || 42}</p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">↑ +14% vs yesterday</p>
            </div>

            <div className="apple-card p-5 space-y-1">
              <p className="text-xs font-medium text-[#64748B]">New Registrations</p>
              <p className="text-2xl font-extrabold text-[#1769AA] mt-1">{visitAnalytics.newPatients || 18}</p>
              <p className="text-[11px] text-[#1769AA] font-semibold mt-0.5">First-time visitors</p>
            </div>

            <div className="apple-card p-5 space-y-1">
              <p className="text-xs font-medium text-[#64748B]">Returning Patients</p>
              <p className="text-2xl font-extrabold text-[#159A9C] mt-1">{visitAnalytics.returningPatients || 24}</p>
              <p className="text-[11px] text-[#159A9C] font-semibold mt-0.5">Follow-up visits</p>
            </div>

            <div className="apple-card p-5 space-y-1">
              <p className="text-xs font-medium text-[#64748B]">Monthly Patient Volume</p>
              <p className="text-2xl font-extrabold text-[#123B5D] mt-1">1,380</p>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Current Month Total</p>
            </div>

          </div>

          {/* Daily & Monthly Analytics Charts / Visual Representation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Daily Visits Chart */}
            <div className="apple-card p-6 space-y-4">
              <h3 className="font-bold text-base text-[#123B5D]">Daily Patient Visits (This Week)</h3>
              <div className="h-44 flex items-end justify-between gap-3 pt-6 px-2">
                {[
                  { day: 'Mon', count: 38 },
                  { day: 'Tue', count: 45 },
                  { day: 'Wed', count: 42 },
                  { day: 'Thu', count: 50 },
                  { day: 'Fri', count: 49 },
                  { day: 'Sat', count: 35 },
                  { day: 'Sun', count: 20 },
                ].map((item, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-[10px] font-bold text-[#123B5D]">{item.count}</span>
                    <div
                      style={{ height: `${(item.count / 50) * 100}%` }}
                      className="w-full bg-gradient-to-t from-[#123B5D] to-[#1769AA] hover:to-[#38BDF8] rounded-t-lg transition-all duration-300 cursor-pointer shadow-xs"
                      title={`${item.count} patients on ${item.day}`}
                    />
                    <span className="text-xs font-semibold text-[#64748B]">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Department-wise Breakdown */}
            <div className="apple-card p-6 space-y-4">
              <h3 className="font-bold text-base text-[#123B5D]">Department-wise Patient Visits</h3>
              <div className="space-y-3">
                {[
                  { name: 'General Medicine', count: 14, percent: '33%' },
                  { name: 'Cardiology', count: 10, percent: '24%' },
                  { name: 'Pediatrics', count: 8, percent: '19%' },
                  { name: 'Orthopedics', count: 6, percent: '14%' },
                  { name: 'Dermatology', count: 4, percent: '10%' },
                ].map((dept, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-[#123B5D]">
                      <span>{dept.name}</span>
                      <span>{dept.count} Visits ({dept.percent})</span>
                    </div>
                    <div className="w-full bg-[#F7FAFC] h-2 rounded-full overflow-hidden border border-[#E2E8F0]">
                      <div
                        style={{ width: dept.percent }}
                        className="bg-[#159A9C] h-full rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}        {/* 2. REGISTER NEW PATIENT */}
        {(activeSubTab === 'register-patient' || activeSubTab === 'register') && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E2E8F0] shadow-xs space-y-6 animate-fadeIn">
            <div className="border-b border-[#E2E8F0] pb-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-[#123B5D]">Walk-in Patient OPD Registration</h3>
                <p className="text-xs text-[#64748B]">Verify patient mobile number with OTP or register a new walk-in patient profile.</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                Live SQLite Sync
              </span>
            </div>

            {/* Status Feedback Message */}
            {regMsg && (
              <div className={`p-3.5 rounded-xl text-xs font-medium flex items-center space-x-2 animate-fadeIn ${
                regMsg.type === 'error' ? 'bg-rose-50 border border-rose-200 text-rose-800' :
                regMsg.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' :
                'bg-sky-50 border border-sky-200 text-sky-800'
              }`}>
                {regMsg.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" /> :
                 regMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> :
                 <Search className="w-4 h-4 text-[#1769AA] shrink-0" />}
                <span>{regMsg.text}</span>
              </div>
            )}

            {/* CASE A: Registration & Booking Success Confirmation */}
            {registeredPatientSuccess ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4 animate-fadeIn">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <div>
                  <h4 className="font-bold text-base text-emerald-900">Patient Processed Successfully!</h4>
                  <p className="text-xs text-emerald-700 mt-1">
                    Unique Patient ID: <strong className="font-mono text-sm">{registeredPatientSuccess.patientId || registeredPatientSuccess.id}</strong>
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {registeredPatientSuccess.fullName} • {registeredPatientSuccess.mobile || registeredPatientSuccess.mobileNumber}
                  </p>
                  {aptSuccess && (
                    <p className="text-xs text-[#1769AA] font-semibold mt-1">
                      OPD Token Ref: <strong className="font-mono">{aptSuccess.bookingRef}</strong> | Doctor: {aptSuccess.doctorName} ({aptSuccess.department})
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setRegisteredPatientSuccess(null);
                      setAptSuccess(null);
                      setSearchPhone('');
                      setRegStep('check-phone');
                      setFoundPatient(null);
                      setRegMsg(null);
                    }}
                    className="px-5 py-2.5 bg-[#1769AA] text-white rounded-xl text-xs font-bold hover:bg-[#123B5D] transition-colors cursor-pointer shadow-xs"
                  >
                    + Check / Register Next Patient
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveSubTab('appointments')}
                    className="px-5 py-2.5 bg-white text-[#123B5D] border border-slate-300 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    View in OPD Appointments Queue
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* STEP 1: MOBILE NUMBER SEARCH / CHECK */}
                {regStep === 'check-phone' && (
                  <form onSubmit={handleCheckMobile} className="space-y-4 max-w-lg mx-auto py-4 animate-fadeIn">
                    <div className="text-center space-y-1 mb-4">
                      <div className="w-12 h-12 bg-sky-50 text-[#1769AA] rounded-2xl flex items-center justify-center mx-auto mb-2 border border-sky-100 shadow-2xs">
                        <Phone className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-sm text-[#123B5D]">Enter Patient Mobile Number</h4>
                      <p className="text-xs text-[#64748B]">System will automatically detect existing registered patients or initiate new registration.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#123B5D] mb-1.5">
                        Patient 10-Digit Mobile Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-3 text-xs font-bold text-slate-400">+91</span>
                        <input
                          type="tel"
                          value={searchPhone}
                          onChange={(e) => setSearchPhone(e.target.value)}
                          placeholder="e.g. 9876543201"
                          maxLength={10}
                          className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#123B5D] focus:bg-white focus:border-[#1769AA] focus:outline-none transition-all"
                          required
                          autoFocus
                        />
                        <Phone className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#1769AA] hover:bg-[#123B5D] text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer shadow-md transition-all"
                    >
                      <Search className="w-4 h-4" />
                      <span>Check &amp; Verify Patient</span>
                    </button>
                  </form>
                )}

                {/* STEP 2 (A): REGISTERED PATIENT FOUND -> OTP VERIFICATION & INSTANT OPD BOOKING */}
                {regStep === 'otp-verify' && foundPatient && (
                  <form onSubmit={handleVerifyOtpAndBook} className="space-y-5 animate-fadeIn">
                    
                    {/* Patient Found Profile Card */}
                    <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#123B5D] to-[#159A9C] text-white flex items-center justify-center font-bold text-base shadow-2xs">
                          {foundPatient.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-bold text-sm text-[#123B5D]">{foundPatient.fullName}</h4>
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded text-[10px] font-bold border border-emerald-200">
                              ✓ Registered Patient
                            </span>
                          </div>
                          <p className="text-xs text-[#64748B] mt-0.5">
                            UHID: <strong className="font-mono text-[#159A9C]">{foundPatient.patientId || foundPatient.id}</strong> • 📞 {foundPatient.mobile || searchPhone} • {foundPatient.gender}, {foundPatient.dobOrAge || '28 Years'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setRegStep('check-phone')}
                        className="text-xs font-bold text-[#1769AA] hover:underline cursor-pointer"
                      >
                        Change Mobile
                      </button>
                    </div>

                    {/* OTP Verification Box */}
                    <div className="bg-sky-50/70 p-4 rounded-2xl border border-sky-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-[#123B5D]">
                          Enter Patient Verification OTP <span className="text-rose-500">*</span>
                        </label>
                        <span className="text-[11px] font-semibold text-[#1769AA] bg-white px-2.5 py-0.5 rounded-full border border-sky-200">
                          Universal Demo OTP: <strong className="font-mono text-slate-900">123456</strong>
                        </span>
                      </div>
                      <input
                        type="text"
                        value={regOtp}
                        onChange={(e) => setRegOtp(e.target.value)}
                        placeholder="123456"
                        maxLength={6}
                        className="w-full text-center text-xl font-mono font-bold tracking-[0.25em] py-2.5 bg-white border border-slate-200 rounded-xl text-[#123B5D] focus:border-[#1769AA] focus:outline-none transition-all"
                        required
                      />
                    </div>

                    {/* Doctor & Department for Walk-in OPD */}
                    <div className="border-t border-slate-200 pt-4 space-y-3">
                      <h4 className="font-bold text-xs text-[#123B5D] uppercase tracking-wider">Instant OPD Consultation Slot</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block font-semibold text-[#123B5D] mb-1">Department</label>
                          <select
                            value={regDept}
                            onChange={(e) => setRegDept(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[#1E293B] focus:border-[#1769AA] focus:outline-none"
                          >
                            {departments.map((d) => (
                              <option key={d.name} value={d.name}>{d.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold text-[#123B5D] mb-1">Consulting Doctor</label>
                          <select
                            value={regDoctorId}
                            onChange={(e) => setRegDoctorId(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[#1E293B] focus:border-[#1769AA] focus:outline-none"
                          >
                            <option value="">-- Any Available Doctor --</option>
                            {doctorsList.filter(d => !regDept || d.department === regDept).map((doc) => (
                              <option key={doc.id} value={doc.id}>{doc.fullName} ({doc.specialization})</option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-semibold text-[#123B5D] mb-1">Chief Symptoms / Reason</label>
                          <input
                            type="text"
                            value={regSymptoms}
                            onChange={(e) => setRegSymptoms(e.target.value)}
                            placeholder="e.g. Routine consultation, Follow-up review..."
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[#1E293B] focus:border-[#1769AA] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setRegStep('check-phone')}
                        className="w-1/3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 py-3 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                      >
                        ← Back
                      </button>
                      <button
                        type="submit"
                        className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-xs font-bold cursor-pointer shadow-md transition-colors flex items-center justify-center space-x-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verify OTP &amp; Issue OPD Token</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* STEP 2 (B): NEW PATIENT REGISTRATION FORM */}
                {regStep === 'register-form' && (
                  <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs animate-fadeIn">
                    
                    <div className="bg-sky-50 p-3 rounded-xl border border-sky-200 text-xs text-[#123B5D] flex items-center justify-between">
                      <div>
                        <p className="font-bold">New Walk-in Patient Profile Creation</p>
                        <p className="text-[11px] text-[#64748B]">Mobile Number: <strong className="font-mono text-[#123B5D]">+91 {regMobile}</strong></p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setRegStep('check-phone')}
                        className="text-xs font-bold text-[#1769AA] hover:underline cursor-pointer"
                      >
                        Change Mobile
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-[#123B5D] mb-1">Patient Full Name *</label>
                        <input
                          type="text"
                          required
                          value={regFullName}
                          onChange={(e) => setRegFullName(e.target.value)}
                          placeholder="e.g. Ramesh Kumar"
                          className="w-full px-3 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#1E293B] focus:border-[#1769AA] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-[#123B5D] mb-1">Mobile Number *</label>
                        <input
                          type="tel"
                          required
                          value={regMobile}
                          onChange={(e) => setRegMobile(e.target.value)}
                          placeholder="10-digit mobile number"
                          className="w-full px-3 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#1E293B] focus:border-[#1769AA] focus:outline-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-[#123B5D] mb-1">Email Address</label>
                        <input
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="patient@example.com"
                          className="w-full px-3 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#1E293B] focus:border-[#1769AA] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-[#123B5D] mb-1">Date of Birth (DOB)</label>
                        <input
                          type="date"
                          value={regDob}
                          onChange={(e) => setRegDob(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#1E293B] focus:border-[#1769AA] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-[#123B5D] mb-1">Gender</label>
                        <select
                          value={regGender}
                          onChange={(e) => setRegGender(e.target.value as any)}
                          className="w-full px-3 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#1E293B] focus:border-[#1769AA] focus:outline-none"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-[#123B5D] mb-1">Blood Group</label>
                        <select
                          value={regBloodGroup}
                          onChange={(e) => setRegBloodGroup(e.target.value)}
                          className="w-full px-3 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#1E293B] focus:border-[#1769AA] focus:outline-none"
                        >
                          {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-[#123B5D] mb-1">Residential Address</label>
                        <input
                          type="text"
                          value={regAddress}
                          onChange={(e) => setRegAddress(e.target.value)}
                          placeholder="Address / City"
                          className="w-full px-3 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#1E293B]"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-[#123B5D] mb-1">Emergency Contact</label>
                        <input
                          type="text"
                          value={regEmergency}
                          onChange={(e) => setRegEmergency(e.target.value)}
                          placeholder="Emergency relative contact number"
                          className="w-full px-3 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#1E293B]"
                        />
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-4 space-y-3">
                      <h4 className="font-bold text-xs text-[#123B5D] uppercase tracking-wider">Initial OPD Doctor Assignment</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-[#123B5D] mb-1">Department</label>
                          <select
                            value={regDept}
                            onChange={(e) => setRegDept(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[#1E293B]"
                          >
                            {departments.map((d) => (
                              <option key={d.name} value={d.name}>{d.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block font-semibold text-[#123B5D] mb-1">Consulting Doctor</label>
                          <select
                            value={regDoctorId}
                            onChange={(e) => setRegDoctorId(e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[#1E293B]"
                          >
                            <option value="">-- Any Available Doctor --</option>
                            {doctorsList.filter(d => !regDept || d.department === regDept).map((doc) => (
                              <option key={doc.id} value={doc.id}>{doc.fullName} ({doc.specialization})</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setRegStep('check-phone')}
                        className="w-1/3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 py-3 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                      >
                        ← Back
                      </button>
                      <button
                        type="submit"
                        className="w-2/3 bg-[#1769AA] hover:bg-[#123B5D] text-white py-3 rounded-xl text-xs font-bold cursor-pointer shadow-xs transition-colors"
                      >
                        Register Patient &amp; Generate Patient Record
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        )}

        {/* 3. APPOINTMENTS & OPD QUEUE */}
        {(activeSubTab === 'appointments' || activeSubTab === 'book') && (
          <div className="space-y-6 animate-fadeIn">
            {/* Book Walk-in Form Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E2E8F0] shadow-xs space-y-4">
              <div className="border-b border-[#E2E8F0] pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-[#123B5D]">Book OPD Consultation Appointment</h3>
                  <p className="text-xs text-[#64748B]">Schedule patient doctor visits and issue booking token numbers.</p>
                </div>
              </div>

              {aptSuccess ? (
                <div className="p-4 bg-sky-50 border border-sky-200 rounded-xl text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-[#1769AA] mx-auto" />
                  <p className="text-xs font-bold text-[#123B5D]">Appointment Scheduled Successfully!</p>
                  <p className="text-xs text-slate-600">Booking Ref: <strong className="font-mono">{aptSuccess.bookingRef}</strong> | Doctor: {aptSuccess.doctorName}</p>
                  <button
                    type="button"
                    onClick={() => setAptSuccess(null)}
                    className="px-4 py-2 bg-[#1769AA] text-white rounded-lg text-xs font-bold"
                  >
                    + Book Another Appointment
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBookSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-[#123B5D] mb-1">Department</label>
                    <select
                      value={aptDept}
                      onChange={(e) => setAptDept(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg"
                    >
                      {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#123B5D] mb-1">Doctor</label>
                    <select
                      value={aptDoctorId}
                      onChange={(e) => setAptDoctorId(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg"
                    >
                      <option value="">Select Doctor</option>
                      {filteredAptDoctors.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#123B5D] mb-1">Patient</label>
                    <select
                      value={aptPatientId}
                      onChange={(e) => setAptPatientId(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg"
                    >
                      <option value="">Select Patient</option>
                      {patientsList.map(p => <option key={p.id} value={p.id}>{p.fullName} ({p.patientId || p.id})</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#123B5D] mb-1">Date</label>
                    <input
                      type="date"
                      value={aptDate}
                      onChange={(e) => setAptDate(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#123B5D] mb-1">Time Slot</label>
                    <select
                      value={aptTimeSlot}
                      onChange={(e) => setAptTimeSlot(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg"
                    >
                      {AVAILABLE_TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full bg-[#1769AA] hover:bg-[#123B5D] text-white py-2.5 rounded-lg font-bold text-xs cursor-pointer shadow-xs transition-colors"
                    >
                      Confirm Booking
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* OPD Appointments Table with Live Search & Filter */}
            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <h3 className="font-bold text-sm text-[#123B5D]">Today's Scheduled OPD Consultations ({distinctAppointments.length})</h3>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-60">
                    <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search patient, token, doctor..."
                      value={aptSearchTerm}
                      onChange={(e) => setAptSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs focus:border-[#1769AA] focus:outline-none"
                    />
                  </div>

                  <select
                    value={aptStatusFilter}
                    onChange={(e) => setAptStatusFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#1E293B]"
                  >
                    <option value="all">All Status</option>
                    <option value="today">Today</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] text-[#64748B] border-b border-[#E2E8F0]">
                    <tr>
                      <th className="py-2.5 px-3">Token Ref</th>
                      <th className="py-2.5 px-3">Patient</th>
                      <th className="py-2.5 px-3">Doctor / Dept</th>
                      <th className="py-2.5 px-3">Time</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {distinctAppointments.filter(a => {
                      const matchesSearch = !aptSearchTerm ||
                        a.patientName.toLowerCase().includes(aptSearchTerm.toLowerCase()) ||
                        a.bookingRef.toLowerCase().includes(aptSearchTerm.toLowerCase()) ||
                        a.doctorName.toLowerCase().includes(aptSearchTerm.toLowerCase()) ||
                        a.department.toLowerCase().includes(aptSearchTerm.toLowerCase());
                      const matchesStatus = aptStatusFilter === 'all' || a.status === aptStatusFilter;
                      return matchesSearch && matchesStatus;
                    }).map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#1769AA]">{a.bookingRef}</td>
                        <td className="py-2.5 px-3 font-semibold text-[#123B5D]">{a.patientName}</td>
                        <td className="py-2.5 px-3 text-slate-700">{a.doctorName} ({a.department})</td>
                        <td className="py-2.5 px-3 text-slate-500">{a.date} • {a.timeSlot}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200 uppercase">
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. PATIENT RECORDS & PRESCRIPTION SLIPS */}
        {activeSubTab === 'patient-records' && (
          <div className="space-y-6 animate-fadeIn text-xs">
            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-base text-[#123B5D]">Patient Records &amp; Prescription Checking</h3>
                  <p className="text-[#64748B]">Look up patient by mobile number or Patient ID to check clinical diagnoses &amp; print prescription slips.</p>
                </div>
              </div>

              {/* Patient Lookup Search */}
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search patient by mobile, name, or ID..."
                  value={patientSearchTerm}
                  onChange={(e) => setPatientSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl text-xs focus:border-[#1769AA] focus:outline-none"
                />
              </div>

              {/* Prescriptions & Medical Slips Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#F8FAFC] text-[#64748B] border-b border-[#E2E8F0] font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Rx Reference</th>
                      <th className="py-2.5 px-3">Patient Details</th>
                      <th className="py-2.5 px-3">Doctor / Department</th>
                      <th className="py-2.5 px-3">Clinical Diagnosis</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3 text-right">Official Slip</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {prescriptions.filter(p => 
                      !patientSearchTerm ||
                      p.patientName.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
                      p.patientId.toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
                      (p.patientMobile && p.patientMobile.includes(patientSearchTerm))
                    ).map((rx) => (
                      <tr key={rx.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#1769AA]">{rx.prescriptionNumber}</td>
                        <td className="py-2.5 px-3">
                          <p className="font-bold text-[#123B5D]">{rx.patientName}</p>
                          <p className="text-[10px] text-[#64748B] font-mono">{rx.patientId} • {rx.patientMobile || '+91 9876543201'}</p>
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          <p className="font-semibold">{rx.doctorName}</p>
                          <p className="text-[10px] text-[#64748B]">{rx.department || rx.doctorSpecialization}</p>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-[#1E293B] max-w-xs truncate">
                          {rx.diagnosis}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">{rx.date}</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedPdfRx(rx);
                              setIsPdfOpen(true);
                            }}
                            className="bg-[#1769AA] hover:bg-[#123B5D] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                          >
                            Print Rx PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 5. OPD BILLING */}
        {activeSubTab === 'billing' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E2E8F0] shadow-xs space-y-6 animate-fadeIn text-xs">
            <div className="border-b border-[#E2E8F0] pb-3">
              <h3 className="font-bold text-base text-[#123B5D]">OPD Billing &amp; Receipts</h3>
              <p className="text-[#64748B]">Generate invoice receipts and record consultation payments.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#F8FAFC] text-[#64748B] border-b border-[#E2E8F0]">
                  <tr>
                    <th className="py-2.5 px-3">Invoice #</th>
                    <th className="py-2.5 px-3">Patient</th>
                    <th className="py-2.5 px-3">Service</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {appointments.slice(0, 8).map((a, idx) => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono text-[#1769AA]">INV-2026-{1000 + idx}</td>
                      <td className="py-2.5 px-3 font-semibold text-[#123B5D]">{a.patientName}</td>
                      <td className="py-2.5 px-3 text-slate-600">OPD Consultation ({a.department})</td>
                      <td className="py-2.5 px-3 font-bold text-[#123B5D]">₹{a.consultationFee || 700}</td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          PAID
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Official Prescription PDF Viewer & Print Modal */}
      <PrescriptionPDFModal
        isOpen={isPdfOpen}
        onClose={() => setIsPdfOpen(false)}
        prescription={selectedPdfRx}
        hospital={hospital}
      />
    </div>
  );
};
