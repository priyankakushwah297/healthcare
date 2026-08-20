import React, { useState } from 'react';
import {
  User,
  Bell,
  Lock,
  Shield,
  CreditCard,
  HelpCircle,
  LogOut,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Save,
  Key,
  Smartphone,
  MessageSquare,
  AlertTriangle,
  Camera,
  Trash2,
  PlusCircle,
  Download,
  Receipt,
  FileQuestion,
  Headphones,
  ShieldCheck,
  Send
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { PatientNavTabs } from './PatientNavTabs';
import { compressImageFile } from '../../utils/imageCompressor';

export const PatientSettings: React.FC<{ hideTabs?: boolean }> = ({ hideTabs }) => {
  const { currentUser, updateUserProfile, logout } = useHospital();

  const [activeSection, setActiveSection] = useState<'profile' | 'notifications' | 'account' | 'privacy' | 'payments' | 'support'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile Form State
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [dobOrAge, setDobOrAge] = useState(currentUser?.dobOrAge || '34 Years');
  const [gender, setGender] = useState(currentUser?.gender || 'Male');
  const [mobile, setMobile] = useState(currentUser?.mobile || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [bloodGroup, setBloodGroup] = useState(currentUser?.bloodGroup || 'O+');
  const [address, setAddress] = useState(currentUser?.address || '742 Evergreen Terrace, New Delhi');
  const [emergencyContact, setEmergencyContact] = useState(currentUser?.emergencyContact || 'Sunita Sharma (+91 98765 43211)');
  const [profilePhoto, setProfilePhoto] = useState(currentUser?.profilePhoto || '');

  // Notification Toggles
  const [notifSettings, setNotifSettings] = useState({
    appointmentReminders: true,
    medicineReminders: true,
    labReportNotifs: true,
    paymentNotifs: true,
    smsAlerts: true,
    emailAlerts: true,
    pushAlerts: true
  });

  // Account & Security
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [changePhoneModalOpen, setChangePhoneModalOpen] = useState(false);
  const [newPhoneInput, setNewPhoneInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [phoneStep, setPhoneStep] = useState<1 | 2>(1);
  const [phoneChangeSuccess, setPhoneChangeSuccess] = useState(false);

  // Active Login Sessions
  const [sessions, setSessions] = useState([
    { id: 'sess-1', device: 'Chrome on Windows 11', location: 'New Delhi, India', lastActive: 'Active Now', isCurrent: true },
    { id: 'sess-2', device: 'Healthcare Center iOS App (iPhone 15)', location: 'New Delhi, India', lastActive: 'Yesterday, 09:40 PM', isCurrent: false }
  ]);

  // Support & Problem ticket form
  const [ticketCategory, setTicketCategory] = useState('Appointment Query');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  // Logout confirmation modal
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    updateUserProfile(currentUser.id, {
      fullName,
      dobOrAge,
      gender: gender as any,
      mobile,
      email,
      bloodGroup,
      address,
      emergencyContact,
      profilePhoto
    });

    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleRevokeSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const handleSendPhoneOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhoneInput || newPhoneInput.length < 10) return;
    setPhoneStep(2);
  };

  const handleVerifyPhoneOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpInput.length === 6 && currentUser) {
      setMobile(newPhoneInput);
      updateUserProfile(currentUser.id, { mobile: newPhoneInput });
      setPhoneChangeSuccess(true);
      setTimeout(() => {
        setChangePhoneModalOpen(false);
        setPhoneStep(1);
        setPhoneChangeSuccess(false);
      }, 1500);
    }
  };

  const handleSubmitProblem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketDesc.trim()) return;
    setTicketSubmitted(true);
    setTimeout(() => {
      setTicketSubmitted(false);
      setTicketDesc('');
    }, 3000);
  };

  return (
    <div className="space-y-6 animate-fadeIn text-[#1E293B] font-sans">
      {!hideTabs && <PatientNavTabs currentTab="settings" />}

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#159A9C] uppercase tracking-wider">
            Patient Portal Settings
          </span>
          <h2 className="text-xl font-bold text-[#123B5D] mt-0.5">
            Account, Security & Medical Profile Preferences
          </h2>
          <p className="text-xs text-[#64748B]">
            Manage your personal medical profile, notifications, login security, and billing methods.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Left Navigation Sidebar */}
        <div className="md:col-span-1 bg-white rounded-2xl p-3 border border-[#E2E8F0] shadow-xs space-y-1 h-fit">
          <button
            onClick={() => setActiveSection('profile')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2.5 transition-colors cursor-pointer ${
              activeSection === 'profile'
                ? 'bg-[#1769AA] text-white shadow-xs'
                : 'text-[#123B5D] hover:bg-[#F7FAFC]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>My Profile</span>
          </button>

          <button
            onClick={() => setActiveSection('notifications')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2.5 transition-colors cursor-pointer ${
              activeSection === 'notifications'
                ? 'bg-[#1769AA] text-white shadow-xs'
                : 'text-[#123B5D] hover:bg-[#F7FAFC]'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notification Settings</span>
          </button>

          <button
            onClick={() => setActiveSection('account')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2.5 transition-colors cursor-pointer ${
              activeSection === 'account'
                ? 'bg-[#1769AA] text-white shadow-xs'
                : 'text-[#123B5D] hover:bg-[#F7FAFC]'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Account Settings</span>
          </button>

          <button
            onClick={() => setActiveSection('privacy')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2.5 transition-colors cursor-pointer ${
              activeSection === 'privacy'
                ? 'bg-[#1769AA] text-white shadow-xs'
                : 'text-[#123B5D] hover:bg-[#F7FAFC]'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Privacy & Security</span>
          </button>

          <button
            onClick={() => setActiveSection('payments')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2.5 transition-colors cursor-pointer ${
              activeSection === 'payments'
                ? 'bg-[#1769AA] text-white shadow-xs'
                : 'text-[#123B5D] hover:bg-[#F7FAFC]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Payment Settings</span>
          </button>

          <button
            onClick={() => setActiveSection('support')}
            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2.5 transition-colors cursor-pointer ${
              activeSection === 'support'
                ? 'bg-[#1769AA] text-white shadow-xs'
                : 'text-[#123B5D] hover:bg-[#F7FAFC]'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Support & Help</span>
          </button>

          <div className="pt-2 border-t border-[#E2E8F0]">
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-[#C0392B] hover:bg-rose-50 flex items-center space-x-2.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="md:col-span-3">
          
          {/* ========================================================================= */}
          {/* 1. MY PROFILE */}
          {/* ========================================================================= */}
          {activeSection === 'profile' && (
            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-6 animate-fadeIn">
              
              <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0]">
                <div>
                  <h3 className="text-base font-bold text-[#123B5D]">Patient Profile Information</h3>
                  <p className="text-xs text-[#64748B]">Personal, contact, and emergency clinical data.</p>
                </div>

                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-[#1769AA] hover:bg-[#123B5D] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#123B5D] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>

              {saveSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center space-x-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Profile details updated and synchronized successfully!</span>
                </div>
              )}

              {/* Photo & Identity Banner */}
              <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-5 p-4 bg-[#F7FAFC] rounded-2xl border border-[#E2E8F0]">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-[#123B5D] text-white flex items-center justify-center text-xl font-bold ring-4 ring-[#159A9C]/30 overflow-hidden">
                    {profilePhoto ? (
                      <img src={profilePhoto} alt={fullName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      fullName.charAt(0)
                    )}
                  </div>
                  {isEditing && (
                    <label
                      className="absolute -bottom-1 -right-1 p-1.5 bg-[#1769AA] text-white rounded-lg shadow-md hover:bg-[#123B5D] cursor-pointer"
                      title="Upload photo from device"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const compressed = await compressImageFile(file, 400, 400, 0.85);
                              setProfilePhoto(compressed);
                            } catch (err) {
                              console.error(err);
                            }
                          }
                        }}
                      />
                    </label>
                  )}
                </div>

                <div className="text-center sm:text-left space-y-1">
                  <h4 className="font-bold text-base text-[#123B5D]">{fullName}</h4>
                  <p className="text-xs text-[#64748B]">
                    Patient ID: <strong className="font-mono text-[#159A9C]">{currentUser?.patientId || 'PAT-2026-1001'}</strong> • Blood Group: <strong className="text-[#1E293B]">{bloodGroup}</strong>
                  </p>
                  <p className="text-[11px] text-[#64748B]">
                    Registered on: {currentUser?.createdAt || '2026-08-18'}
                  </p>
                </div>
              </div>

              {/* Profile Details Form */}
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1E293B] mb-1">Full Name</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white disabled:bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E293B] mb-1">Date of Birth / Age</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={dobOrAge}
                      onChange={(e) => setDobOrAge(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-white disabled:bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E293B] mb-1">Gender</label>
                    <select
                      disabled={!isEditing}
                      value={gender}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full px-3 py-2 bg-white disabled:bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl text-xs"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E293B] mb-1">Blood Group</label>
                    <select
                      disabled={!isEditing}
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full px-3 py-2 bg-white disabled:bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl text-xs"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E293B] mb-1">Phone Number</label>
                    <input
                      type="tel"
                      disabled={!isEditing}
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full px-3 py-2 bg-white disabled:bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1E293B] mb-1">Email Address</label>
                    <input
                      type="email"
                      disabled={!isEditing}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-white disabled:bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#1E293B] mb-1">Residential Address</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-white disabled:bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#1E293B] mb-1">Emergency Contact (Name & Phone)</label>
                    <input
                      type="text"
                      disabled={!isEditing}
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      placeholder="e.g. Ramesh Sharma (+91 98765 43210)"
                      className="w-full px-3 py-2 bg-white disabled:bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl text-xs"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="pt-4 border-t border-[#E2E8F0] flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-2 cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Profile Changes</span>
                    </button>
                  </div>
                )}
              </form>

            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. NOTIFICATION SETTINGS */}
          {/* ========================================================================= */}
          {activeSection === 'notifications' && (
            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-6 animate-fadeIn">
              <div className="pb-4 border-b border-[#E2E8F0]">
                <h3 className="text-base font-bold text-[#123B5D]">Notification & Alert Preferences</h3>
                <p className="text-xs text-[#64748B]">Control clinical notifications, prescription reminders, and lab alerts.</p>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'appointmentReminders', title: 'Appointment Reminders', desc: 'Receive reminders 24h and 2h prior to scheduled consultations.' },
                  { key: 'medicineReminders', title: 'Medicine Dosage Reminders', desc: 'Daily alerts to take active prescribed medications on time.' },
                  { key: 'labReportNotifs', title: 'Lab Report Notifications', desc: 'Instant SMS & portal notification when diagnostic test results are ready.' },
                  { key: 'paymentNotifs', title: 'Payment & Billing Receipts', desc: 'Digital invoices and payment confirmation messages.' },
                  { key: 'smsAlerts', title: 'SMS Direct Alerts', desc: 'Send vital booking details directly via text message to mobile.' },
                  { key: 'emailAlerts', title: 'Email Summaries', desc: 'Receive comprehensive PDF clinical summaries via email.' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-[#F7FAFC] rounded-xl border border-[#E2E8F0]">
                    <div>
                      <h4 className="font-bold text-xs text-[#1E293B]">{item.title}</h4>
                      <p className="text-[11px] text-[#64748B]">{item.desc}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={(notifSettings as any)[item.key]}
                      onChange={(e) => setNotifSettings({ ...notifSettings, [item.key]: e.target.checked })}
                      className="w-4 h-4 accent-[#1769AA] cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. ACCOUNT SETTINGS */}
          {/* ========================================================================= */}
          {activeSection === 'account' && (
            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-6 animate-fadeIn">
              <div className="pb-4 border-b border-[#E2E8F0]">
                <h3 className="text-base font-bold text-[#123B5D]">Account & Phone Credentials</h3>
                <p className="text-xs text-[#64748B]">Manage your registered mobile number and portal access security.</p>
              </div>

              <div className="p-4 bg-[#F7FAFC] rounded-xl border border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#64748B] block">Registered Mobile Number</span>
                  <h4 className="font-mono font-bold text-sm text-[#123B5D]">{currentUser?.mobile}</h4>
                  <span className="text-[10px] text-emerald-600 font-semibold">Primary OTP Authentication Method</span>
                </div>
                <button
                  onClick={() => setChangePhoneModalOpen(true)}
                  className="px-3.5 py-2 bg-white hover:bg-[#E8F6F6] text-[#1769AA] border border-[#1769AA]/30 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Change Mobile Number
                </button>
              </div>

              {/* Change Phone Modal */}
              {changePhoneModalOpen && (
                <div className="p-4 bg-[#E8F6F6]/60 rounded-xl border border-[#159A9C]/30 space-y-3">
                  <h4 className="font-bold text-xs text-[#123B5D]">Update Mobile Number via OTP</h4>
                  
                  {phoneStep === 1 ? (
                    <form onSubmit={handleSendPhoneOtp} className="space-y-2">
                      <label className="block text-[11px] font-medium text-[#1E293B]">New 10-digit Mobile Number</label>
                      <div className="flex space-x-2">
                        <input
                          type="tel"
                          value={newPhoneInput}
                          onChange={(e) => setNewPhoneInput(e.target.value)}
                          placeholder="e.g. 9876543210"
                          required
                          className="flex-1 px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-xs"
                        />
                        <button type="submit" className="px-4 py-2 bg-[#1769AA] text-white rounded-lg text-xs font-bold">
                          Send OTP
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyPhoneOtp} className="space-y-2">
                      <label className="block text-[11px] font-medium text-[#1E293B]">Enter 6-digit OTP sent to {newPhoneInput} (use 123456)</label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value)}
                          placeholder="123456"
                          required
                          className="flex-1 px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-xs font-mono"
                        />
                        <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold">
                          Verify & Update
                        </button>
                      </div>
                      {phoneChangeSuccess && (
                        <p className="text-xs text-emerald-700 font-semibold">Mobile number updated successfully!</p>
                      )}
                    </form>
                  )}
                </div>
              )}

              {/* Login & Security */}
              <div className="p-4 bg-[#F7FAFC] rounded-xl border border-[#E2E8F0] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-[#1E293B]">Login Security PIN</h4>
                    <p className="text-[11px] text-[#64748B]">Optional 4-digit PIN for quick kiosk & mobile access.</p>
                  </div>
                  <button
                    onClick={() => alert('Security PIN successfully enabled!')}
                    className="px-3 py-1.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-semibold hover:bg-slate-50"
                  >
                    Set PIN
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. PRIVACY & SECURITY */}
          {/* ========================================================================= */}
          {activeSection === 'privacy' && (
            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-6 animate-fadeIn">
              <div className="pb-4 border-b border-[#E2E8F0]">
                <h3 className="text-base font-bold text-[#123B5D]">Privacy, 2FA & Active Sessions</h3>
                <p className="text-xs text-[#64748B]">Manage two-factor authentication, active devices, and clinical privacy permissions.</p>
              </div>

              {/* 2FA Card */}
              <div className="p-4 bg-[#F7FAFC] rounded-xl border border-[#E2E8F0] flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-[#1E293B]">Two-Factor Authentication (2FA)</h4>
                  <p className="text-[11px] text-[#64748B]">Require SMS OTP verification on every new login attempt.</p>
                </div>
                <input
                  type="checkbox"
                  checked={twoFactorEnabled}
                  onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                  className="w-4 h-4 accent-[#1769AA] cursor-pointer"
                />
              </div>

              {/* Active Sessions */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-[#123B5D]">Manage Active Login Sessions</h4>
                {sessions.map((sess) => (
                  <div key={sess.id} className="p-3.5 bg-[#F7FAFC] rounded-xl border border-[#E2E8F0] flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Smartphone className="w-5 h-5 text-[#1769AA]" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-bold text-xs text-[#1E293B]">{sess.device}</p>
                          {sess.isCurrent && (
                            <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                              Current Device
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#64748B]">{sess.location} • {sess.lastActive}</p>
                      </div>
                    </div>

                    {!sess.isCurrent && (
                      <button
                        onClick={() => handleRevokeSession(sess.id)}
                        className="text-xs text-[#C0392B] hover:underline font-semibold"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. PAYMENT SETTINGS */}
          {/* ========================================================================= */}
          {activeSection === 'payments' && (
            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-6 animate-fadeIn">
              <div className="pb-4 border-b border-[#E2E8F0]">
                <h3 className="text-base font-bold text-[#123B5D]">Saved Payment Methods & Invoices</h3>
                <p className="text-xs text-[#64748B]">Manage your payment cards, UPI handles, and past OPD consultation receipts.</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-xs text-[#123B5D]">Saved Payment Methods</h4>
                <div className="p-3.5 bg-[#F7FAFC] rounded-xl border border-[#E2E8F0] flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-[#159A9C]" />
                    <div>
                      <p className="font-bold text-xs text-[#1E293B]">HDFC Bank Visa ending in 8821</p>
                      <p className="text-[11px] text-[#64748B]">Expires 08/29 • Primary method</p>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">Active</span>
                </div>
              </div>

              {/* Billing Information */}
              <div className="p-4 bg-[#F7FAFC] rounded-xl border border-[#E2E8F0] space-y-2">
                <h4 className="font-bold text-xs text-[#123B5D]">Billing & Insurance Details</h4>
                <p className="text-xs text-[#64748B]">Health Insurance: <strong className="text-[#1E293B]">Star Health MediCare Gold (Policy #SH-2026-8812)</strong></p>
                <p className="text-xs text-[#64748B]">Cashless TPA Desk: <strong className="text-emerald-700">Pre-authorized at Hospital OPD</strong></p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 6. SUPPORT & HELP */}
          {/* ========================================================================= */}
          {activeSection === 'support' && (
            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-6 animate-fadeIn">
              <div className="pb-4 border-b border-[#E2E8F0]">
                <h3 className="text-base font-bold text-[#123B5D]">Help Center & Patient Support Desk</h3>
                <p className="text-xs text-[#64748B]">24/7 patient helpline, emergency support, and problem ticket submission.</p>
              </div>

              {/* 24/7 Helpline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-r from-[#123B5D] to-[#1769AA] text-white rounded-2xl space-y-1 shadow-xs">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-[#159A9C]" />
                    <span className="text-xs font-semibold text-slate-200">24/7 Emergency Line</span>
                  </div>
                  <h4 className="text-lg font-bold">+91 11 2678 9999</h4>
                  <p className="text-[11px] text-slate-300">Direct connection to Emergency Triage Team</p>
                </div>

                <div className="p-4 bg-sky-50 rounded-2xl border border-[#1769AA]/30 space-y-1">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-[#1769AA]" />
                    <span className="text-xs font-semibold text-[#1769AA]">Patient Care Email</span>
                  </div>
                  <h4 className="text-base font-bold text-[#123B5D]">support@healthcare.com</h4>
                  <p className="text-[11px] text-[#64748B]">Responses within 2 business hours</p>
                </div>
              </div>

              {/* Report a Problem Form */}
              <div className="p-5 bg-[#F7FAFC] rounded-2xl border border-[#E2E8F0] space-y-3">
                <h4 className="font-bold text-xs text-[#123B5D]">Report a Problem / Submit a Query</h4>
                
                {ticketSubmitted ? (
                  <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-xl flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Your ticket has been submitted to the Patient Grievance Team (Ref: TKT-2026-902).</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitProblem} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-[#1E293B] mb-1">Issue Category</label>
                      <select
                        value={ticketCategory}
                        onChange={(e) => setTicketCategory(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs"
                      >
                        <option value="Appointment Query">Appointment Scheduling or Rescheduling</option>
                        <option value="Prescription Inquiry">Prescription / Medicine Clarification</option>
                        <option value="Lab Report Delay">Diagnostic Lab Report Delay</option>
                        <option value="Payment & Refunds">Billing, Payment or Refund Query</option>
                        <option value="Homecare Support">Homecare Visit Support</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1E293B] mb-1">Describe your query / issue</label>
                      <textarea
                        rows={3}
                        value={ticketDesc}
                        onChange={(e) => setTicketDesc(e.target.value)}
                        placeholder="Provide relevant details, appointment ref, or description..."
                        required
                        className="w-full px-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-xs resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#1769AA] hover:bg-[#123B5D] text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Query to Support Team</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-2xl max-w-sm w-full text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-[#C0392B] flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-[#123B5D]">Log out from Patient Portal?</h3>
            <p className="text-xs text-[#64748B]">
              You will be securely logged out and returned to the hospital home page.
            </p>
            <div className="flex space-x-3 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#123B5D] rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  logout();
                }}
                className="flex-1 py-2.5 bg-[#C0392B] hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
