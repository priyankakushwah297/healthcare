import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Phone,
  KeyRound,
  User,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  HeartPulse
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { UserRole } from '../../types';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    checkPhoneExists,
    requestOtp,
    verifyOtpAndLogin,
    registerAndLogin,
    prefillRole,
    staff,
    users,
    hospital
  } = useHospital();

  const [step, setStep] = useState<'phone' | 'register' | 'otp'>('phone');
  const [phone, setPhone] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [role, setRole] = useState<UserRole>('patient');
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  
  // Registration fields
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [specialization, setSpecialization] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [dobOrAge, setDobOrAge] = useState<string>('2000-01-01');
  const [bloodGroup, setBloodGroup] = useState<string>('O+');
  
  // UI states
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  useEffect(() => {
    if (prefillRole) {
      setRole(prefillRole);
    }
  }, [prefillRole]);

  useEffect(() => {
    if (!isAuthModalOpen) {
      setStep('phone');
      setPhone('');
      setOtp('');
      setIsNewUser(false);
      setErrorMsg('');
      setSuccessMsg('');
      setLoading(false);
      setFullName('');
      setEmail('');
      setDobOrAge('2000-01-01');
    }
  }, [isAuthModalOpen]);

  const quickAccounts = React.useMemo(() => {
    const list: any[] = [];
    
    // 1. Admin
    const adminUser = users.find(u => u.role === 'admin');
    if (adminUser) {
      list.push({
        role: 'admin' as const,
        id: adminUser.id,
        fullName: adminUser.fullName,
        label: 'Admin Hub',
        mobile: adminUser.mobile,
        color: 'text-[#1769AA] bg-sky-50 border-sky-200',
        colSpan: ''
      });
    }

    // 2. Active Technician (ONLY IF NOT DELETED)
    const techMember = staff.find(s => (s.type === 'technician' || s.staffType === 'technician') && s.isActive !== false) ||
                       users.find(u => u.role === 'technician' && u.isActive !== false);
    if (techMember) {
      list.push({
        role: 'technician' as const,
        id: techMember.id,
        fullName: techMember.fullName || (techMember as any).name || 'Technician Officer',
        label: 'Technician',
        mobile: techMember.mobile,
        color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
        colSpan: ''
      });
    }

    // 3. Doctor
    const docMember = staff.find(s => (s.type === 'doctor' || s.staffType === 'doctor') && s.isActive !== false) ||
                      users.find(u => u.role === 'doctor' && u.isActive !== false);
    if (docMember) {
      list.push({
        role: 'doctor' as const,
        id: docMember.id,
        fullName: docMember.fullName || (docMember as any).name || 'Doctor',
        label: 'Doctor Console',
        mobile: docMember.mobile,
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        colSpan: ''
      });
    }

    // 4. Receptionist
    const recMember = staff.find(s => (s.type === 'receptionist' || s.staffType === 'receptionist') && s.isActive !== false) ||
                      users.find(u => u.role === 'receptionist' && u.isActive !== false);
    if (recMember) {
      list.push({
        role: 'receptionist' as const,
        id: recMember.id,
        fullName: recMember.fullName || (recMember as any).name || 'Receptionist',
        label: 'Receptionist',
        mobile: recMember.mobile,
        color: 'text-teal-700 bg-teal-50 border-teal-200',
        colSpan: ''
      });
    }

    // 5. Patient
    const patMember = users.find(u => u.role === 'patient');
    if (patMember) {
      list.push({
        role: 'patient' as const,
        id: patMember.id,
        fullName: patMember.fullName,
        label: 'Patient Portal',
        mobile: patMember.mobile,
        color: 'text-sky-700 bg-sky-50 border-sky-200',
        colSpan: list.length % 2 === 1 ? 'col-span-2' : ''
      });
    }

    return list;
  }, [users, staff]);

  if (!isAuthModalOpen) return null;

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const res = checkPhoneExists(cleanPhone);
      
      if (res && res.exists && res.user) {
        await requestOtp(cleanPhone);
        setIsNewUser(false);
        setStep('otp');
        setOtp('123456'); // Pre-fill mock universal OTP
        setSuccessMsg(`Welcome back, ${res.user.fullName}! Verification OTP 123456 sent to +91 ${cleanPhone}`);
      } else {
        await requestOtp(cleanPhone);
        setIsNewUser(true);
        setStep('register');
        setSuccessMsg(`New mobile number detected. Please enter registration details to create your ${role} profile.`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      await requestOtp(cleanPhone);
      setStep('otp');
      setOtp('123456');
      setSuccessMsg(`Verification code sent to +91 ${cleanPhone}. Enter 123456 to complete registration.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error requesting OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (otp.length < 4) {
      setErrorMsg('Please enter the OTP verification code.');
      return;
    }

    setLoading(true);
    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      if (isNewUser) {
        const res = await registerAndLogin({
          fullName,
          mobile: cleanPhone,
          mobileNumber: cleanPhone,
          email: email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
          dobOrAge,
          gender,
          bloodGroup,
          role,
          specialization: role === 'doctor' ? specialization || 'General Physician' : undefined,
          department: role === 'doctor' || role === 'staff' ? department || 'General Medicine' : undefined
        });

        if (res && res.success) {
          closeAuthModal();
        } else {
          setErrorMsg(res?.message || 'Registration failed. Please check your information.');
        }
      } else {
        const res = await verifyOtpAndLogin(cleanPhone, otp);
        if (res && res.success) {
          closeAuthModal();
        } else {
          setErrorMsg(res?.message || 'Invalid OTP code. Please enter 123456 for testing.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (u: { mobile: string; role: UserRole; fullName: string; label: string }) => {
    setLoading(true);
    setErrorMsg('');
    setPhone(u.mobile);
    setRole(u.role);
    setIsNewUser(false);
    await requestOtp(u.mobile);
    setOtp('123456');
    setStep('otp');
    setSuccessMsg(`Selected ${u.fullName} (${u.label}). Verification OTP 123456 is ready.`);
    setLoading(false);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn font-sans"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', margin: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 max-w-md w-full max-h-[92vh] flex flex-col overflow-hidden animate-scaleIn transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dynamic Hospital Header */}
        <div className="bg-gradient-to-r from-[#123B5D] via-[#1769AA] to-[#123B5D] text-white p-4 sm:p-5 relative flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-white p-1 flex items-center justify-center border border-white/40 shadow-sm shrink-0 overflow-hidden">
              {hospital?.logo ? (
                <img src={hospital.logo} alt={hospital.name || 'Logo'} className="w-full h-full object-contain" />
              ) : (
                <HeartPulse className="w-6 h-6 text-[#1769AA]" />
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight !text-white text-white drop-shadow-xs">
                {hospital?.name || 'Healthcare Center'}
              </h3>
              <p className="text-xs text-sky-100 font-medium opacity-95">
                {hospital?.tagline || 'Secure Healthcare Authentication'}
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* Status Messages */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center space-x-2 animate-fadeIn font-medium">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2 animate-fadeIn font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* STEP 1: Phone Login */}
          {step === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#123B5D] mb-1.5">
                  Mobile Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center bg-white border-2 border-slate-300 rounded-xl focus-within:border-[#1769AA] focus-within:ring-4 focus-within:ring-sky-500/20 shadow-xs transition-all">
                  <span className="pl-3.5 pr-2 py-2.5 text-xs font-bold text-slate-800 select-none shrink-0 border-r border-slate-200">+91</span>
                  <input
                    id="auth-mobile-input"
                    type="tel"
                    inputMode="numeric"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Enter 10-digit mobile number"
                    maxLength={10}
                    autoFocus
                    className="w-full px-3 py-2.5 bg-transparent border-0 text-sm text-slate-900 font-bold placeholder:text-slate-400 placeholder:font-normal focus:outline-none caret-[#1769AA]"
                    required
                  />
                  <Phone className="mr-3.5 w-4 h-4 text-slate-400 shrink-0" />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Enter your mobile number to receive a secure OTP code.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full apple-btn-primary py-3 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 cursor-pointer shadow-md"
              >
                <span>{loading ? 'Checking Account...' : 'Continue with OTP'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Demo Account Quick Logins (Dynamic based on existing active staff) */}
              {quickAccounts.length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Fast Demo Accounts (Active Master)</p>
                    <span className="text-[10px] text-[#1769AA] font-semibold bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">1-Tap Select</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {quickAccounts.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleQuickLogin(u)}
                        className={`p-3 bg-slate-50/80 hover:bg-white hover:border-[#1769AA]/40 border border-slate-200/80 rounded-2xl text-left transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md active:scale-[0.98] ${u.colSpan}`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-xs text-[#123B5D] truncate">{u.fullName}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${u.color}`}>
                            {u.label}
                          </span>
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                          <span>Mobile: <strong className="font-mono text-slate-800">{u.mobile}</strong></span>
                          <span className="text-[10px] text-[#1769AA] font-bold">Select →</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          )}

          {/* STEP 2: Registration Form for New Users */}
          {step === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="bg-[#E8F6F6] p-2.5 rounded-xl border border-[#159A9C]/30 text-xs text-[#123B5D]">
                <p className="font-bold">New Account Registration</p>
                <p className="text-[11px] text-[#64748B] mt-0.5">Mobile: +91 {phone}</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E293B] mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-sm text-slate-900 font-semibold focus:border-[#1769AA] focus:ring-4 focus:ring-sky-500/20 focus:outline-none caret-[#1769AA] transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-sm text-slate-900 font-semibold focus:border-[#1769AA] focus:ring-4 focus:ring-sky-500/20 focus:outline-none caret-[#1769AA] transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">Date of Birth (DOB)</label>
                  <input
                    type="date"
                    value={dobOrAge}
                    onChange={(e) => setDobOrAge(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-sm text-slate-900 font-semibold focus:border-[#1769AA] focus:ring-4 focus:ring-sky-500/20 focus:outline-none caret-[#1769AA] transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-sm text-slate-900 font-semibold focus:border-[#1769AA] focus:ring-4 focus:ring-sky-500/20 focus:outline-none transition-all"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1E293B] mb-1">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-sm text-slate-900 font-semibold focus:border-[#1769AA] focus:ring-4 focus:ring-sky-500/20 focus:outline-none transition-all"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="w-1/3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 apple-btn-primary py-2.5 rounded-xl text-xs font-bold cursor-pointer shadow-md"
                >
                  {loading ? 'Processing...' : 'Proceed to OTP'}
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: OTP Verification */}
          {step === 'otp' && (
            <form onSubmit={handleOtpVerify} className="space-y-5 animate-fadeIn">
              <div className="text-center">
                <div className="w-14 h-14 bg-gradient-to-tr from-sky-100 to-sky-50 text-[#1769AA] rounded-2xl flex items-center justify-center mx-auto mb-3 border border-sky-200/80 shadow-xs">
                  <KeyRound className="w-7 h-7 text-[#1769AA]" />
                </div>
                <h4 className="font-extrabold text-base text-[#123B5D]">Enter OTP Verification Code</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Code sent to <span className="font-bold text-[#123B5D]">+91 {phone}</span>
                </p>
                <div className="inline-block mt-2 px-3 py-1 bg-sky-50 rounded-full border border-sky-200">
                  <p className="text-[11px] font-semibold text-[#1769AA]">
                    Universal Demo OTP: <span className="font-mono font-bold text-slate-900">123456</span>
                  </p>
                </div>
              </div>

              <div>
                <input
                  id="auth-otp-input"
                  type="text"
                  inputMode="numeric"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="123456"
                  maxLength={6}
                  autoFocus
                  className="w-full text-center text-2xl font-mono font-extrabold tracking-[0.35em] py-3.5 bg-white border-2 border-[#1769AA] rounded-2xl text-slate-900 focus:outline-none focus:ring-4 focus:ring-sky-500/20 caret-[#1769AA] shadow-xs transition-all"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep(isNewUser ? 'register' : 'phone')}
                  className="w-1/3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 py-3 rounded-xl text-xs font-bold cursor-pointer transition-colors active:scale-[0.98]"
                >
                  Change
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 apple-btn-primary py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-md"
                >
                  {loading ? 'Verifying...' : 'Verify OTP & Login'}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>,
    document.body
  );
};
