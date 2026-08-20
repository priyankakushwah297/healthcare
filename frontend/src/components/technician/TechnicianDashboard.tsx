import React, { useState, useEffect } from 'react';
import {
  Stethoscope,
  Users,
  Clock,
  Calendar,
  DollarSign,
  Award,
  Briefcase,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Phone,
  Mail,
  Building2,
  Camera,
  Upload,
  Image as ImageIcon,
  X,
  Sparkles,
  Activity,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { StaffMember } from '../../types';
import { PortalSidebar } from '../layout/PortalSidebar';
import { compressImageFile } from '../../utils/imageCompressor';

const PRESET_AVATARS = [
  { name: 'Senior Cardiologist', url: 'https://res.cloudinary.com/agyzxqvk/image/upload/v1787224296/healthcare_avatars/avatar_doctor_1.jpg' },
  { name: 'Neuro Specialist', url: 'https://res.cloudinary.com/agyzxqvk/image/upload/v1787224342/healthcare_avatars/avatar_doctor_2.jpg' },
  { name: 'Physician', url: 'https://res.cloudinary.com/agyzxqvk/image/upload/v1787224297/healthcare_avatars/avatar_doctor_3.jpg' },
  { name: 'Surgeon', url: 'https://res.cloudinary.com/agyzxqvk/image/upload/v1787224298/healthcare_avatars/avatar_doctor_4.jpg' },
  { name: 'Lead Receptionist', url: 'https://res.cloudinary.com/agyzxqvk/image/upload/v1787224300/healthcare_avatars/avatar_receptionist_1.jpg' },
  { name: 'OPD Receptionist', url: 'https://res.cloudinary.com/agyzxqvk/image/upload/v1787224302/healthcare_avatars/avatar_receptionist_2.jpg' }
];

export const TechnicianDashboard: React.FC = () => {
  const {
    staff,
    users,
    addStaff,
    updateStaff,
    deleteStaff,
    toggleStaffActiveStatus,
    hospital,
    activeTab,
    logout
  } = useHospital();

  const [activeSubTab, setActiveSubTab] = useState<string>(() => {
    return (activeTab && ['doctors', 'receptionists', 'overview'].includes(activeTab)) ? activeTab : 'doctors';
  });

  useEffect(() => {
    if (activeTab && ['doctors', 'receptionists', 'overview'].includes(activeTab)) {
      setActiveSubTab(activeTab);
    }
  }, [activeTab]);

  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [targetRoleType, setTargetRoleType] = useState<'doctor' | 'receptionist'>('doctor');
  const [successMessage, setSuccessMessage] = useState('');

  // Form State
  const [fullName, setFullName] = useState('');
  const [staffId, setStaffId] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Cardiology');
  const [specialization, setSpecialization] = useState('Senior Consultant');
  const [qualification, setQualification] = useState('MBBS, MD');
  const [experience, setExperience] = useState('10+ Years');
  const [consultationFee, setConsultationFee] = useState<number>(700);
  const [shiftTiming, setShiftTiming] = useState('09:00 AM - 05:00 PM');
  const [workingHours, setWorkingHours] = useState('8 Hours / Day');
  const [availableDays, setAvailableDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  const [profilePhoto, setProfilePhoto] = useState('');

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const doctorsList = staff.filter(s => s.type === 'doctor' || s.staffType === 'doctor');
  const receptionistsList = staff.filter(s => s.type === 'receptionist' || s.staffType === 'receptionist');

  const activeDoctorsCount = doctorsList.filter(d => d.isActive !== false).length;
  const activeReceptionistsCount = receptionistsList.filter(r => r.isActive !== false).length;

  const handleToggleDay = (day: string) => {
    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter(d => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  const handleOpenAdd = (type: 'doctor' | 'receptionist') => {
    setTargetRoleType(type);
    setFullName('');
    setStaffId(type === 'doctor' ? `DOC-KLP-${Math.floor(100 + Math.random() * 900)}` : `REC-KLP-0${receptionistsList.length + 1}`);
    setMobile('');
    setEmail('');
    setDepartment(type === 'doctor' ? 'Cardiology' : 'Front Office Desk');
    setSpecialization(type === 'doctor' ? 'Consultant Specialist' : 'Front Desk Officer');
    setQualification(type === 'doctor' ? 'MBBS, MD' : 'B.Sc. Hospital Admin');
    setExperience('5 Years');
    setConsultationFee(750);
    setShiftTiming(type === 'doctor' ? '09:00 AM - 04:30 PM' : '08:00 AM - 04:00 PM');
    setWorkingHours('8 Hours / Day');
    setAvailableDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
    setProfilePhoto(PRESET_AVATARS[0].url);
    setShowAddModal(true);
  };

  const handleOpenEdit = (s: StaffMember) => {
    setEditingStaff(s);
    setTargetRoleType((s.type || s.staffType) as any);
    setFullName(s.name || s.fullName || '');
    setStaffId(s.staffId || '');
    setMobile(s.mobile || '');
    setEmail(s.email || '');
    setDepartment(s.department || 'General Medicine');
    setSpecialization(s.specialization || s.roleTitle || '');
    setQualification(s.qualification || '');
    setExperience(s.experience || '');
    setConsultationFee(Number(s.consultationFee) || 700);
    setShiftTiming(s.shiftTiming || '09:00 AM - 05:00 PM');
    setWorkingHours(s.workingHours || '8 Hours / Day');
    setAvailableDays(
      Array.isArray(s.availableDays) 
        ? s.availableDays 
        : typeof s.availableDays === 'string' 
          ? s.availableDays.split(',').map(d => d.trim()) 
          : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    );
    setProfilePhoto(s.profilePhoto || '');
  };

  const handleDirectCardImageUpload = async (staffId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      // Compress image client-side to ~30-50KB with high quality
      const compressedDataUrl = await compressImageFile(file, 400, 400, 0.85);
      await updateStaff(staffId, { profilePhoto: compressedDataUrl });
      setSuccessMessage('Doctor profile photo updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3500);
    } catch (err) {
      console.error('Image compression failed:', err);
      // Fallback to FileReader if compression fails
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        await updateStaff(staffId, { profilePhoto: base64 });
        setSuccessMessage('Doctor profile photo updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3500);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleModalFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedDataUrl = await compressImageFile(file, 400, 400, 0.85);
      setProfilePhoto(compressedDataUrl);
    } catch (err) {
      console.error('Modal image compression failed:', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setProfilePhoto(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !mobile.trim()) return;

    await addStaff({
      name: fullName,
      fullName,
      staffId,
      mobile,
      email: email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@healthcare.com`,
      type: targetRoleType,
      staffType: targetRoleType,
      department,
      specialization,
      roleTitle: specialization,
      qualification,
      experience,
      consultationFee,
      shiftTiming,
      workingHours,
      availableDays,
      isActive: true,
      profilePhoto: profilePhoto || PRESET_AVATARS[0].url
    });

    setShowAddModal(false);
    setSuccessMessage(`New ${targetRoleType === 'doctor' ? 'Doctor' : 'Receptionist'} "${fullName}" added successfully!`);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;

    await updateStaff(editingStaff.id, {
      name: fullName,
      fullName,
      staffId,
      mobile,
      email,
      department,
      specialization,
      roleTitle: specialization,
      qualification,
      experience,
      consultationFee,
      shiftTiming,
      workingHours,
      availableDays,
      profilePhoto
    });

    setEditingStaff(null);
    setSuccessMessage(`Staff profile for "${fullName}" updated in database!`);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from hospital database?`)) {
      await deleteStaff(id);
      setSuccessMessage(`Staff "${name}" removed.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const filteredDoctors = doctorsList.filter(d => {
    const matchesSearch = (d.fullName || d.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (d.specialization || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (d.staffId || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'all' || d.department === deptFilter;
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && d.isActive !== false) || 
                          (statusFilter === 'inactive' && d.isActive === false);
    return matchesSearch && matchesDept && matchesStatus;
  });

  const filteredReceptionists = receptionistsList.filter(r => {
    const matchesSearch = (r.fullName || r.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (r.staffId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (r.mobile || '').includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && r.isActive !== false) || 
                          (statusFilter === 'inactive' && r.isActive === false);
    return matchesSearch && matchesStatus;
  });

  const isTechnicianDeleted = React.useMemo(() => {
    const activeTechs = staff.filter(s => (s.type === 'technician' || s.staffType === 'technician') && s.isActive !== false);
    const activeUsers = users.filter(u => u.role === 'technician' && u.isActive !== false);
    return activeTechs.length === 0 && activeUsers.length === 0;
  }, [staff, users]);

  if (isTechnicianDeleted) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-4 animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-[#123B5D]">No Active Technician Account Found</h2>
        <p className="text-xs text-[#64748B] leading-relaxed">
          The technician staff profile has been removed or deleted from the hospital database by the Administrator. You cannot access or manage the Technician Hub without an active registered technician record.
        </p>
        <div className="pt-2 flex justify-center space-x-3">
          <button
            onClick={() => logout()}
            className="apple-btn-primary px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
          >
            Log Out of Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row items-start gap-6 animate-fadeIn font-sans text-[#1E293B]">
      {/* LEFT: Unified Role Sidebar (Hidden on mobile, Drawer opened from top-right Hamburger) */}
      <div className="hidden lg:block lg:w-72 shrink-0 lg:sticky lg:top-20 self-start z-20">
        <PortalSidebar
          currentSubTab={activeSubTab}
          onSelectSubTab={(tabId) => setActiveSubTab(tabId)}
        />
      </div>

      {/* RIGHT: Dynamic Sub-Views */}
      <div className="flex-1 w-full min-w-0 space-y-6">
        
        {/* Success Alert */}
        {successMessage && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center space-x-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-[#16845B]" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-VIEW 1: DOCTOR ROSTER & PROFILES */}
        {/* ========================================================================= */}
        {activeSubTab === 'doctors' && (
          <div className="space-y-4">
            {/* Key Metrics Strip (Only in Doctor Roster) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="apple-card p-5 space-y-1">
                <div className="flex items-center justify-between text-xs text-[#64748B]">
                  <span className="font-medium">Total Doctors</span>
                  <div className="w-8 h-8 rounded-xl bg-sky-50 text-[#1769AA] flex items-center justify-center">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-[#123B5D] mt-1">{doctorsList.length}</p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">{activeDoctorsCount} Active On Duty</p>
              </div>

              <div className="apple-card p-5 space-y-1">
                <div className="flex items-center justify-between text-xs text-[#64748B]">
                  <span className="font-medium">Total Receptionists</span>
                  <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-[#123B5D] mt-1">{receptionistsList.length}</p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">{activeReceptionistsCount} Active On Shift</p>
              </div>

              <div className="apple-card p-5 space-y-1">
                <div className="flex items-center justify-between text-xs text-[#64748B]">
                  <span className="font-medium">Hospital Specialties</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-[#123B5D] mt-1">{hospital.departments?.length || 8}</p>
                <p className="text-[11px] text-[#64748B] mt-0.5">Clinical Wings</p>
              </div>

              <div className="apple-card p-5 space-y-1">
                <div className="flex items-center justify-between text-xs text-[#64748B]">
                  <span className="font-medium">Database Sync</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-emerald-700 mt-1">100%</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Live SQLite Connected</p>
              </div>
            </div>

            {/* Header & Add Doctor Button */}
            <div className="apple-card p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-[#123B5D]">Doctor Roster &amp; Profiles</h3>
                <p className="text-xs text-[#64748B] mt-0.5">Manage doctor availability, shift schedules, OPD timings, consultation fees, and profile photos.</p>
              </div>

              <button
                onClick={() => handleOpenAdd('doctor')}
                className="apple-btn-primary px-4 py-2.5 text-xs flex items-center space-x-1.5 cursor-pointer shadow-sm hover:shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add Doctor</span>
              </button>
            </div>

            {/* Search & Filter Bar */}
            <div className="apple-card p-4 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search doctor by name, ID, specialty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl text-xs focus:border-[#1769AA] focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-2 w-full md:w-auto">
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="px-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#1E293B]"
                >
                  <option value="all">All Departments</option>
                  {hospital.departments?.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#1E293B]"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>

            {/* Doctors Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDoctors.map((doc) => {
                const isActive = doc.isActive !== false;
                const daysList = Array.isArray(doc.availableDays) 
                  ? doc.availableDays 
                  : typeof doc.availableDays === 'string'
                    ? doc.availableDays.split(',').map(d => d.trim())
                    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

                return (
                  <div
                    key={doc.id}
                    className={`bg-white rounded-2xl border p-5 shadow-xs transition-all space-y-4 ${
                      isActive ? 'border-[#E2E8F0] hover:border-[#1769AA]/40' : 'border-red-200 bg-red-50/20 opacity-80'
                    }`}
                  >
                    {/* Header: Photo, Name, ID & Status Toggle */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="relative group/avatar shrink-0">
                          <img
                            src={doc.profilePhoto || PRESET_AVATARS[0].url}
                            alt={doc.fullName || doc.name}
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-xs shrink-0"
                          />
                          <label
                            htmlFor={`upload-doctor-img-${doc.id}`}
                            className="absolute inset-0 bg-black/50 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover/avatar:opacity-100 transition-all cursor-pointer shadow-xs backdrop-blur-2xs"
                            title="Click to Upload Doctor Photo"
                          >
                            <Camera className="w-4 h-4 text-white" />
                            <span className="text-[8px] font-bold mt-0.5">Upload</span>
                          </label>
                          <input
                            id={`upload-doctor-img-${doc.id}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleDirectCardImageUpload(doc.id, e)}
                          />
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-sm text-[#123B5D]">{doc.fullName || doc.name}</h3>
                            <span className="text-[10px] font-mono bg-slate-100 text-[#64748B] px-1.5 py-0.5 rounded font-bold">
                              {doc.staffId}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-[#1769AA]">{doc.specialization || doc.roleTitle}</p>
                          <p className="text-[11px] text-[#64748B]">{doc.department}</p>
                        </div>
                      </div>

                      {/* Status Toggle Switch (Activate / Deactivate) */}
                      <div className="flex flex-col items-end shrink-0">
                        <button
                          onClick={() => toggleStaffActiveStatus(doc.id)}
                          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                          title="Click to toggle doctor active/inactive status"
                        >
                          {isActive ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-red-600" />}
                          <span>{isActive ? 'Active' : 'Deactivated'}</span>
                        </button>
                        <span className="text-[9px] text-[#64748B] mt-0.5">Click to toggle</span>
                      </div>
                    </div>

                    {/* Qualifications & Experience */}
                    <div className="grid grid-cols-2 gap-2 bg-[#F8FAFC] p-3 rounded-xl text-xs border border-slate-100">
                      <div>
                        <span className="text-[10px] text-[#64748B] font-medium flex items-center space-x-1">
                          <Award className="w-3 h-3 text-indigo-500" />
                          <span>Qualification</span>
                        </span>
                        <p className="font-semibold text-[#1E293B] text-[11px] truncate">{doc.qualification || 'MBBS, MD'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#64748B] font-medium flex items-center space-x-1">
                          <Briefcase className="w-3 h-3 text-amber-500" />
                          <span>Experience</span>
                        </span>
                        <p className="font-semibold text-[#1E293B] text-[11px]">{doc.experience || '10+ Years'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#64748B] font-medium flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-sky-500" />
                          <span>Shift Timing</span>
                        </span>
                        <p className="font-semibold text-[#1E293B] text-[11px]">{doc.shiftTiming || '09:00 AM - 05:00 PM'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#64748B] font-medium flex items-center space-x-1">
                          <DollarSign className="w-3 h-3 text-emerald-500" />
                          <span>Consultation Fee</span>
                        </span>
                        <p className="font-bold text-[#123B5D] text-[11px]">₹{doc.consultationFee || 700}</p>
                      </div>
                    </div>

                    {/* Available Days in Week */}
                    <div>
                      <span className="text-[10px] text-[#64748B] font-semibold uppercase tracking-wider block mb-1.5">
                        Weekly OPD Availability Days:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {weekDays.map((day) => {
                          const isAvailable = daysList.includes(day);
                          return (
                            <span
                              key={day}
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                isAvailable
                                  ? 'bg-[#1769AA] text-white shadow-2xs'
                                  : 'bg-slate-100 text-slate-400'
                              }`}
                            >
                              {day}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Contact & Action Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-[#64748B]">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-[#1769AA]" />
                          <span>{doc.mobile}</span>
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <label
                          htmlFor={`upload-doctor-btn-${doc.id}`}
                          className="flex items-center space-x-1 px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#1769AA] rounded-xl text-[11px] font-bold cursor-pointer transition-colors border border-sky-100/80"
                          title="Upload / Change Photo from Device"
                        >
                          <Upload className="w-3.5 h-3.5 text-[#1769AA]" />
                          <span>Upload Image</span>
                          <input
                            id={`upload-doctor-btn-${doc.id}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleDirectCardImageUpload(doc.id, e)}
                          />
                        </label>

                        <button
                          onClick={() => handleOpenEdit(doc)}
                          className="p-1.5 hover:bg-slate-100 text-[#1769AA] rounded-xl transition-colors cursor-pointer"
                          title="Edit Doctor Profile"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id, doc.fullName || doc.name || '')}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-xl transition-colors cursor-pointer"
                          title="Delete Doctor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-VIEW 2: RECEPTIONIST ROSTER */}
        {/* ========================================================================= */}
        {activeSubTab === 'receptionists' && (
          <div className="space-y-4">
            {/* Header & Add Receptionist Button */}
            <div className="apple-card p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-[#123B5D]">Receptionist Staff &amp; Shift Management</h3>
                <p className="text-xs text-[#64748B] mt-0.5">Manage front-office receptionists, shift timings, daily work hours, and profile photos.</p>
              </div>

              <button
                onClick={() => handleOpenAdd('receptionist')}
                className="apple-btn-primary px-4 py-2.5 text-xs flex items-center space-x-1.5 cursor-pointer shadow-sm hover:shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add Receptionist</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="apple-card p-4 flex items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search receptionist by name, ID, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl text-xs focus:border-[#1769AA] focus:outline-none"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#1E293B]"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            {/* Receptionists Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredReceptionists.map((rec) => {
                const isActive = rec.isActive !== false;

                return (
                  <div
                    key={rec.id}
                    className={`apple-card p-5 sm:p-6 transition-all space-y-4 ${
                      isActive ? 'hover:shadow-xl' : 'border-red-200/80 bg-red-50/20 opacity-80'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center space-x-3">
                        <div className="relative group/avatar shrink-0">
                          <img
                            src={rec.profilePhoto || PRESET_AVATARS[4].url}
                            alt={rec.fullName || rec.name}
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-xs shrink-0"
                          />
                          <label
                            htmlFor={`upload-rec-img-${rec.id}`}
                            className="absolute inset-0 bg-black/50 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover/avatar:opacity-100 transition-all cursor-pointer shadow-xs backdrop-blur-2xs"
                            title="Click to Upload Photo"
                          >
                            <Camera className="w-4 h-4 text-white" />
                            <span className="text-[8px] font-bold mt-0.5">Upload</span>
                          </label>
                          <input
                            id={`upload-rec-img-${rec.id}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleDirectCardImageUpload(rec.id, e)}
                          />
                        </div>

                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-sm text-[#123B5D]">{rec.fullName || rec.name}</h3>
                            <span className="text-[10px] font-mono bg-slate-100 text-[#64748B] px-1.5 py-0.5 rounded font-bold">
                              {rec.staffId}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-teal-600">{rec.roleTitle || 'OPD Front Desk Officer'}</p>
                          <p className="text-[11px] text-[#64748B]">{rec.department || 'Front Office Desk'}</p>
                        </div>
                      </div>

                      {/* Status Toggle Switch */}
                      <div className="flex flex-col items-end shrink-0">
                        <button
                          onClick={() => toggleStaffActiveStatus(rec.id)}
                          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                          title="Click to toggle receptionist active/inactive status"
                        >
                          {isActive ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-red-600" />}
                          <span>{isActive ? 'Active' : 'Deactivated'}</span>
                        </button>
                        <span className="text-[9px] text-[#64748B] mt-0.5">Click to toggle</span>
                      </div>
                    </div>

                    {/* Shift & Qualifications */}
                    <div className="grid grid-cols-2 gap-2 bg-[#F8FAFC] p-3 rounded-xl text-xs border border-slate-100">
                      <div>
                        <span className="text-[10px] text-[#64748B] font-medium flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-teal-500" />
                          <span>Shift Timing</span>
                        </span>
                        <p className="font-semibold text-[#1E293B] text-[11px]">{rec.shiftTiming || '08:00 AM - 04:00 PM'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#64748B] font-medium flex items-center space-x-1">
                          <Activity className="w-3 h-3 text-indigo-500" />
                          <span>Daily Work Hours</span>
                        </span>
                        <p className="font-semibold text-[#1E293B] text-[11px]">{rec.workingHours || '8 Hours / Day'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#64748B] font-medium flex items-center space-x-1">
                          <Award className="w-3 h-3 text-amber-500" />
                          <span>Qualification</span>
                        </span>
                        <p className="font-semibold text-[#1E293B] text-[11px] truncate">{rec.qualification || 'B.A. Public Relations'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#64748B] font-medium flex items-center space-x-1">
                          <Briefcase className="w-3 h-3 text-emerald-500" />
                          <span>Experience</span>
                        </span>
                        <p className="font-semibold text-[#1E293B] text-[11px]">{rec.experience || '3+ Years'}</p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-[#64748B]">
                      <span className="flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-teal-600" />
                        <span>{rec.mobile}</span>
                      </span>

                      <div className="flex items-center space-x-2">
                        <label
                          htmlFor={`upload-rec-btn-${rec.id}`}
                          className="flex items-center space-x-1 px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl text-[11px] font-bold cursor-pointer transition-colors border border-teal-100/80"
                          title="Upload / Change Photo from Device"
                        >
                          <Upload className="w-3.5 h-3.5 text-teal-700" />
                          <span>Upload Image</span>
                          <input
                            id={`upload-rec-btn-${rec.id}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleDirectCardImageUpload(rec.id, e)}
                          />
                        </label>

                        <button
                          onClick={() => handleOpenEdit(rec)}
                          className="p-1.5 hover:bg-slate-100 text-teal-600 rounded-xl transition-colors cursor-pointer"
                          title="Edit Receptionist"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(rec.id, rec.fullName || rec.name || '')}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-xl transition-colors cursor-pointer"
                          title="Delete Receptionist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-VIEW 3: OPERATIONS OVERVIEW */}
        {/* ========================================================================= */}
        {activeSubTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-4">
              <h3 className="font-bold text-base text-[#123B5D]">Hospital Staff &amp; Shift Roster Summary</h3>
              <p className="text-xs text-[#64748B]">
                As Technician, you maintain complete visibility and real-time control over medical doctor profiles, shift timings, weekly available schedules, and receptionist front office operations.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-xs text-[#123B5D] uppercase tracking-wider mb-2">Doctor Shift Allocation</h4>
                  <p className="text-xs text-slate-600">• Morning OPD: 09:00 AM - 04:30 PM</p>
                  <p className="text-xs text-slate-600">• Evening OPD: 04:30 PM - 08:30 PM</p>
                  <p className="text-xs text-slate-600">• Emergency Call Roster: 24/7 on-rotation</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-xs text-[#123B5D] uppercase tracking-wider mb-2">Reception Desk Coverage</h4>
                  <p className="text-xs text-slate-600">• Shift 1 (Morning): 08:00 AM - 04:00 PM</p>
                  <p className="text-xs text-slate-600">• Shift 2 (Evening): 12:00 PM - 08:00 PM</p>
                  <p className="text-xs text-slate-600">• Shift 3 (Night Intake): 04:00 PM - 12:00 AM</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* ADD / EDIT STAFF MODAL */}
      {/* ========================================================================= */}
      {(showAddModal || editingStaff) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs font-sans animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 space-y-4 animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="font-bold text-base text-[#123B5D]">
                {editingStaff ? 'Edit Staff Profile' : `Add New ${targetRoleType === 'doctor' ? 'Doctor' : 'Receptionist'}`}
              </h3>
              <button
                onClick={() => { setShowAddModal(false); setEditingStaff(null); }}
                className="text-[#64748B] hover:text-[#1E293B] p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingStaff ? handleSaveEdit : handleSaveAdd} className="space-y-4 text-xs">
              
              {/* Photo Selector with Direct Device Upload ONLY */}
              <div className="space-y-2">
                <label className="block font-bold text-xs text-[#123B5D]">Profile Picture</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 p-3.5 bg-[#F8FAFC] rounded-2xl border border-slate-200">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#1769AA]/30 shadow-xs shrink-0 bg-white flex items-center justify-center">
                    {profilePhoto ? (
                      <img src={profilePhoto} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="w-7 h-7 text-slate-400" />
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="apple-btn-primary px-4 py-2 text-xs flex items-center space-x-2 cursor-pointer shadow-xs">
                      <Upload className="w-4 h-4" />
                      <span>Upload Photo from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleModalFileUpload}
                      />
                    </label>
                    {profilePhoto && (
                      <button
                        type="button"
                        onClick={() => setProfilePhoto('')}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1E293B] mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full p-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1E293B] mb-1">Staff / Doctor ID *</label>
                  <input
                    type="text"
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                    className="w-full p-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1E293B] mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full p-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1E293B] mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg"
                  />
                </div>
              </div>

              {targetRoleType === 'doctor' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#1E293B] mb-1">Department</label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full p-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg"
                    >
                      {hospital.departments?.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-[#1E293B] mb-1">Specialization / Role Title</label>
                    <input
                      type="text"
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      placeholder="e.g. Senior Cardiologist"
                      className="w-full p-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-[#1E293B] mb-1">Specialization / Role Title</label>
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder="e.g. OPD Reception Officer"
                    className="w-full p-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1E293B] mb-1">Qualification</label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="e.g. MBBS, MD (Cardio)"
                    className="w-full p-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1E293B] mb-1">Experience</label>
                  <input
                    type="text"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="e.g. 12+ Years"
                    className="w-full p-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1E293B] mb-1">Shift Timing</label>
                  <input
                    type="text"
                    value={shiftTiming}
                    onChange={(e) => setShiftTiming(e.target.value)}
                    placeholder="e.g. 09:00 AM - 05:00 PM"
                    className="w-full p-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1E293B] mb-1">
                    {targetRoleType === 'doctor' ? 'Consultation Fee (₹)' : 'Daily Work Hours'}
                  </label>
                  {targetRoleType === 'doctor' ? (
                    <input
                      type="number"
                      value={consultationFee}
                      onChange={(e) => setConsultationFee(Number(e.target.value))}
                      className="w-full p-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg"
                    />
                  ) : (
                    <input
                      type="text"
                      value={workingHours}
                      onChange={(e) => setWorkingHours(e.target.value)}
                      className="w-full p-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg"
                    />
                  )}
                </div>
              </div>

              {/* Weekly Available Days */}
              {targetRoleType === 'doctor' && (
                <div>
                  <label className="block font-semibold text-[#1E293B] mb-1.5">Weekly Availability Days</label>
                  <div className="flex flex-wrap gap-1.5">
                    {weekDays.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleToggleDay(day)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          availableDays.includes(day)
                            ? 'bg-[#1769AA] text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingStaff(null); }}
                  className="px-4 py-2 bg-slate-100 text-[#64748B] rounded-lg font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#1769AA] hover:bg-[#123B5D] text-white rounded-lg font-semibold cursor-pointer shadow-xs"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
