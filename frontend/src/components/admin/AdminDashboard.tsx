import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  UserCheck,
  Stethoscope,
  Activity,
  Plus,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Settings,
  Pill,
  BarChart3,
  DollarSign,
  AlertCircle,
  Upload,
  Edit2,
  Trash2,
  X,
  User,
  Image as ImageIcon,
  Filter,
  Phone,
  Mail,
  Clock,
  Calendar,
  Camera,
  Link as LinkIcon,
  Sparkles,
  Check,
  BedDouble,
  Receipt,
  HeartPulse,
  Award,
  Briefcase,
  XCircle,
  Search
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { StaffMember, UserProfile } from '../../types';
import { PortalSidebar } from '../layout/PortalSidebar';
import { compressImageFile } from '../../utils/imageCompressor';

const PRESET_AVATARS = [
  { name: 'Hospital Director', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=250&auto=format&fit=crop&q=80' },
  { name: 'Systems Technician', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80' },
  { name: 'Senior Cardiologist', url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=250&auto=format&fit=crop&q=80' },
  { name: 'Neuro Specialist', url: 'https://images.unsplash.com/photo-1594824813570-87b64010b991?w=250&auto=format&fit=crop&q=80' },
  { name: 'Physician', url: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=250&auto=format&fit=crop&q=80' },
  { name: 'Lead Receptionist', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=250&auto=format&fit=crop&q=80' },
  { name: 'OPD Receptionist', url: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=250&auto=format&fit=crop&q=80' }
];

export const AdminDashboard: React.FC = () => {
  const {
    staff,
    users,
    appointments,
    prescriptions,
    hospital,
    updateHospitalInfo,
    addStaff,
    updateStaff,
    deleteStaff,
    toggleStaffActiveStatus,
    registerPatientByReceptionist,
    activeTab
  } = useHospital();

  const [activeSubTab, setActiveSubTab] = useState<string>(() => {
    return (activeTab && activeTab !== 'dashboard') ? activeTab : 'dashboard';
  });

  useEffect(() => {
    if (activeTab && ['dashboard', 'technicians', 'receptionists', 'doctors', 'patients'].includes(activeTab)) {
      setActiveSubTab(activeTab);
    }
  }, [activeTab]);

  const [successMessage, setSuccessMessage] = useState('');
  const [isSavingBranding, setIsSavingBranding] = useState(false);

  // Branding Form State
  const [brandName, setBrandName] = useState(hospital.name || 'Healthcare Center');
  const [brandTagline, setBrandTagline] = useState(hospital.tagline || 'Advanced EHR Medical System');
  const [brandLogo, setBrandLogo] = useState(hospital.logo || '');
  const [brandPhone, setBrandPhone] = useState(hospital.phone || '+91 11 2678 9000');
  const [brandEmergency, setBrandEmergency] = useState(hospital.emergencyPhone || '+91 11 2678 9999 / 108');
  const [brandAddress, setBrandAddress] = useState(hospital.address || 'Plot 42, Medical Enclave, Health City, New Delhi');
  const [brandTotalBeds, setBrandTotalBeds] = useState(hospital.totalBeds || 350);
  const [brandIcuBeds, setBrandIcuBeds] = useState(hospital.icuBeds || 45);
  const [brandAmbulances, setBrandAmbulances] = useState(hospital.ambulances || 12);

  // Sync Branding Form if hospital info updates
  useEffect(() => {
    if (hospital) {
      if (hospital.name) setBrandName(hospital.name);
      if (hospital.tagline) setBrandTagline(hospital.tagline);
      if (hospital.logo !== undefined) setBrandLogo(hospital.logo);
      if (hospital.phone) setBrandPhone(hospital.phone);
      if (hospital.emergencyPhone) setBrandEmergency(hospital.emergencyPhone);
      if (hospital.address) setBrandAddress(hospital.address);
      if (hospital.totalBeds) setBrandTotalBeds(hospital.totalBeds);
      if (hospital.icuBeds) setBrandIcuBeds(hospital.icuBeds);
      if (hospital.ambulances) setBrandAmbulances(hospital.ambulances);
    }
  }, [hospital]);

  // Department State
  const [departmentsList, setDepartmentsList] = useState<string[]>(hospital.departments || [
    'Cardiology', 'Orthopedics', 'Neurology', 'Pediatrics', 'General Medicine', 'Dermatology'
  ]);
  const [newDeptName, setNewDeptName] = useState('');

  // Search & Filter State for each list
  const [techSearchTerm, setTechSearchTerm] = useState('');
  const [techDeptFilter, setTechDeptFilter] = useState('all');

  const [recSearchTerm, setRecSearchTerm] = useState('');
  const [recStatusFilter, setRecStatusFilter] = useState<'all' | 'active' | 'deactivated'>('all');

  const [docSearchTerm, setDocSearchTerm] = useState('');
  const [docDeptFilter, setDocDeptFilter] = useState('all');
  const [docStatusFilter, setDocStatusFilter] = useState<'all' | 'active' | 'deactivated'>('all');

  const [patientSearchTerm, setPatientSearchTerm] = useState('');
  const [patientDeptFilter, setPatientDeptFilter] = useState('all');
  const [patientStatusFilter, setPatientStatusFilter] = useState('all');
  const [selectedPatientModal, setSelectedPatientModal] = useState<any | null>(null);

  // Appointments Desk Filters
  const [aptSearchTerm, setAptSearchTerm] = useState('');
  const [aptDeptFilter, setAptDeptFilter] = useState('all');
  const [aptStatusFilter, setAptStatusFilter] = useState('all');

  // Modal State for Adding / Editing Staff
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalRoleType, setModalRoleType] = useState<'technician' | 'doctor' | 'receptionist' | 'patient'>('doctor');
  const [editingStaffMember, setEditingStaffMember] = useState<StaffMember | null>(null);

  // Form Fields
  const [formFullName, setFormFullName] = useState('');
  const [formStaffId, setFormStaffId] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDept, setFormDept] = useState('Cardiology');
  const [formSpecialization, setFormSpecialization] = useState('Senior Consultant');
  const [formQualification, setFormQualification] = useState('MBBS, MD');
  const [formExperience, setFormExperience] = useState('10+ Years');
  const [formConsultationFee, setFormConsultationFee] = useState<number>(700);
  const [formShiftTiming, setFormShiftTiming] = useState('09:00 AM - 05:00 PM');
  const [formWorkingHours, setFormWorkingHours] = useState('8 Hours / Day');
  const [formAvailableDays, setFormAvailableDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  const [formPhoto, setFormPhoto] = useState(PRESET_AVATARS[0].url);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Categorized lists
  const techniciansList = staff.filter(s => s.type === 'technician' || s.staffType === 'technician');
  const doctorsList = staff.filter(s => s.type === 'doctor' || s.staffType === 'doctor');
  const receptionistsList = staff.filter(s => s.type === 'receptionist' || s.staffType === 'receptionist');

  // Comprehensive Dynamic Patients Directory aggregated from Users, Appointments, & Clinical Records
  const dynamicPatientsList = React.useMemo(() => {
    const list: (UserProfile & {
      appointmentCount: number;
      completedCount: number;
      activeCount: number;
      latestAppointment?: any;
      allAppointments: any[];
      calculatedStatus: 'Active' | 'Under Observation' | 'Completed';
    })[] = [];
    const seenIds = new Set<string>();
    const seenMobiles = new Set<string>();

    users.filter(u => u.role === 'patient').forEach(u => {
      const cleanMob = (u.mobile || (u as any).mobileNumber || '').replace(/[^0-9]/g, '');
      seenIds.add(u.id);
      if (u.patientId) seenIds.add(u.patientId);
      if (cleanMob) seenMobiles.add(cleanMob);

      const patApts = appointments.filter(a =>
        a.patientId === u.id ||
        a.patientId === u.patientId ||
        (cleanMob && (a.patientMobile || '').replace(/[^0-9]/g, '') === cleanMob) ||
        (a.patientName && a.patientName.toLowerCase() === u.fullName.toLowerCase())
      );

      const completed = patApts.filter(a => a.status === 'completed' || a.status === 'Completed').length;
      const active = patApts.filter(a => a.status !== 'completed' && a.status !== 'Completed').length;
      const latest = patApts[patApts.length - 1];

      let status: 'Active' | 'Under Observation' | 'Completed' = 'Active';
      if (completed > 0 && active === 0) status = 'Completed';
      else if (completed > 0 && active > 0) status = 'Under Observation';
      else if (active > 0) status = 'Active';
      else if (u.treatmentStatus) status = u.treatmentStatus as any;

      list.push({
        ...u,
        appointmentCount: patApts.length,
        completedCount: completed,
        activeCount: active,
        latestAppointment: latest,
        allAppointments: patApts,
        calculatedStatus: status,
        treatmentStatus: status,
        currentTreatmentDepartment: latest?.department || u.currentTreatmentDepartment || 'General Medicine'
      });
    });

    appointments.forEach(apt => {
      const cleanMob = (apt.patientMobile || '').replace(/[^0-9]/g, '');
      const hasId = apt.patientId && seenIds.has(apt.patientId);
      const hasMobile = cleanMob && seenMobiles.has(cleanMob);

      if (!hasId && !hasMobile && apt.patientName) {
        const id = apt.patientId || `pat-${cleanMob || Date.now()}`;
        seenIds.add(id);
        if (cleanMob) seenMobiles.add(cleanMob);

        const patApts = appointments.filter(a =>
          (a.patientId && a.patientId === apt.patientId) ||
          (cleanMob && (a.patientMobile || '').replace(/[^0-9]/g, '') === cleanMob) ||
          (a.patientName && a.patientName.toLowerCase() === apt.patientName.toLowerCase())
        );

        const completed = patApts.filter(a => a.status === 'completed' || a.status === 'Completed').length;
        const active = patApts.filter(a => a.status !== 'completed' && a.status !== 'Completed').length;

        let status: 'Active' | 'Under Observation' | 'Completed' = 'Active';
        if (completed > 0 && active === 0) status = 'Completed';
        else if (completed > 0 && active > 0) status = 'Under Observation';
        else if (active > 0) status = 'Active';

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
          appointmentCount: patApts.length,
          completedCount: completed,
          activeCount: active,
          latestAppointment: apt,
          allAppointments: patApts,
          calculatedStatus: status,
          treatmentStatus: status,
          currentTreatmentDepartment: apt.department || 'General Medicine',
          createdAt: apt.createdAt || new Date().toISOString().split('T')[0]
        });
      }
    });

    return list;
  }, [users, appointments]);

  const patientsList = dynamicPatientsList;

  // Filtered Technicians
  const filteredTechnicians = techniciansList.filter(tech => {
    const matchesSearch = !techSearchTerm ||
      (tech.fullName || tech.name || '').toLowerCase().includes(techSearchTerm.toLowerCase()) ||
      (tech.staffId || '').toLowerCase().includes(techSearchTerm.toLowerCase()) ||
      (tech.mobile || '').includes(techSearchTerm) ||
      (tech.email || '').toLowerCase().includes(techSearchTerm.toLowerCase());
    const matchesDept = techDeptFilter === 'all' || tech.department === techDeptFilter;
    return matchesSearch && matchesDept;
  });

  // Filtered Receptionists
  const filteredReceptionists = receptionistsList.filter(rec => {
    const matchesSearch = !recSearchTerm ||
      (rec.fullName || rec.name || '').toLowerCase().includes(recSearchTerm.toLowerCase()) ||
      (rec.staffId || '').toLowerCase().includes(recSearchTerm.toLowerCase()) ||
      (rec.mobile || '').includes(recSearchTerm) ||
      (rec.email || '').toLowerCase().includes(recSearchTerm.toLowerCase());
    const matchesStatus = recStatusFilter === 'all' || 
      (recStatusFilter === 'active' ? rec.isActive !== false : rec.isActive === false);
    return matchesSearch && matchesStatus;
  });

  // Filtered Doctors
  const filteredDoctors = doctorsList.filter(doc => {
    const matchesSearch = !docSearchTerm ||
      (doc.fullName || doc.name || '').toLowerCase().includes(docSearchTerm.toLowerCase()) ||
      (doc.staffId || '').toLowerCase().includes(docSearchTerm.toLowerCase()) ||
      (doc.mobile || '').includes(docSearchTerm) ||
      (doc.specialization || '').toLowerCase().includes(docSearchTerm.toLowerCase());
    const matchesDept = docDeptFilter === 'all' || doc.department === docDeptFilter;
    const matchesStatus = docStatusFilter === 'all' ||
      (docStatusFilter === 'active' ? doc.isActive !== false : doc.isActive === false);
    return matchesSearch && matchesDept && matchesStatus;
  });

  // Filtered Patients with accurate status matching
  const filteredPatients = dynamicPatientsList.filter(pat => {
    const matchesSearch = !patientSearchTerm ||
      (pat.fullName || '').toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
      (pat.patientId || pat.id || '').toLowerCase().includes(patientSearchTerm.toLowerCase()) ||
      (pat.mobile || '').includes(patientSearchTerm) ||
      (pat.email || '').toLowerCase().includes(patientSearchTerm.toLowerCase());
    const matchesDept = patientDeptFilter === 'all' || pat.currentTreatmentDepartment === patientDeptFilter;
    
    let matchesStatus = true;
    if (patientStatusFilter === 'all') {
      matchesStatus = true;
    } else if (patientStatusFilter === 'Completed') {
      matchesStatus = pat.treatmentStatus === 'Completed' || pat.completedCount > 0;
    } else if (patientStatusFilter === 'Active') {
      matchesStatus = pat.treatmentStatus === 'Active' || pat.activeCount > 0;
    } else if (patientStatusFilter === 'Under Observation') {
      matchesStatus = pat.treatmentStatus === 'Under Observation';
    } else {
      matchesStatus = pat.treatmentStatus === patientStatusFilter;
    }

    return matchesSearch && matchesDept && matchesStatus;
  });

  // Filtered Appointments for Admin Appointments Desk
  const todayDateStr = new Date().toISOString().split('T')[0];
  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = !aptSearchTerm ||
      apt.patientName.toLowerCase().includes(aptSearchTerm.toLowerCase()) ||
      apt.bookingRef.toLowerCase().includes(aptSearchTerm.toLowerCase()) ||
      apt.doctorName.toLowerCase().includes(aptSearchTerm.toLowerCase()) ||
      apt.department.toLowerCase().includes(aptSearchTerm.toLowerCase()) ||
      (apt.patientMobile || '').includes(aptSearchTerm);
    
    const matchesDept = aptDeptFilter === 'all' || apt.department === aptDeptFilter;
    
    let matchesStatus = true;
    if (aptStatusFilter === 'all') {
      matchesStatus = true;
    } else if (aptStatusFilter === 'completed') {
      matchesStatus = apt.status === 'completed' || apt.status === 'Completed';
    } else if (aptStatusFilter === 'today') {
      matchesStatus = (apt.status === 'today' || apt.date === todayDateStr) && apt.status !== 'completed' && apt.status !== 'Completed';
    } else if (aptStatusFilter === 'pending') {
      matchesStatus = apt.status === 'pending' || apt.status === 'checked_in' || apt.status === 'Pending';
    } else if (aptStatusFilter === 'upcoming') {
      matchesStatus = apt.status === 'upcoming' || apt.status === 'scheduled' || apt.status === 'Scheduled';
    } else {
      matchesStatus = apt.status === aptStatusFilter;
    }

    return matchesSearch && matchesDept && matchesStatus;
  });

  // Stats
  const totalRevenue = appointments.reduce((sum, a) => sum + (Number(a.consultationFee) || Number(a.amount) || 700), 0);
  const totalCompletedApts = appointments.filter(a => a.status === 'completed' || a.status === 'Completed').length;
  const totalTodayApts = appointments.filter(a => (a.status === 'today' || a.date === todayDateStr) && a.status !== 'completed' && a.status !== 'Completed').length;
  const totalUpcomingApts = appointments.filter(a => a.status === 'upcoming' || a.status === 'scheduled' || a.status === 'Scheduled').length;

  const handleOpenAddModal = (role: 'technician' | 'doctor' | 'receptionist' | 'patient') => {
    setModalRoleType(role);
    setEditingStaffMember(null);
    setFormFullName('');
    setFormStaffId(
      role === 'doctor' ? `DOC-KLP-${Math.floor(100 + Math.random() * 900)}` :
      role === 'receptionist' ? `REC-KLP-0${receptionistsList.length + 1}` :
      role === 'technician' ? `TECH-KLP-0${techniciansList.length + 1}` :
      `PAT-2026-${1000 + patientsList.length + 1}`
    );
    setFormMobile('');
    setFormEmail('');
    setFormDept(role === 'doctor' ? 'Cardiology' : 'Hospital Administration');
    setFormSpecialization(role === 'doctor' ? 'Consultant Physician' : role === 'technician' ? 'Systems Technician' : 'Front Desk Officer');
    setFormQualification(role === 'doctor' ? 'MBBS, MD' : role === 'technician' ? 'B.Tech IT' : 'B.A. Hospital PR');
    setFormExperience('5+ Years');
    setFormConsultationFee(750);
    setFormShiftTiming(role === 'doctor' ? '09:00 AM - 04:30 PM' : '08:00 AM - 04:00 PM');
    setFormWorkingHours('8 Hours / Day');
    setFormAvailableDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
    setFormPhoto(role === 'doctor' ? PRESET_AVATARS[2].url : role === 'receptionist' ? PRESET_AVATARS[5].url : PRESET_AVATARS[1].url);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (s: StaffMember) => {
    setEditingStaffMember(s);
    setModalRoleType((s.type || s.staffType || 'doctor') as any);
    setFormFullName(s.name || s.fullName || '');
    setFormStaffId(s.staffId || '');
    setFormMobile(s.mobile || '');
    setFormEmail(s.email || '');
    setFormDept(s.department || 'General Medicine');
    setFormSpecialization(s.specialization || s.roleTitle || '');
    setFormQualification(s.qualification || '');
    setFormExperience(s.experience || '');
    setFormConsultationFee(Number(s.consultationFee) || 700);
    setFormShiftTiming(s.shiftTiming || '09:00 AM - 05:00 PM');
    setFormWorkingHours(s.workingHours || '8 Hours / Day');
    setFormAvailableDays(
      Array.isArray(s.availableDays) 
        ? s.availableDays 
        : typeof s.availableDays === 'string' 
          ? s.availableDays.split(',').map(d => d.trim()) 
          : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    );
    setFormPhoto(s.profilePhoto || PRESET_AVATARS[0].url);
    setShowAddModal(true);
  };

  const handleDirectCardImageUpload = async (staffId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedDataUrl = await compressImageFile(file, 400, 400, 0.85);
      await updateStaff(staffId, { profilePhoto: compressedDataUrl });
      setSuccessMessage('Staff profile photo updated successfully in database!');
      setTimeout(() => setSuccessMessage(''), 3500);
    } catch (err) {
      console.error('Image compression error:', err);
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        await updateStaff(staffId, { profilePhoto: base64 });
        setSuccessMessage('Staff profile photo updated successfully in database!');
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
      setFormPhoto(compressedDataUrl);
    } catch (err) {
      console.error('Modal image compression error:', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormPhoto(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveStaffForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFullName.trim() || !formMobile.trim()) return;

    if (modalRoleType === 'patient') {
      await registerPatientByReceptionist({
        fullName: formFullName,
        mobile: formMobile,
        email: formEmail,
        dobOrAge: '30 Years',
        gender: 'Male',
        bloodGroup: 'O+',
        address: 'New Delhi'
      });
      setShowAddModal(false);
      setSuccessMessage(`Patient "${formFullName}" added to master database!`);
      setTimeout(() => setSuccessMessage(''), 4000);
      return;
    }

    if (editingStaffMember) {
      await updateStaff(editingStaffMember.id, {
        name: formFullName,
        fullName: formFullName,
        staffId: formStaffId,
        mobile: formMobile,
        email: formEmail,
        department: formDept,
        specialization: formSpecialization,
        roleTitle: formSpecialization,
        qualification: formQualification,
        experience: formExperience,
        consultationFee: formConsultationFee,
        shiftTiming: formShiftTiming,
        workingHours: formWorkingHours,
        availableDays: formAvailableDays,
        profilePhoto: formPhoto
      });
      setSuccessMessage(`Updated details for "${formFullName}"!`);
    } else {
      await addStaff({
        name: formFullName,
        fullName: formFullName,
        staffId: formStaffId,
        mobile: formMobile,
        email: formEmail || `${formFullName.toLowerCase().replace(/\s+/g, '.')}@healthcare.com`,
        type: modalRoleType,
        staffType: modalRoleType,
        department: formDept,
        specialization: formSpecialization,
        roleTitle: formSpecialization,
        qualification: formQualification,
        experience: formExperience,
        consultationFee: formConsultationFee,
        shiftTiming: formShiftTiming,
        workingHours: formWorkingHours,
        availableDays: formAvailableDays,
        isActive: true,
        profilePhoto: formPhoto
      });
      setSuccessMessage(`Added new ${modalRoleType} "${formFullName}"!`);
    }

    setShowAddModal(false);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedDataUrl = await compressImageFile(file, 400, 400, 0.9);
      setBrandLogo(compressedDataUrl);
      updateHospitalInfo({ logo: compressedDataUrl });
      setSuccessMessage('Hospital logo updated from file and saved globally!');
      setTimeout(() => setSuccessMessage(''), 3500);
    } catch (err) {
      console.error('Logo file compression error:', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setBrandLogo(base64);
        updateHospitalInfo({ logo: base64 });
        setSuccessMessage('Hospital logo updated from file and saved globally!');
        setTimeout(() => setSuccessMessage(''), 3500);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveBranding = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingBranding(true);
    updateHospitalInfo({
      name: brandName,
      tagline: brandTagline,
      logo: brandLogo,
      phone: brandPhone,
      emergencyPhone: brandEmergency,
      address: brandAddress,
      totalBeds: Number(brandTotalBeds),
      icuBeds: Number(brandIcuBeds),
      ambulances: Number(brandAmbulances)
    });
    setSuccessMessage('Hospital branding, name, and logo successfully saved globally to system database!');
    setTimeout(() => {
      setIsSavingBranding(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 800);
  };

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    if (!departmentsList.includes(newDeptName.trim())) {
      const updated = [...departmentsList, newDeptName.trim()];
      setDepartmentsList(updated);
      updateHospitalInfo({ departments: updated });
      setNewDeptName('');
      setSuccessMessage(`Department "${newDeptName}" added to hospital master.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  const handleDeleteDepartment = (dept: string) => {
    const updated = departmentsList.filter(d => d !== dept);
    setDepartmentsList(updated);
    updateHospitalInfo({ departments: updated });
    setSuccessMessage(`Department "${dept}" removed.`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from hospital database?`)) {
      await deleteStaff(id);
      setSuccessMessage(`Removed "${name}" from master registry.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

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
        {/* SUB-VIEW 1: DASHBOARD (APP ANALYTICS, BRANDING & LOGO, DEPARTMENTS) */}
        {/* ========================================================================= */}
        {activeSubTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Top 4 KPI Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="apple-card p-5 space-y-1">
                <div className="flex items-center justify-between text-xs text-[#64748B]">
                  <span className="font-medium">Total System Revenue</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-[#123B5D] mt-1">₹{totalRevenue.toLocaleString()}</p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">+14% vs Previous Month</p>
              </div>

              <div className="apple-card p-5 space-y-1">
                <div className="flex items-center justify-between text-xs text-[#64748B]">
                  <span className="font-medium">Total Appointments</span>
                  <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-[#123B5D] mt-1">{appointments.length}</p>
                <p className="text-[11px] text-sky-600 font-semibold mt-0.5">Live OPD Scheduled</p>
              </div>

              <div className="apple-card p-5 space-y-1">
                <div className="flex items-center justify-between text-xs text-[#64748B]">
                  <span className="font-medium">Registered Patients</span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-[#123B5D] mt-1">{patientsList.length}</p>
                <p className="text-[11px] text-indigo-600 font-semibold mt-0.5">EHR Profiles Connected</p>
              </div>

              <div className="apple-card p-5 space-y-1">
                <div className="flex items-center justify-between text-xs text-[#64748B]">
                  <span className="font-medium">Medical Staff</span>
                  <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                    <UserCheck className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-2xl font-extrabold text-[#123B5D] mt-1">{staff.length}</p>
                <p className="text-[11px] text-teal-600 font-semibold mt-0.5">
                  {doctorsList.length} Docs • {receptionistsList.length} Rec • {techniciansList.length} Tech
                </p>
              </div>
            </div>

            {/* Bed Occupancy & Department Distribution Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Bed Occupancy */}
              <div className="apple-card p-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-[#123B5D] flex items-center space-x-2">
                    <BedDouble className="w-4 h-4 text-[#1769AA]" />
                    <span>Hospital Bed Capacity</span>
                  </h3>
                  <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-100">
                    {Math.round(((hospital.occupiedBeds || 268) / (hospital.totalBeds || 350)) * 100)}% Occupancy
                  </span>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#64748B]">Total Hospital Beds:</span>
                    <span className="font-bold text-[#123B5D]">{hospital.totalBeds || 350} Beds</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden flex shadow-inner">
                    <div
                      className="bg-gradient-to-r from-[#123B5D] to-[#1769AA] h-full"
                      style={{ width: `${((hospital.occupiedBeds || 268) / (hospital.totalBeds || 350)) * 100}%` }}
                    />
                    <div
                      className="bg-emerald-500 h-full"
                      style={{ width: `${((hospital.totalBeds - (hospital.occupiedBeds || 268)) / (hospital.totalBeds || 350)) * 100}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                    <div className="p-3 bg-sky-50/70 rounded-2xl border border-sky-100/80">
                      <span className="text-[10px] text-sky-800 font-semibold">Occupied Beds</span>
                      <p className="text-lg font-bold text-sky-900 mt-0.5">{hospital.occupiedBeds || 268}</p>
                    </div>
                    <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-100/80">
                      <span className="text-[10px] text-emerald-800 font-semibold">Vacant / Available</span>
                      <p className="text-lg font-bold text-emerald-900 mt-0.5">{(hospital.totalBeds || 350) - (hospital.occupiedBeds || 268)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Department Workload Breakdown */}
              <div className="lg:col-span-2 apple-card p-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-bold text-sm text-[#123B5D] flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-[#1769AA]" />
                    <span>Clinical Department Workload</span>
                  </h3>
                  <span className="text-xs text-[#64748B] font-semibold">{departmentsList.length} Active Wings</span>
                </div>

                <div className="space-y-3.5 pt-2">
                  {departmentsList.slice(0, 5).map((dept, index) => {
                    const count = appointments.filter(a => a.department === dept).length || (index + 2) * 4;
                    const pct = Math.min(100, Math.round((count / 30) * 100));
                    return (
                      <div key={dept} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#1E293B]">{dept}</span>
                          <span className="text-[#64748B] font-mono">{count} Consultations ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner">
                          <div
                            className="bg-gradient-to-r from-[#123B5D] via-[#1769AA] to-[#38BDF8] h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Hospital Branding & Logo Changer Form */}
            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-[#123B5D] flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-[#1769AA]" />
                  <span>Hospital Branding, Application Name &amp; Logo Settings</span>
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Change the hospital name, logo URL, contact numbers, and bed limits at the web interface.
                </p>
              </div>

              <form onSubmit={handleSaveBranding} className="space-y-4 text-xs">
                <div className="p-4 bg-[#F8FAFC] rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {brandLogo ? (
                    <img
                      src={brandLogo}
                      alt="Logo Preview"
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-[#1769AA]/30 shadow-xs shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#123B5D] to-[#1769AA] flex items-center justify-center text-white shadow-xs shrink-0">
                      <HeartPulse className="w-8 h-8 text-[#38BDF8]" />
                    </div>
                  )}

                  <div className="flex-1 w-full space-y-2">
                    <label className="block font-bold text-xs text-[#123B5D]">Hospital Logo (URL or Device Upload)</label>
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <input
                        type="text"
                        value={brandLogo}
                        onChange={(e) => setBrandLogo(e.target.value)}
                        placeholder="Paste image URL (https://...) or upload file below..."
                        className="flex-1 w-full p-2.5 bg-white border border-[#E2E8F0] rounded-xl text-xs focus:border-[#1769AA] focus:outline-none"
                      />

                      <label
                        htmlFor="admin-brand-logo-file"
                        className="w-full sm:w-auto px-3.5 py-2.5 bg-[#1769AA]/10 hover:bg-[#1769AA]/20 text-[#1769AA] rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 cursor-pointer transition-colors shrink-0"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                        <input
                          id="admin-brand-logo-file"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoFileUpload}
                        />
                      </label>
                    </div>
                    {brandLogo && (
                      <p className="text-[10px] text-emerald-600 font-semibold">✓ Custom logo active. Click 'Save Branding Globally' to persist across all screens.</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#1E293B] mb-1">Hospital / App Name *</label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      className="w-full p-2.5 bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#123B5D] focus:border-[#1769AA] focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#1E293B] mb-1">Tagline</label>
                    <input
                      type="text"
                      value={brandTagline}
                      onChange={(e) => setBrandTagline(e.target.value)}
                      className="w-full p-2.5 bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl text-xs focus:border-[#1769AA] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-[#1E293B] mb-1">Phone</label>
                    <input
                      type="text"
                      value={brandPhone}
                      onChange={(e) => setBrandPhone(e.target.value)}
                      className="w-full p-2.5 bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl text-xs focus:border-[#1769AA] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#1E293B] mb-1">Emergency 24/7 Hotline</label>
                    <input
                      type="text"
                      value={brandEmergency}
                      onChange={(e) => setBrandEmergency(e.target.value)}
                      className="w-full p-2.5 bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#C0392B] focus:border-[#1769AA] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSavingBranding}
                    className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-xs cursor-pointer transition-all flex items-center space-x-2 ${
                      isSavingBranding
                        ? 'bg-emerald-600 text-white animate-pulse'
                        : 'bg-[#1769AA] hover:bg-[#123B5D] text-white'
                    }`}
                  >
                    {isSavingBranding ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>Saving Branding Globally...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-white" />
                        <span>Save Branding Globally</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-VIEW 2: TECHNICIANS MANAGEMENT WITH REAL-TIME SEARCH & FILTER */}
        {/* ========================================================================= */}
        {activeSubTab === 'technicians' && (
          <div className="space-y-4">
            {/* Header & Add Button */}
            <div className="apple-card p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-[#123B5D]">Technician &amp; System Staff Registry</h3>
                <p className="text-xs text-[#64748B] mt-0.5">Manage technical officers responsible for doctor rosters and hospital operations.</p>
              </div>

              <button
                onClick={() => handleOpenAddModal('technician')}
                className="apple-btn-primary px-4 py-2.5 text-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Technician</span>
              </button>
            </div>

            {/* Real-time Search & Filter Bar */}
            <div className="apple-card p-4 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search technician by name, ID, mobile, email..."
                  value={techSearchTerm}
                  onChange={(e) => setTechSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl text-xs focus:border-[#1769AA] focus:outline-none"
                />
                {techSearchTerm && (
                  <button onClick={() => setTechSearchTerm('')} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2 w-full md:w-auto">
                <div className="flex items-center space-x-1.5">
                  <Filter className="w-3.5 h-3.5 text-[#64748B]" />
                  <span className="text-xs font-semibold text-[#64748B]">Department:</span>
                </div>
                <select
                  value={techDeptFilter}
                  onChange={(e) => setTechDeptFilter(e.target.value)}
                  className="px-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#1E293B] focus:border-[#1769AA] focus:outline-none"
                >
                  <option value="all">All Departments</option>
                  {departmentsList.map(d => <option key={d} value={d}>{d}</option>)}
                  <option value="Hospital Administration">Hospital Administration</option>
                </select>
              </div>
            </div>

            {/* Technicians Cards Grid */}
            {filteredTechnicians.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTechnicians.map((tech) => (
                  <div key={tech.id} className="apple-card p-5 sm:p-6 space-y-3.5 hover:shadow-xl">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={tech.profilePhoto || PRESET_AVATARS[1].url}
                          alt={tech.fullName || tech.name}
                          className="w-12 h-12 rounded-xl object-cover border"
                        />
                        <div>
                          <h4 className="font-bold text-sm text-[#123B5D]">{tech.fullName || tech.name}</h4>
                          <p className="text-xs text-purple-700 font-semibold">{tech.roleTitle || 'Senior Systems Technician'}</p>
                          <p className="text-[10px] text-[#64748B] font-mono">ID: {tech.staffId}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenEditModal(tech)}
                          className="p-1.5 hover:bg-slate-100 text-[#1769AA] rounded-lg cursor-pointer"
                          title="Edit Technician"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(tech.id, tech.fullName || tech.name || '')}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg cursor-pointer"
                          title="Delete Technician"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-[#F8FAFC] p-2.5 rounded-xl text-xs">
                      <div>
                        <span className="text-[10px] text-[#64748B]">Mobile Contact</span>
                        <p className="font-semibold text-[#1E293B]">{tech.mobile}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#64748B]">Department</span>
                        <p className="font-semibold text-[#1E293B] truncate">{tech.department || 'Hospital Administration'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#64748B]">Qualification</span>
                        <p className="font-semibold text-[#1E293B] truncate">{tech.qualification || 'B.Tech / BCA'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#64748B]">Experience</span>
                        <p className="font-semibold text-[#1E293B]">{tech.experience || '5+ Years'}</p>
                      </div>
                    </div>

                    {/* Action & Upload Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                      <span className="text-[#64748B]">Mobile: <strong className="text-[#1E293B]">{tech.mobile}</strong></span>
                      <div className="flex items-center space-x-2">
                        <label
                          htmlFor={`admin-upload-tech-btn-${tech.id}`}
                          className="flex items-center space-x-1 px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-[11px] font-bold cursor-pointer transition-colors border border-purple-100"
                          title="Upload / Change Photo from Device"
                        >
                          <Upload className="w-3.5 h-3.5 text-purple-700" />
                          <span>Upload Image</span>
                          <input
                            id={`admin-upload-tech-btn-${tech.id}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleDirectCardImageUpload(tech.id, e)}
                          />
                        </label>

                        <button
                          onClick={() => handleOpenEditModal(tech)}
                          className="p-1 text-[#1769AA] hover:bg-slate-100 rounded cursor-pointer"
                          title="Edit Technician"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(tech.id, tech.fullName || tech.name || '')}
                          className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                          title="Delete Technician"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 bg-white rounded-2xl border border-[#E2E8F0] text-center space-y-2">
                <Search className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-[#123B5D]">No technicians found matching criteria</p>
                <p className="text-[11px] text-[#64748B]">Try searching with a different name, staff ID, or mobile number.</p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-VIEW 3: RECEPTIONISTS MANAGEMENT WITH REAL-TIME SEARCH & FILTER */}
        {/* ========================================================================= */}
        {activeSubTab === 'receptionists' && (
          <div className="space-y-4">
            {/* Header & Add Button */}
            <div className="apple-card p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-[#123B5D]">Receptionist Staff &amp; Shift Management</h3>
                <p className="text-xs text-[#64748B] mt-0.5">View shift timings, daily work hours, and activate or deactivate receptionists.</p>
              </div>

              <button
                onClick={() => handleOpenAddModal('receptionist')}
                className="apple-btn-primary px-4 py-2.5 text-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Receptionist</span>
              </button>
            </div>

            {/* Real-time Search & Filter Bar */}
            <div className="apple-card p-4 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search receptionist by name, ID, mobile..."
                  value={recSearchTerm}
                  onChange={(e) => setRecSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl text-xs focus:border-[#1769AA] focus:outline-none"
                />
                {recSearchTerm && (
                  <button onClick={() => setRecSearchTerm('')} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2 w-full md:w-auto">
                <div className="flex items-center space-x-1.5">
                  <Filter className="w-3.5 h-3.5 text-[#64748B]" />
                  <span className="text-xs font-semibold text-[#64748B]">Status:</span>
                </div>
                <select
                  value={recStatusFilter}
                  onChange={(e) => setRecStatusFilter(e.target.value as any)}
                  className="px-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#1E293B] focus:border-[#1769AA] focus:outline-none"
                >
                  <option value="all">All Receptionists</option>
                  <option value="active">Active Only</option>
                  <option value="deactivated">Deactivated Only</option>
                </select>
              </div>
            </div>

            {/* Receptionists Cards Grid */}
            {filteredReceptionists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredReceptionists.map((rec) => {
                  const isActive = rec.isActive !== false;
                  return (
                    <div key={rec.id} className={`apple-card p-5 sm:p-6 space-y-3.5 transition-all ${
                      isActive ? 'hover:shadow-xl' : 'border-red-200/80 bg-red-50/20 opacity-80'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <img
                            src={rec.profilePhoto || PRESET_AVATARS[5].url}
                            alt={rec.fullName || rec.name}
                            className="w-12 h-12 rounded-xl object-cover border"
                          />
                          <div>
                            <h4 className="font-bold text-sm text-[#123B5D]">{rec.fullName || rec.name}</h4>
                            <p className="text-xs text-teal-600 font-semibold">{rec.roleTitle || 'Front Desk Officer'}</p>
                            <p className="text-[10px] text-[#64748B] font-mono">ID: {rec.staffId}</p>
                          </div>
                        </div>

                        {/* Status Toggle Switch */}
                        <button
                          onClick={() => toggleStaffActiveStatus(rec.id)}
                          className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                            isActive ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {isActive ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-red-600" />}
                          <span>{isActive ? 'Active' : 'Deactivated'}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-[#F8FAFC] p-2.5 rounded-xl text-xs">
                        <div>
                          <span className="text-[10px] text-[#64748B]">Shift Timing</span>
                          <p className="font-semibold text-[#1E293B]">{rec.shiftTiming || '08:00 AM - 04:00 PM'}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#64748B]">Daily Work Hours</span>
                          <p className="font-semibold text-[#1E293B]">{rec.workingHours || '8 Hours / Day'}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#64748B]">Qualification</span>
                          <p className="font-semibold text-[#1E293B] truncate">{rec.qualification || 'B.A. Public Relations'}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#64748B]">Experience</span>
                          <p className="font-semibold text-[#1E293B]">{rec.experience || '3+ Years'}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="text-[#64748B]">Mobile: <strong className="text-[#1E293B]">{rec.mobile}</strong></span>
                        <div className="flex items-center space-x-2">
                          <label
                            htmlFor={`admin-upload-rec-btn-${rec.id}`}
                            className="flex items-center space-x-1 px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl text-[11px] font-bold cursor-pointer transition-colors border border-teal-100"
                            title="Upload / Change Photo from Device"
                          >
                            <Upload className="w-3.5 h-3.5 text-teal-700" />
                            <span>Upload Image</span>
                            <input
                              id={`admin-upload-rec-btn-${rec.id}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleDirectCardImageUpload(rec.id, e)}
                            />
                          </label>

                          <button
                            onClick={() => handleOpenEditModal(rec)}
                            className="p-1 text-teal-600 hover:bg-slate-100 rounded cursor-pointer"
                            title="Edit Receptionist"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStaff(rec.id, rec.fullName || rec.name || '')}
                            className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
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
            ) : (
              <div className="p-8 bg-white rounded-2xl border border-[#E2E8F0] text-center space-y-2">
                <Search className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-[#123B5D]">No receptionists found matching search</p>
                <p className="text-[11px] text-[#64748B]">Try searching with a different name, staff ID, or mobile number.</p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-VIEW 4: DOCTORS MANAGEMENT WITH REAL-TIME SEARCH & FILTER */}
        {/* ========================================================================= */}
        {activeSubTab === 'doctors' && (
          <div className="space-y-4">
            {/* Header & Add Button */}
            <div className="apple-card p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-[#123B5D]">Doctor Roster &amp; Clinical Management</h3>
                <p className="text-xs text-[#64748B] mt-0.5">View shift timings, weekly available days, fees, and activate or deactivate doctors.</p>
              </div>

              <button
                onClick={() => handleOpenAddModal('doctor')}
                className="apple-btn-primary px-4 py-2.5 text-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Doctor</span>
              </button>
            </div>

            {/* Real-time Search & Filter Bar */}
            <div className="apple-card p-4 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search doctor by name, ID, mobile, specialty..."
                  value={docSearchTerm}
                  onChange={(e) => setDocSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl text-xs focus:border-[#1769AA] focus:outline-none"
                />
                {docSearchTerm && (
                  <button onClick={() => setDocSearchTerm('')} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={docDeptFilter}
                  onChange={(e) => setDocDeptFilter(e.target.value)}
                  className="px-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#1E293B] focus:border-[#1769AA] focus:outline-none"
                >
                  <option value="all">All Departments</option>
                  {departmentsList.map(d => <option key={d} value={d}>{d}</option>)}
                </select>

                <select
                  value={docStatusFilter}
                  onChange={(e) => setDocStatusFilter(e.target.value as any)}
                  className="px-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#1E293B] focus:border-[#1769AA] focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="deactivated">Deactivated Only</option>
                </select>
              </div>
            </div>

            {/* Doctors Cards Grid */}
            {filteredDoctors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDoctors.map((doc) => {
                  const isActive = doc.isActive !== false;
                  const daysList = Array.isArray(doc.availableDays) 
                    ? doc.availableDays 
                    : typeof doc.availableDays === 'string'
                      ? doc.availableDays.split(',').map(d => d.trim())
                      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

                  return (
                    <div key={doc.id} className={`apple-card p-5 sm:p-6 space-y-3.5 transition-all ${
                      isActive ? 'hover:shadow-xl' : 'border-red-200/80 bg-red-50/20 opacity-80'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="relative group/avatar shrink-0">
                            <img
                              src={doc.profilePhoto || PRESET_AVATARS[2].url}
                              alt={doc.fullName || doc.name}
                              className="w-14 h-14 rounded-2xl object-cover border"
                            />
                            <label
                              htmlFor={`admin-upload-doc-img-${doc.id}`}
                              className="absolute inset-0 bg-black/50 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover/avatar:opacity-100 transition-all cursor-pointer shadow-xs backdrop-blur-2xs"
                              title="Click to Upload Doctor Photo"
                            >
                              <Camera className="w-4 h-4 text-white" />
                              <span className="text-[8px] font-bold mt-0.5">Upload</span>
                            </label>
                            <input
                              id={`admin-upload-doc-img-${doc.id}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleDirectCardImageUpload(doc.id, e)}
                            />
                          </div>

                          <div>
                            <h4 className="font-bold text-sm text-[#123B5D]">{doc.fullName || doc.name}</h4>
                            <p className="text-xs text-[#1769AA] font-semibold">{doc.specialization || doc.roleTitle}</p>
                            <p className="text-[10px] text-[#64748B]">{doc.department} • {doc.staffId}</p>
                          </div>
                        </div>

                        {/* Status Toggle Switch */}
                        <button
                          onClick={() => toggleStaffActiveStatus(doc.id)}
                          className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer ${
                            isActive ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          {isActive ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-red-600" />}
                          <span>{isActive ? 'Active' : 'Deactivated'}</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-[#F8FAFC] p-2.5 rounded-xl text-xs">
                        <div>
                          <span className="text-[10px] text-[#64748B]">Qualification</span>
                          <p className="font-semibold text-[#1E293B] text-[11px] truncate">{doc.qualification || 'MBBS, MD'}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#64748B]">Experience</span>
                          <p className="font-semibold text-[#1E293B] text-[11px]">{doc.experience || '10+ Years'}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#64748B]">Shift Timing</span>
                          <p className="font-semibold text-[#1E293B] text-[11px]">{doc.shiftTiming || '09:00 AM - 04:30 PM'}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#64748B]">Consultation Fee</span>
                          <p className="font-bold text-[#123B5D] text-[11px]">₹{doc.consultationFee || 700}</p>
                        </div>
                      </div>

                      {/* Available Days */}
                      <div>
                        <span className="text-[10px] text-[#64748B] font-semibold block mb-1">Available Days in Week:</span>
                        <div className="flex flex-wrap gap-1">
                          {weekDays.map((d) => (
                            <span
                              key={d}
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                daysList.includes(d) ? 'bg-[#1769AA] text-white' : 'bg-slate-100 text-slate-400'
                              }`}
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="text-[#64748B]">Mobile: <strong className="text-[#1E293B]">{doc.mobile}</strong></span>
                        <div className="flex items-center space-x-2">
                          <label
                            htmlFor={`admin-upload-doc-btn-${doc.id}`}
                            className="flex items-center space-x-1 px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#1769AA] rounded-xl text-[11px] font-bold cursor-pointer transition-colors border border-sky-100"
                            title="Upload / Change Photo"
                          >
                            <Upload className="w-3.5 h-3.5 text-[#1769AA]" />
                            <span>Upload Image</span>
                            <input
                              id={`admin-upload-doc-btn-${doc.id}`}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleDirectCardImageUpload(doc.id, e)}
                            />
                          </label>

                          <button
                            onClick={() => handleOpenEditModal(doc)}
                            className="p-1 text-[#1769AA] hover:bg-slate-100 rounded cursor-pointer"
                            title="Edit Doctor"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteStaff(doc.id, doc.fullName || doc.name || '')}
                            className="p-1 text-red-600 hover:bg-red-50 rounded cursor-pointer"
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
            ) : (
              <div className="p-8 bg-white rounded-2xl border border-[#E2E8F0] text-center space-y-2">
                <Search className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-[#123B5D]">No doctors found matching search criteria</p>
                <p className="text-[11px] text-[#64748B]">Try searching with a different name, specialization, or department filter.</p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-VIEW 5: PATIENTS DIRECTORY WITH REAL-TIME SEARCH & FILTER */}
        {/* ========================================================================= */}
        {activeSubTab === 'patients' && (
          <div className="space-y-4">
            {/* Header & Add Button */}
            <div className="apple-card p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-[#123B5D]">Patient Health Directory ({dynamicPatientsList.length})</h3>
                <p className="text-xs text-[#64748B] mt-0.5">View patient records, contact information, clinical history, and treatment statuses.</p>
              </div>

              <button
                onClick={() => handleOpenAddModal('patient')}
                className="apple-btn-primary px-4 py-2.5 text-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Register Patient</span>
              </button>
            </div>

            {/* Real-time Search & Filter Bar */}
            <div className="apple-card p-4 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search patient by name, ID, mobile, email..."
                  value={patientSearchTerm}
                  onChange={(e) => setPatientSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl text-xs focus:border-[#1769AA] focus:outline-none"
                />
                {patientSearchTerm && (
                  <button onClick={() => setPatientSearchTerm('')} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={patientDeptFilter}
                  onChange={(e) => setPatientDeptFilter(e.target.value)}
                  className="px-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#1E293B] focus:border-[#1769AA] focus:outline-none"
                >
                  <option value="all">All Departments</option>
                  {departmentsList.map(d => <option key={d} value={d}>{d}</option>)}
                </select>

                <select
                  value={patientStatusFilter}
                  onChange={(e) => setPatientStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#1E293B] focus:border-[#1769AA] focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="Completed">Completed</option>
                  <option value="Active">Active</option>
                  <option value="Under Observation">Under Observation</option>
                </select>
              </div>
            </div>

            {/* Patients Table */}
            <div className="apple-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-bold">
                    <tr>
                      <th className="py-3 px-4">Patient Name &amp; ID</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Demographics</th>
                      <th className="py-3 px-4">Treatment Department</th>
                      <th className="py-3 px-4">Visits / Appointments</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((p) => (
                        <tr 
                          key={p.id} 
                          onClick={() => setSelectedPatientModal(p)}
                          className="hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <td className="py-3 px-4">
                            <p className="font-bold text-[#123B5D]">{p.fullName}</p>
                            <p className="text-[10px] text-[#64748B] font-mono">{p.patientId || p.id}</p>
                          </td>
                          <td className="py-3 px-4">
                            <p className="text-[#1E293B] font-semibold">{p.mobile}</p>
                            <p className="text-[10px] text-[#64748B]">{p.email || 'No email'}</p>
                          </td>
                          <td className="py-3 px-4 text-[#64748B]">
                            {p.dobOrAge} • {p.gender} • {p.bloodGroup || 'O+'}
                          </td>
                          <td className="py-3 px-4 font-semibold text-[#1769AA]">
                            {p.currentTreatmentDepartment || 'General Medicine'}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full font-semibold text-[10px]">
                              {p.appointmentCount || 0} Consultations
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              p.treatmentStatus === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                              p.treatmentStatus === 'Under Observation' ? 'bg-amber-100 text-amber-800' :
                              'bg-sky-100 text-sky-800'
                            }`}>
                              {p.treatmentStatus || 'Active'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPatientModal(p);
                              }}
                              className="px-2.5 py-1 bg-sky-50 text-[#1769AA] hover:bg-sky-100 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              View History →
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-xs text-[#64748B]">
                          No patients found matching the search criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Patient Clinical & Appointments History Modal */}
        {selectedPatientModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs font-sans animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 animate-scaleIn">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#123B5D] to-[#159A9C] text-white flex items-center justify-center font-bold text-base shadow-2xs">
                    {selectedPatientModal.fullName?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#123B5D]">{selectedPatientModal.fullName}</h3>
                    <p className="text-xs text-[#64748B]">
                      UHID: <strong className="font-mono text-[#159A9C]">{selectedPatientModal.patientId || selectedPatientModal.id}</strong> • 📞 {selectedPatientModal.mobile}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPatientModal(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Demographics Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl text-xs border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 block">DOB / Age</span>
                  <strong className="text-slate-800">{selectedPatientModal.dobOrAge || '30 Years'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Gender</span>
                  <strong className="text-slate-800">{selectedPatientModal.gender || 'Male'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Blood Group</span>
                  <strong className="text-slate-800">{selectedPatientModal.bloodGroup || 'O+'}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Status</span>
                  <span className="font-bold text-emerald-700">{selectedPatientModal.treatmentStatus || 'Active'}</span>
                </div>
              </div>

              {/* Complete Appointments & Consultations List */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-[#123B5D] uppercase tracking-wider">Complete Consultation History ({selectedPatientModal.allAppointments?.length || 0})</h4>
                {selectedPatientModal.allAppointments && selectedPatientModal.allAppointments.length > 0 ? (
                  <div className="space-y-2">
                    {selectedPatientModal.allAppointments.map((apt: any) => (
                      <div key={apt.id} className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-1.5 hover:border-sky-300 transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs text-[#1769AA]">{apt.bookingRef}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            apt.status === 'completed' || apt.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
                          }`}>
                            {apt.status}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800">
                          Doctor: {apt.doctorName} ({apt.department})
                        </p>
                        <p className="text-[11px] text-slate-600">
                          Date: {apt.date} • Time: {apt.timeSlot} • Mode: {apt.visitMode || 'Clinic'}
                        </p>
                        {apt.symptoms && (
                          <p className="text-[11px] text-slate-500 italic bg-slate-50 p-1.5 rounded">
                            Symptoms: {apt.symptoms}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic p-4 text-center bg-slate-50 rounded-xl">No previous consultation logs recorded for this patient.</p>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedPatientModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* ADD / EDIT STAFF MODAL */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs font-sans animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-6 space-y-4 animate-scaleIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="font-bold text-base text-[#123B5D]">
                {editingStaffMember ? `Edit ${modalRoleType}` : `Add New ${modalRoleType}`}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#64748B] hover:text-[#1E293B] p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaffForm} className="space-y-4 text-xs">
               {/* Profile Photo with Device Upload ONLY */}
              {modalRoleType !== 'patient' && (
                <div className="space-y-2">
                  <label className="block font-bold text-xs text-[#123B5D]">Profile Picture</label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3.5 p-3.5 bg-[#F8FAFC] rounded-2xl border border-slate-200">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#1769AA]/30 shadow-xs shrink-0 bg-white flex items-center justify-center">
                      {formPhoto ? (
                        <img src={formPhoto} alt="Preview" className="w-full h-full object-cover" />
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
                      {formPhoto && (
                        <button
                          type="button"
                          onClick={() => setFormPhoto('')}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#1E293B] mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                    className="w-full p-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1E293B] mb-1">System / Staff ID *</label>
                  <input
                    type="text"
                    value={formStaffId}
                    onChange={(e) => setFormStaffId(e.target.value)}
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
                    value={formMobile}
                    onChange={(e) => setFormMobile(e.target.value)}
                    className="w-full p-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#1E293B] mb-1">Email</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full p-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg"
                  />
                </div>
              </div>

              {modalRoleType !== 'patient' && (
                <>
                  {modalRoleType === 'doctor' ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-[#1E293B] mb-1">Department</label>
                        <select
                          value={formDept}
                          onChange={(e) => setFormDept(e.target.value)}
                          className="w-full p-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg"
                        >
                          {departmentsList.map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block font-semibold text-[#1E293B] mb-1">Specialization / Title</label>
                        <input
                          type="text"
                          value={formSpecialization}
                          onChange={(e) => setFormSpecialization(e.target.value)}
                          placeholder="e.g. Senior Cardiologist"
                          className="w-full p-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block font-semibold text-[#1E293B] mb-1">Specialization / Title</label>
                      <input
                        type="text"
                        value={formSpecialization}
                        onChange={(e) => setFormSpecialization(e.target.value)}
                        placeholder="e.g. Systems Technician"
                        className="w-full p-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[#1E293B] mb-1">Qualification</label>
                      <input
                        type="text"
                        value={formQualification}
                        onChange={(e) => setFormQualification(e.target.value)}
                        className="w-full p-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#1E293B] mb-1">Experience</label>
                      <input
                        type="text"
                        value={formExperience}
                        onChange={(e) => setFormExperience(e.target.value)}
                        className="w-full p-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[#1E293B] mb-1">Shift Timing</label>
                      <input
                        type="text"
                        value={formShiftTiming}
                        onChange={(e) => setFormShiftTiming(e.target.value)}
                        className="w-full p-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-[#1E293B] mb-1">
                        {modalRoleType === 'doctor' ? 'Consultation Fee (₹)' : 'Daily Work Hours'}
                      </label>
                      {modalRoleType === 'doctor' ? (
                        <input
                          type="number"
                          value={formConsultationFee}
                          onChange={(e) => setFormConsultationFee(Number(e.target.value))}
                          className="w-full p-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg"
                        />
                      ) : (
                        <input
                          type="text"
                          value={formWorkingHours}
                          onChange={(e) => setFormWorkingHours(e.target.value)}
                          className="w-full p-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg"
                        />
                      )}
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
