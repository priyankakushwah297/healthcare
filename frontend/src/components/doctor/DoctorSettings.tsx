import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Building,
  Award,
  Clock,
  DollarSign,
  Save,
  Edit2,
  CheckCircle2,
  Stethoscope,
  MapPin,
  ShieldCheck,
  Camera,
  Upload
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { DoctorNavTabs } from './DoctorNavTabs';

export const DoctorSettings: React.FC<{ hideTabs?: boolean }> = ({ hideTabs }) => {
  const { currentUser, staff, updateStaff, updateUserProfile } = useHospital();

  // Dynamically resolve the live doctor record from staff or currentUser
  const activeDoctor: any = staff.find(s =>
    (s.staffType || s.type) === 'doctor' && (
      s.staffId === (currentUser?.staffId || currentUser?.doctorId) ||
      s.id === currentUser?.id ||
      s.fullName === currentUser?.fullName ||
      s.name === currentUser?.fullName
    )
  ) || currentUser;

  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [fullName, setFullName] = useState(activeDoctor?.fullName || activeDoctor?.name || 'Dr. Arvind Sharma');
  const [doctorId, setDoctorId] = useState(activeDoctor?.staffId || activeDoctor?.doctorId || 'DOC-KLP-101');
  const [specialization, setSpecialization] = useState(activeDoctor?.specialization || activeDoctor?.roleTitle || 'Senior Interventional Cardiologist');
  const [department, setDepartment] = useState(activeDoctor?.department || 'Cardiology');
  const [qualification, setQualification] = useState(activeDoctor?.qualification || 'MBBS, MD (Cardio), DM, FACC');
  const [experience, setExperience] = useState(activeDoctor?.experience || '18 Years');
  const [mobileNumber, setMobileNumber] = useState(activeDoctor?.mobile || activeDoctor?.mobileNumber || '9876543220');
  const [email, setEmail] = useState(activeDoctor?.email || 'dr.arvind@healthcare.com');
  const [clinicName, setClinicName] = useState(activeDoctor?.clinicName || 'Healthcare Center');
  const [clinicAddress, setClinicAddress] = useState(activeDoctor?.clinicAddress || 'Plot 42, Medical Enclave, Health City, New Delhi');
  const [consultationFee, setConsultationFee] = useState(activeDoctor?.consultationFee || '₹800');
  const [workingHours, setWorkingHours] = useState(activeDoctor?.workingHours || '09:00 AM - 04:30 PM (Mon-Sat)');
  const [profilePhoto, setProfilePhoto] = useState(activeDoctor?.profilePhoto || activeDoctor?.avatar || '');

  // Synchronize when technician or external updates happen
  useEffect(() => {
    if (activeDoctor) {
      setFullName(activeDoctor.fullName || activeDoctor.name || 'Dr. Arvind Sharma');
      setDoctorId(activeDoctor.staffId || activeDoctor.doctorId || 'DOC-KLP-101');
      setSpecialization(activeDoctor.specialization || activeDoctor.roleTitle || 'Senior Interventional Cardiologist');
      setDepartment(activeDoctor.department || 'Cardiology');
      setQualification(activeDoctor.qualification || 'MBBS, MD (Cardio), DM, FACC');
      setExperience(activeDoctor.experience || '18 Years');
      setMobileNumber(activeDoctor.mobile || activeDoctor.mobileNumber || '9876543220');
      setEmail(activeDoctor.email || 'dr.arvind@healthcare.com');
      setClinicName(activeDoctor.clinicName || 'Healthcare Center');
      setClinicAddress(activeDoctor.clinicAddress || 'Plot 42, Medical Enclave, Health City, New Delhi');
      setConsultationFee(activeDoctor.consultationFee || '₹800');
      setWorkingHours(activeDoctor.workingHours || '09:00 AM - 04:30 PM (Mon-Sat)');
      setProfilePhoto(activeDoctor.profilePhoto || activeDoctor.avatar || '');
    }
  }, [activeDoctor]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const docStaffId = doctorId || activeDoctor?.staffId || currentUser?.staffId || currentUser?.id;
    
    await updateStaff(docStaffId, {
      fullName,
      name: fullName,
      specialization,
      roleTitle: specialization,
      department,
      qualification,
      experience,
      mobile: mobileNumber,
      email,
      consultationFee,
      workingHours,
      profilePhoto
    });

    if (currentUser?.id) {
      updateUserProfile(currentUser.id, {
        fullName,
        specialization,
        department,
        qualification,
        experience,
        mobileNumber,
        email,
        clinicName,
        clinicAddress,
        consultationFee,
        workingHours,
        profilePhoto,
        avatar: profilePhoto
      });
    }

    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn text-[#1E293B] font-sans">
      {!hideTabs && <DoctorNavTabs currentTab="settings" />}

      {/* Profile Header (Dynamically Synchronized with Technician Updates) */}
      <div className="bg-[#123B5D] rounded-2xl p-6 text-white shadow-md border border-[#1769AA]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative group w-18 h-18 rounded-2xl bg-[#1769AA] text-white flex items-center justify-center font-bold text-2xl border-2 border-[#159A9C] overflow-hidden shadow-xs shrink-0">
            {profilePhoto ? (
              <img src={profilePhoto} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              (fullName.charAt(0) || 'D').toUpperCase()
            )}
            {isEditing && (
              <label className="absolute inset-0 bg-black/60 text-white flex flex-col items-center justify-center cursor-pointer transition-opacity">
                <Camera className="w-4 h-4" />
                <span className="text-[8px] font-bold mt-0.5">Upload</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            )}
          </div>
          <div>
            <span className="text-[11px] font-bold bg-[#1769AA] px-2.5 py-0.5 rounded text-white uppercase">
              Doctor Profile &amp; Settings
            </span>
            <h1 className="text-2xl font-bold text-white mt-1">{fullName}</h1>
            <p className="text-xs text-[#CBD5E1]">Doctor ID: <strong className="text-white font-mono">{doctorId}</strong> • {specialization}</p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="bg-[#1769AA] hover:bg-[#159A9C] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer flex items-center space-x-1.5 shadow-xs"
        >
          <Edit2 className="w-4 h-4" />
          <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-[#16845B]/10 border border-[#16845B]/30 rounded-xl text-xs font-semibold text-[#16845B] flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Doctor profile updated and saved to database successfully!</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-xl p-6 border border-[#E2E8F0] shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <h3 className="font-bold text-base text-[#123B5D]">Doctor Profile Details</h3>
          <span className="text-xs text-[#64748B]">{isEditing ? 'Editing Mode' : 'Read-only View'}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          
          <div>
            <label className="block font-semibold text-[#123B5D] mb-1">Full Name</label>
            <input
              type="text"
              disabled={!isEditing}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-[#1E293B] disabled:opacity-70 focus:border-[#1769AA] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#123B5D] mb-1">Doctor ID</label>
            <input
              type="text"
              disabled={true}
              value={doctorId}
              className="w-full px-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-[#1E293B] opacity-70"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#123B5D] mb-1">Specialization</label>
            <input
              type="text"
              disabled={!isEditing}
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-[#1E293B] disabled:opacity-70 focus:border-[#1769AA] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#123B5D] mb-1">Department</label>
            <input
              type="text"
              disabled={!isEditing}
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-[#1E293B] disabled:opacity-70 focus:border-[#1769AA] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#123B5D] mb-1">Qualification</label>
            <input
              type="text"
              disabled={!isEditing}
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-[#1E293B] disabled:opacity-70 focus:border-[#1769AA] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#123B5D] mb-1">Experience</label>
            <input
              type="text"
              disabled={!isEditing}
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-[#1E293B] disabled:opacity-70 focus:border-[#1769AA] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#123B5D] mb-1">Mobile Number</label>
            <input
              type="text"
              disabled={!isEditing}
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-[#1E293B] disabled:opacity-70 focus:border-[#1769AA] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#123B5D] mb-1">Email Address</label>
            <input
              type="email"
              disabled={!isEditing}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-[#1E293B] disabled:opacity-70 focus:border-[#1769AA] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#123B5D] mb-1">Clinic / Hospital Name</label>
            <input
              type="text"
              disabled={!isEditing}
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-[#1E293B] disabled:opacity-70 focus:border-[#1769AA] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-[#123B5D] mb-1">Consultation Fee</label>
            <input
              type="text"
              disabled={!isEditing}
              value={consultationFee}
              onChange={(e) => setConsultationFee(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-[#1E293B] disabled:opacity-70 focus:border-[#1769AA] focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-semibold text-[#123B5D] mb-1">Clinic Address</label>
            <input
              type="text"
              disabled={!isEditing}
              value={clinicAddress}
              onChange={(e) => setClinicAddress(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-[#1E293B] disabled:opacity-70 focus:border-[#1769AA] focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-semibold text-[#123B5D] mb-1">Available Days & Working Hours</label>
            <input
              type="text"
              disabled={!isEditing}
              value={workingHours}
              onChange={(e) => setWorkingHours(e.target.value)}
              className="w-full px-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg text-[#1E293B] disabled:opacity-70 focus:border-[#1769AA] focus:outline-none"
            />
          </div>

        </div>

        {isEditing && (
          <div className="pt-4 border-t border-[#E2E8F0] flex justify-end">
            <button
              type="submit"
              className="bg-[#1769AA] hover:bg-[#123B5D] text-white px-6 py-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
