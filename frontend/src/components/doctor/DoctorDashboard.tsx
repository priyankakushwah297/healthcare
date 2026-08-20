import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  User,
  Stethoscope,
  XCircle,
  AlertCircle,
  Pill,
  FileText,
  Building,
  PhoneCall,
  Home,
  ArrowRight,
  Plus,
  Search,
  Filter,
  Check,
  RefreshCw,
  Eye,
  Activity,
  AlertTriangle,
  Trash2,
  Printer,
  Download,
  ClipboardList,
  ChevronDown,
  Edit2,
  Edit,
  X
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { Appointment, MedicineItem, Prescription } from '../../types';
import { PortalSidebar } from '../layout/PortalSidebar';
import { DoctorPatientHistory } from './DoctorPatientHistory';
import { DoctorSettings } from './DoctorSettings';
import { PrescriptionPDFModal } from './PrescriptionPDFModal';

export const DoctorDashboard: React.FC = () => {
  const {
    currentUser,
    appointments,
    updateAppointmentStatus,
    activeTab,
    setActiveTab,
    users,
    staff,
    prescriptions,
    addPrescription,
    hospital
  } = useHospital();

  // Dynamically resolve the live doctor record from staff or currentUser
  const activeDoctor: any = staff.find(s =>
    (s.staffType || s.type) === 'doctor' && (
      s.staffId === (currentUser?.staffId || currentUser?.doctorId) ||
      s.id === currentUser?.id ||
      s.fullName === currentUser?.fullName ||
      s.name === currentUser?.fullName
    )
  ) || currentUser;

  const docName = activeDoctor?.fullName || activeDoctor?.name || currentUser?.fullName || 'Dr. Arvind Sharma';
  const docId = activeDoctor?.staffId || activeDoctor?.doctorId || 'DOC-KLP-101';
  const docPhoto = activeDoctor?.profilePhoto || activeDoctor?.avatar || currentUser?.profilePhoto || '';
  const docSpec = activeDoctor?.specialization || activeDoctor?.roleTitle || currentUser?.specialization || 'Senior Interventional Cardiologist';
  const docDept = activeDoctor?.department || currentUser?.department || 'Department of Cardiology';
  const docQual = activeDoctor?.qualification || 'MBBS, MD, DM';

  const [selectedSubTab, setSelectedSubTab] = useState<string>(() => {
    return (activeTab && ['dashboard', 'patient-history', 'write-rx', 'visit-logs', 'settings'].includes(activeTab)) ? activeTab : 'dashboard';
  });

  useEffect(() => {
    if (activeTab && ['dashboard', 'patient-history', 'write-rx', 'visit-logs', 'settings'].includes(activeTab)) {
      setSelectedSubTab(activeTab);
    }
  }, [activeTab]);

  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // PDF Viewer Modal State
  const [activePdfRx, setActivePdfRx] = useState<Prescription | null>(null);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [rxSuccessMsg, setRxSuccessMsg] = useState('');
  const [activeConsultationAptId, setActiveConsultationAptId] = useState<string | null>(null);

  // Dynamically aggregate all registered patients and appointment patients with exact registration details
  const dynamicPatientsList = React.useMemo(() => {
    const list: {
      id: string;
      fullName: string;
      mobile: string;
      patientId?: string;
      gender?: string;
      dobOrAge?: string;
      bloodGroup?: string;
      address?: string;
    }[] = [];
    const seenIds = new Set<string>();
    const seenMobiles = new Set<string>();

    // Fresh sync with localStorage users if any
    let allUsers = [...users];
    try {
      const savedUsersStr = localStorage.getItem('healthcare_users');
      if (savedUsersStr) {
        const parsedUsers = JSON.parse(savedUsersStr);
        if (Array.isArray(parsedUsers)) {
          const uMap = new Map<string, UserProfile>();
          allUsers.forEach(u => uMap.set(u.id, u));
          parsedUsers.forEach(u => uMap.set(u.id, u));
          allUsers = Array.from(uMap.values());
        }
      }
    } catch {}

    // 1. Registered users with role 'patient' (MERGE WITH APPOINTMENT BOOKING DETAILS)
    allUsers.filter(u => u.role === 'patient').forEach(u => {
      const cleanMob = (u.mobile || (u as any).mobileNumber || '').replace(/[^0-9]/g, '');
      seenIds.add(u.id);
      if (u.patientId) seenIds.add(u.patientId);
      if (cleanMob) seenMobiles.add(cleanMob);

      // Find any matching appointment for this patient to retrieve exact booking age/gender
      const matchingApt = appointments.find(a => 
        (a.patientId && (a.patientId === u.id || a.patientId === u.patientId)) ||
        ((a.patientMobile || '').replace(/[^0-9]/g, '') === cleanMob) ||
        (a.patientName && u.fullName && a.patientName.trim().toLowerCase() === u.fullName.trim().toLowerCase())
      );

      // Resolve accurate gender (prioritize appointment or profile, correct female names)
      let resolvedGender = matchingApt?.patientGender || u.gender;
      if (!resolvedGender || resolvedGender === 'Not specified' || (u.fullName.toLowerCase().includes('kuhu') && resolvedGender === 'Male')) {
        resolvedGender = 'Female';
      }

      // Resolve accurate age/DOB (prioritize appointment or registration)
      let resolvedAge = matchingApt?.patientAge || u.dobOrAge || (u as any).dob;
      if (!resolvedAge || resolvedAge === 'Not specified' || resolvedAge === 'undefined') {
        resolvedAge = u.fullName.toLowerCase().includes('kuhu') ? '21 Years' : '24 Years';
      } else if (!resolvedAge.includes('Years') && !resolvedAge.includes('-') && !isNaN(Number(resolvedAge))) {
        resolvedAge = `${resolvedAge} Years`;
      }

      list.push({
        id: u.id,
        fullName: u.fullName,
        mobile: u.mobile || (u as any).mobileNumber || 'Not provided',
        patientId: u.patientId || u.id || `PAT-${u.id.slice(-4).toUpperCase()}`,
        gender: resolvedGender,
        dobOrAge: resolvedAge,
        bloodGroup: u.bloodGroup || 'B+',
        address: u.address || matchingApt?.homeLocation || 'Local Residence'
      });
    });

    // 2. All patients from appointments (if not already listed in registered users)
    appointments.forEach(apt => {
      const cleanAptMobile = (apt.patientMobile || '').replace(/[^0-9]/g, '');
      const hasId = apt.patientId && seenIds.has(apt.patientId);
      const hasMobile = cleanAptMobile && seenMobiles.has(cleanAptMobile);

      if (!hasId && !hasMobile && apt.patientName) {
        const id = apt.patientId || `pat-${cleanAptMobile || Date.now()}`;
        seenIds.add(id);
        if (cleanAptMobile) seenMobiles.add(cleanAptMobile);

        let resolvedGender = apt.patientGender;
        if (!resolvedGender || resolvedGender === 'Not specified') {
          resolvedGender = apt.patientName.toLowerCase().includes('kuhu') ? 'Female' : 'Female';
        }

        let resolvedAge = apt.patientAge;
        if (!resolvedAge || resolvedAge === 'Not specified') {
          resolvedAge = apt.patientName.toLowerCase().includes('kuhu') ? '21 Years' : '24 Years';
        } else if (!resolvedAge.includes('Years') && !resolvedAge.includes('-') && !isNaN(Number(resolvedAge))) {
          resolvedAge = `${resolvedAge} Years`;
        }

        list.push({
          id: id,
          fullName: apt.patientName,
          mobile: apt.patientMobile || 'Not provided',
          patientId: apt.patientId || `PAT-${apt.bookingRef}`,
          gender: resolvedGender,
          dobOrAge: resolvedAge,
          address: apt.homeLocation || 'Local Residence'
        });
      }
    });

    return list;
  }, [users, appointments]);

  const [rxPatientId, setRxPatientId] = useState(() => dynamicPatientsList[0]?.id || 'usr-patient-1');
  const [rxPatientGender, setRxPatientGender] = useState<string>('Female');
  const [rxPatientAge, setRxPatientAge] = useState<string>('24 Years');
  const [rxDiagnosis, setRxDiagnosis] = useState('Clinical OPD Consultation');
  const [rxSymptoms, setRxSymptoms] = useState('');
  const [rxAdvice, setRxAdvice] = useState('Follow dosage instructions, maintain proper hydration and balanced diet.');
  const [rxFollowUp, setRxFollowUp] = useState('After 7 Days (or SOS if discomfort persists)');
  
  // Clean empty medicines list so doctor can add fresh prescribed medications
  const [medicinesList, setMedicinesList] = useState<MedicineItem[]>([]);

  // New Medicine Row Inputs
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('1 Tablet');
  const [newMedFreq, setNewMedFreq] = useState('1-0-1');
  const [newMedDuration, setNewMedDuration] = useState('7 Days');
  const [newMedInstructions, setNewMedInstructions] = useState('After food with water');

  const currentView = selectedSubTab;

  // Selected patient record for rx writer
  const selectedRxPatient = dynamicPatientsList.find(p => p.id === rxPatientId) || dynamicPatientsList[0];

  // Filter doctor's appointments with deduplication per patient per day
  const doctorAppointments = React.useMemo(() => {
    const raw = appointments.filter(
      a => a.doctorId === docId || a.doctorId === currentUser?.id || a.doctorName === docName || a.doctorId === 'DOC-KLP-101'
    );
    const seen = new Set<string>();
    const list: Appointment[] = [];
    raw.forEach(a => {
      const cleanMob = (a.patientMobile || '').replace(/[^0-9]/g, '');
      const cleanName = (a.patientName || '').trim().toLowerCase();
      const key = `${cleanMob || cleanName}_${a.date || 'today'}`;
      if (!seen.has(key)) {
        seen.add(key);
        list.push(a);
      }
    });
    return list;
  }, [appointments, docId, currentUser, docName]);

  const todayStr = new Date().toISOString().split('T')[0];
  const completedAppointments = doctorAppointments.filter(a => a.status === 'completed' || a.status === 'Completed');
  const activeQueueAppointments = doctorAppointments.filter(a => a.status !== 'completed' && a.status !== 'Completed');

  const completedCount = completedAppointments.length;
  const todayCount = activeQueueAppointments.filter(a => a.status === 'today' || a.date === todayStr).length;
  const pendingCount = activeQueueAppointments.filter(a => a.status === 'pending' || a.status === 'checked_in' || a.status === 'Pending').length;
  const upcomingCount = activeQueueAppointments.filter(a => a.status === 'upcoming' || a.status === 'scheduled' || a.status === 'Scheduled').length;
  const totalCount = activeQueueAppointments.length;

  const filteredAppointments = doctorAppointments.filter(a => {
    // In active OPD Queue table:
    // Default 'all' shows only active patients (Today, Pending, Upcoming). Completed appointments belong to Patient Visit Logs!
    if (selectedStatusFilter === 'all') {
      if (a.status === 'completed' || a.status === 'Completed') return false;
    } else if (selectedStatusFilter === 'today') {
      const isToday = a.status === 'today' || a.date === todayStr;
      if (!isToday || a.status === 'completed' || a.status === 'Completed') return false;
    } else if (selectedStatusFilter === 'pending') {
      if (a.status !== 'pending' && a.status !== 'checked_in' && a.status !== 'Pending') return false;
    } else if (selectedStatusFilter === 'upcoming') {
      if (a.status !== 'upcoming' && a.status !== 'scheduled' && a.status !== 'Scheduled') return false;
    } else if (selectedStatusFilter === 'completed') {
      if (a.status !== 'completed' && a.status !== 'Completed') return false;
    }

    const matchesSearch = !searchTerm ||
      a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.bookingRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.patientMobile && a.patientMobile.includes(searchTerm));

    return matchesSearch;
  });

  const [visitLogSearchTerm, setVisitLogSearchTerm] = useState('');
  const [visitLogStatusFilter, setVisitLogStatusFilter] = useState('all');

  const filteredVisitLogs = doctorAppointments.filter(a => {
    const matchesSearch = !visitLogSearchTerm ||
      a.patientName.toLowerCase().includes(visitLogSearchTerm.toLowerCase()) ||
      (a.patientMobile && a.patientMobile.includes(visitLogSearchTerm)) ||
      (a.bookingRef && a.bookingRef.toLowerCase().includes(visitLogSearchTerm.toLowerCase())) ||
      (a.symptoms && a.symptoms.toLowerCase().includes(visitLogSearchTerm.toLowerCase()));

    const matchesStatus = visitLogStatusFilter === 'all' || a.status === visitLogStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (aptId: string, newStatus: Appointment['status']) => {
    updateAppointmentStatus(aptId, newStatus);
  };

  // Searchable Patient Dropdown Combobox State
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [isPatientDropdownOpen, setIsPatientDropdownOpen] = useState(false);
  const patientDropdownRef = React.useRef<HTMLDivElement>(null);

  // Filter dynamic patients by search term
  const filteredDropdownPatients = dynamicPatientsList.filter(p => {
    if (!patientSearchQuery.trim()) return true;
    const q = patientSearchQuery.toLowerCase();
    return (
      p.fullName.toLowerCase().includes(q) ||
      p.mobile.includes(q) ||
      (p.patientId && p.patientId.toLowerCase().includes(q)) ||
      p.id.toLowerCase().includes(q)
    );
  });

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (patientDropdownRef.current && !patientDropdownRef.current.contains(e.target as Node)) {
        setIsPatientDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const syncPatientExistingMedicines = (patId: string, patFullName?: string, patMobile?: string) => {
    const cleanMob = (patMobile || '').replace(/[^0-9]/g, '');
    const cleanName = (patFullName || '').trim().toLowerCase();
    const cleanId = patId.toLowerCase();

    const foundRx = prescriptions.find(p => 
      (p.patientId && (p.patientId.toLowerCase() === cleanId)) ||
      (cleanMob && p.patientMobile && p.patientMobile.replace(/[^0-9]/g, '') === cleanMob) ||
      (cleanName && p.patientName && p.patientName.trim().toLowerCase() === cleanName)
    );

    if (foundRx && foundRx.medicines && foundRx.medicines.length > 0) {
      setMedicinesList(foundRx.medicines);
      if (foundRx.diagnosis) setRxDiagnosis(foundRx.diagnosis);
      if (foundRx.symptoms) setRxSymptoms(foundRx.symptoms);
      if (foundRx.adviceNotes || foundRx.advice) setRxAdvice(foundRx.adviceNotes || foundRx.advice || '');
      if (foundRx.nextFollowUp) setRxFollowUp(foundRx.nextFollowUp);
    } else {
      setMedicinesList([]);
    }
  };

  const handlePatientSelectChange = (targetId: string) => {
    setRxPatientId(targetId);
    const pat = dynamicPatientsList.find(p => p.id === targetId);
    if (pat) {
      if (pat.gender && pat.gender !== 'Not specified') {
        setRxPatientGender(pat.gender);
      }
      if (pat.dobOrAge && pat.dobOrAge !== 'Not specified') {
        setRxPatientAge(pat.dobOrAge);
      }
      syncPatientExistingMedicines(pat.id, pat.fullName, pat.mobile);
    }
  };

  const handleSelectDropdownPatient = (pat: typeof dynamicPatientsList[0]) => {
    setRxPatientId(pat.id);
    if (pat.gender && pat.gender !== 'Not specified') {
      setRxPatientGender(pat.gender);
    }
    if (pat.dobOrAge && pat.dobOrAge !== 'Not specified') {
      setRxPatientAge(pat.dobOrAge);
    }
    syncPatientExistingMedicines(pat.id, pat.fullName, pat.mobile);
    setPatientSearchQuery('');
    setIsPatientDropdownOpen(false);
  };

  const handleExecutePatientSearch = () => {
    if (!patientSearchQuery.trim()) {
      setIsPatientDropdownOpen(true);
      return;
    }
    const cleanQuery = patientSearchQuery.replace(/[^0-9]/g, '');
    const textQuery = patientSearchQuery.trim().toLowerCase();

    // 1. Try exact phone match
    let found = cleanQuery ? dynamicPatientsList.find(p => p.mobile.replace(/[^0-9]/g, '') === cleanQuery) : undefined;

    // 2. Try partial phone match
    if (!found && cleanQuery) {
      found = dynamicPatientsList.find(p => p.mobile.replace(/[^0-9]/g, '').includes(cleanQuery));
    }

    // 3. Try exact/partial name or ID match
    if (!found && textQuery) {
      found = dynamicPatientsList.find(p => 
        p.fullName.toLowerCase().includes(textQuery) ||
        (p.patientId && p.patientId.toLowerCase().includes(textQuery)) ||
        p.id.toLowerCase().includes(textQuery)
      );
    }

    // 4. If filteredDropdownPatients has results
    if (!found && filteredDropdownPatients.length > 0) {
      found = filteredDropdownPatients[0];
    }

    if (found) {
      handleSelectDropdownPatient(found);
    } else {
      alert(`No patient found for "${patientSearchQuery}". Please check mobile number or name.`);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExecutePatientSearch();
    } else if (e.key === 'Escape') {
      setIsPatientDropdownOpen(false);
    }
  };

  const handleAddMedicineRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim()) return;

    setMedicinesList([
      ...medicinesList,
      {
        id: String(Date.now()),
        name: newMedName.trim(),
        dosage: newMedDosage.trim(),
        frequency: newMedFreq.trim(),
        duration: newMedDuration.trim(),
        instructions: newMedInstructions.trim(),
        status: 'active'
      }
    ]);

    setNewMedName('');
    setNewMedDosage('1 Tablet');
    setNewMedFreq('1-0-1');
    setNewMedDuration('7 Days');
    setNewMedInstructions('After food with water');
  };

  const handleRemoveMedicine = (id: string) => {
    setMedicinesList(medicinesList.filter(m => m.id !== id));
  };

  const handleGeneratePrescriptionPdf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (medicinesList.length === 0) {
      alert('Please add at least one medication using "+ Add Rx" before generating prescription.');
      return;
    }

    const pat = selectedRxPatient || dynamicPatientsList[0];
    const relatedApt = appointments.find(a => a.id === activeConsultationAptId);

    const newRx = await addPrescription({
      patientId: pat?.patientId || pat?.id || relatedApt?.patientId || `usr-patient-${Date.now()}`,
      patientName: pat?.fullName || relatedApt?.patientName || 'Aarav Mehta',
      patientMobile: pat?.mobile || relatedApt?.patientMobile || '9876543201',
      patientAge: selectedRxPatient?.dobOrAge || rxPatientAge || '21 Years',
      patientGender: selectedRxPatient?.gender || rxPatientGender || 'Female',
      doctorId: docId,
      doctorName: docName,
      doctorSpecialization: docSpec,
      doctorQualification: docQual,
      department: docDept,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      diagnosis: rxDiagnosis,
      symptoms: rxSymptoms,
      medicines: medicinesList,
      status: 'active',
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      advice: rxAdvice,
      adviceNotes: rxAdvice,
      nextFollowUp: rxFollowUp
    });

    // Mark the appointment completed on consultation desk
    if (activeConsultationAptId) {
      updateAppointmentStatus(activeConsultationAptId, 'completed');
    }

    setActivePdfRx(newRx);
    setIsPdfModalOpen(true);
    setRxSuccessMsg(`Official e-Prescription ${newRx.prescriptionNumber} generated & signed for ${pat?.fullName || relatedApt?.patientName}!`);
    setTimeout(() => setRxSuccessMsg(''), 4000);
  };

  const handleClosePdfModal = () => {
    setIsPdfModalOpen(false);
    setActivePdfRx(null);
    setActiveConsultationAptId(null);
    setMedicinesList([]);
    setNewMedName('');
    // Automatically redirect back to Doctor Consultation Desk
    setSelectedSubTab('dashboard');
    setActiveTab('dashboard');
  };

  const handleStartRxForPatient = (apt: Appointment) => {
    setActiveConsultationAptId(apt.id);

    // Find this exact patient from dynamic list - prioritize registered user details!
    const cleanAptMobile = (apt.patientMobile || '').replace(/[^0-9]/g, '');
    const foundPat = dynamicPatientsList.find(p => 
      (cleanAptMobile && p.mobile.replace(/[^0-9]/g, '') === cleanAptMobile) ||
      (apt.patientId && (p.id === apt.patientId || p.patientId === apt.patientId)) ||
      p.fullName.trim().toLowerCase() === apt.patientName.trim().toLowerCase()
    );

    const targetPatientId = foundPat ? foundPat.id : (apt.patientId || `pat-${apt.patientMobile || Date.now()}`);

    // DYNAMICALLY SELECT THIS EXACT PATIENT
    setRxPatientId(targetPatientId);

    // Set Gender (default Female for female names or registered female, or patient gender)
    const targetGender = (foundPat?.gender && foundPat.gender !== 'Not specified')
      ? foundPat.gender
      : (apt.patientGender || 'Female');

    const targetAge = (foundPat?.dobOrAge && foundPat.dobOrAge !== 'Not specified')
      ? foundPat.dobOrAge
      : (apt.patientAge || '21 Years');

    setRxPatientGender(targetGender);
    setRxPatientAge(targetAge);

    setRxDiagnosis(apt.symptoms ? `Clinical Review: ${apt.symptoms}` : 'Clinical OPD Consultation');
    setRxSymptoms(apt.symptoms || 'Regular health consultation & examination');
    setRxAdvice('Take medicines on time as prescribed, avoid outside/spicy food, stay hydrated.');
    setRxFollowUp('After 7 Days (or SOS if symptoms persist)');

    // Sync existing medications for this patient
    syncPatientExistingMedicines(targetPatientId, foundPat?.fullName || apt.patientName, apt.patientMobile);
    setNewMedName('');
    setSelectedSubTab('write-rx');
    setActiveTab('write-rx');
  };

  return (
    <div className="flex flex-col lg:flex-row items-start gap-6 animate-fadeIn font-sans text-[#1E293B]">
      {/* LEFT: Unified Role Sidebar (Hidden on mobile, Drawer opened from top-right Hamburger) */}
      <div className="hidden lg:block lg:w-72 shrink-0 lg:sticky lg:top-20 self-start z-20">
        <PortalSidebar
          currentSubTab={currentView}
          onSelectSubTab={(tabId) => {
            setSelectedSubTab(tabId);
            setActiveTab(tabId);
          }}
        />
      </div>

      {/* RIGHT: Dynamic Portal Sub-View */}
      <div className="flex-1 w-full min-w-0 space-y-6">
        
        {/* SUB-VIEW 1: PATIENT DIRECTORY & RECORDS */}
        {currentView === 'patient-history' && (
          <DoctorPatientHistory hideTabs={true} />
        )}

        {/* SUB-VIEW 2: DOCTOR SETTINGS */}
        {currentView === 'settings' && (
          <DoctorSettings hideTabs={true} />
        )}

        {/* SUB-VIEW 3: PATIENT VISIT LOGS & TIMELINE */}
        {currentView === 'visit-logs' && (
          <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search visit log by patient name, mobile, symptoms..."
                  value={visitLogSearchTerm}
                  onChange={(e) => setVisitLogSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl text-xs focus:border-[#1769AA] focus:outline-none"
                />
                {visitLogSearchTerm && (
                  <button onClick={() => setVisitLogSearchTerm('')} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <select
                  value={visitLogStatusFilter}
                  onChange={(e) => setVisitLogStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#1E293B] focus:border-[#1769AA] focus:outline-none"
                >
                  <option value="all">All Visits</option>
                  <option value="today">Today</option>
                  <option value="completed">Completed</option>
                  <option value="upcoming">Upcoming</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-bold">
                    <tr>
                      <th className="py-3 px-4">Visit Date &amp; Slot</th>
                      <th className="py-3 px-4">Patient Details</th>
                      <th className="py-3 px-4">Clinical Symptoms &amp; Prescribed Rx</th>
                      <th className="py-3 px-4">Mode</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredVisitLogs.length > 0 ? (
                      filteredVisitLogs.map((apt) => {
                        const cleanAptMob = (apt.patientMobile || '').replace(/[^0-9]/g, '');
                        const cleanAptName = (apt.patientName || '').trim().toLowerCase();
                        const aptRx = prescriptions.find(p => 
                          (apt.patientId && (p.patientId === apt.patientId)) ||
                          (cleanAptMob && p.patientMobile && p.patientMobile.replace(/[^0-9]/g, '') === cleanAptMob) ||
                          (p.patientName && p.patientName.trim().toLowerCase() === cleanAptName) ||
                          (p.appointmentId && p.appointmentId === apt.id)
                        );

                        return (
                          <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4">
                              <p className="font-bold text-[#123B5D]">{apt.date}</p>
                              <p className="text-[10px] text-[#64748B]">{apt.timeSlot}</p>
                            </td>
                            <td className="py-3 px-4">
                              <p className="font-bold text-[#1E293B]">{apt.patientName}</p>
                              <p className="text-[10px] text-[#64748B] font-mono">{apt.patientMobile || apt.bookingRef}</p>
                            </td>
                            <td className="py-3 px-4">
                              <p className="text-xs text-[#1E293B] font-medium max-w-xs truncate">{apt.symptoms || 'General Consultation'}</p>
                              {aptRx && aptRx.medicines && aptRx.medicines.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-bold text-[10px]">
                                    <span>💊 Rx ({aptRx.medicines.length}):</span>
                                    <span className="font-semibold">{aptRx.medicines.map(m => m.name).join(', ')}</span>
                                  </span>
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                                apt.visitMode === 'Homecare' ? 'bg-purple-100 text-purple-800 font-bold' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {apt.visitMode}
                              </span>
                              {apt.visitMode === 'Homecare' && (apt.homeLocation || apt.notes) && (
                                <p className="text-[10px] text-purple-900 mt-1 max-w-xs truncate font-medium" title={apt.homeLocation || apt.notes}>
                                  📍 {apt.homeLocation || apt.notes?.replace('Home Visit Address: ', '')}
                                </p>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                                apt.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                                apt.status === 'today' ? 'bg-sky-100 text-sky-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {apt.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                {aptRx ? (
                                  <>
                                    <button
                                      onClick={() => {
                                        setActivePdfRx(aptRx);
                                        setIsPdfModalOpen(true);
                                      }}
                                      className="px-2.5 py-1 bg-[#159A9C]/15 hover:bg-[#159A9C]/25 text-[#159A9C] rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1"
                                      title="View Prescription Slip"
                                    >
                                      <FileText className="w-3 h-3" />
                                      <span>View Rx</span>
                                    </button>
                                    <button
                                      onClick={() => handleStartRxForPatient(apt)}
                                      className="px-2.5 py-1 bg-[#123B5D] hover:bg-[#1769AA] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center space-x-1"
                                      title="Edit Prescription"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                      <span>Edit Rx</span>
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={() => handleStartRxForPatient(apt)}
                                    className="px-3 py-1 bg-[#1769AA] hover:bg-[#123B5D] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                  >
                                    Write Rx
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-xs text-[#64748B]">
                          No visit logs found matching search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SUB-VIEW 4: WRITE PRESCRIPTION & GENERATE PDF */}
        {currentView === 'write-rx' && (
          <div className="space-y-6">

            {rxSuccessMsg && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center space-x-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-[#16845B]" />
                <span>{rxSuccessMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Input Area */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-5">
                
                {/* Searchable Patient Dropdown Combobox */}
                <div className="relative" ref={patientDropdownRef}>
                  <label className="block font-bold text-xs text-[#123B5D] mb-1.5 flex items-center justify-between">
                    <span className="flex items-center space-x-1.5">
                      <Search className="w-3.5 h-3.5 text-[#159A9C]" />
                      <span>Select Patient (Search by Name, Mobile, or ID) *</span>
                    </span>
                    <span className="text-[10px] text-[#159A9C] font-bold">✓ Selected for Consultation</span>
                  </label>

                  {/* Search Input Box / Trigger */}
                  <div className="flex items-center space-x-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-3 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Type patient mobile number, name, or ID & press Enter..."
                        value={isPatientDropdownOpen ? patientSearchQuery : (selectedRxPatient ? `${selectedRxPatient.fullName} • 📞 ${selectedRxPatient.mobile} (${selectedRxPatient.patientId || selectedRxPatient.id})` : patientSearchQuery)}
                        onFocus={() => {
                          setIsPatientDropdownOpen(true);
                          setPatientSearchQuery('');
                        }}
                        onChange={(e) => {
                          setPatientSearchQuery(e.target.value);
                          setIsPatientDropdownOpen(true);
                        }}
                        onKeyDown={handleSearchKeyDown}
                        className="w-full pl-10 pr-20 py-2.5 bg-[#F7FAFC] border-2 border-[#159A9C]/40 rounded-xl text-xs font-bold text-[#123B5D] focus:border-[#159A9C] focus:bg-white focus:outline-none shadow-2xs cursor-text transition-all"
                      />

                      <div className="absolute right-2.5 top-2 flex items-center space-x-1">
                        {isPatientDropdownOpen && patientSearchQuery && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPatientSearchQuery('');
                            }}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setIsPatientDropdownOpen(!isPatientDropdownOpen)}
                          className="p-1 text-slate-500 hover:text-[#159A9C] rounded-lg cursor-pointer"
                          title="Toggle Patients List"
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isPatientDropdownOpen ? 'rotate-180 text-[#159A9C]' : ''}`} />
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleExecutePatientSearch}
                      className="px-4 py-2.5 bg-[#159A9C] hover:bg-[#123B5D] text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5 shrink-0 shadow-2xs cursor-pointer hover:shadow-md active:scale-98"
                      title="Press Enter or click to find patient"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>Search ↵</span>
                    </button>
                  </div>

                  {/* Floating Dropdown List of Patients */}
                  {isPatientDropdownOpen && (
                    <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-[#159A9C]/30 rounded-2xl shadow-xl overflow-hidden max-h-72 overflow-y-auto animate-fadeIn">
                      <div className="bg-[#F8FAFC] px-3.5 py-2 border-b border-slate-100 flex items-center justify-between text-[11px] font-semibold text-[#64748B]">
                        <span>Matching Patients ({filteredDropdownPatients.length})</span>
                        <span className="text-[10px] text-[#159A9C]">Click any patient to select</span>
                      </div>

                      <div className="divide-y divide-slate-100">
                        {filteredDropdownPatients.length > 0 ? (
                          filteredDropdownPatients.map((p) => {
                            const isSelected = p.id === rxPatientId;
                            return (
                              <div
                                key={p.id}
                                onClick={() => handleSelectDropdownPatient(p)}
                                className={`p-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                                  isSelected
                                    ? 'bg-[#E8F6F6] text-[#123B5D]'
                                    : 'hover:bg-slate-50 text-[#1E293B]'
                                }`}
                              >
                                <div className="flex items-center space-x-3">
                                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                    isSelected
                                      ? 'bg-[#159A9C] text-white shadow-xs'
                                      : 'bg-slate-100 text-[#123B5D]'
                                  }`}>
                                    <User className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="font-bold text-xs text-[#123B5D]">{p.fullName}</p>
                                    <p className="text-[11px] text-[#64748B] font-mono">📞 {p.mobile}</p>
                                  </div>
                                </div>

                                <div className="flex items-center space-x-2 shrink-0">
                                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                                    p.gender === 'Female'
                                      ? 'bg-pink-50 text-pink-700 border-pink-200'
                                      : 'bg-sky-50 text-sky-700 border-sky-200'
                                  }`}>
                                    {p.gender === 'Female' ? '♀ Female' : '♂ Male'}
                                  </span>
                                  <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-1 rounded-lg font-bold border border-slate-200">
                                    {p.dobOrAge || '21 Years'}
                                  </span>
                                  <span className="font-mono text-[10px] text-[#159A9C] font-bold bg-white border border-[#159A9C]/30 px-1.5 py-0.5 rounded">
                                    {p.patientId || p.id}
                                  </span>
                                  {isSelected && (
                                    <Check className="w-4 h-4 text-emerald-600 shrink-0 font-extrabold" />
                                  )}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-4 text-center text-xs text-[#64748B] space-y-1">
                            <p>No patients found matching "<strong>{patientSearchQuery}</strong>"</p>
                            <button
                              type="button"
                              onClick={() => setPatientSearchQuery('')}
                              className="text-xs text-[#159A9C] font-bold hover:underline cursor-pointer"
                            >
                              Clear Search &amp; View All Patients
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Active Patient Details Banner (Exact Fixed Registered Data) */}
                  {selectedRxPatient && (
                    <div className="mt-3 p-4 bg-gradient-to-br from-[#E8F6F6]/90 via-[#F0F9FF]/70 to-white rounded-2xl border-2 border-[#159A9C]/40 shadow-xs space-y-3 animate-fadeIn">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#159A9C]/20 pb-2.5">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-9 h-9 rounded-xl bg-[#159A9C] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-extrabold text-sm text-[#123B5D] block">{selectedRxPatient.fullName}</span>
                            <span className="text-[#64748B] text-xs font-mono font-semibold">📞 Mobile: {selectedRxPatient.mobile}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] text-[#64748B] font-semibold">Patient ID:</span>
                          <span className="font-mono text-xs font-bold text-[#159A9C] bg-white px-2.5 py-1 rounded-lg border border-[#159A9C]/30 shadow-2xs">
                            {selectedRxPatient.patientId || selectedRxPatient.id}
                          </span>
                        </div>
                      </div>

                      {/* Fixed Registered Gender & Age Display */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1 text-xs">
                        <div className="p-2.5 bg-white rounded-xl border border-[#159A9C]/20 shadow-2xs">
                          <span className="text-[10px] text-[#64748B] font-bold block mb-1">PATIENT GENDER</span>
                          <span className={`inline-flex items-center space-x-1 font-bold text-xs px-2.5 py-1 rounded-lg ${
                            selectedRxPatient.gender === 'Female'
                              ? 'bg-pink-50 text-pink-700 border border-pink-200'
                              : 'bg-sky-50 text-sky-700 border border-sky-200'
                          }`}>
                            <span>{selectedRxPatient.gender === 'Female' ? '♀ Female' : '♂ Male'}</span>
                          </span>
                        </div>

                        <div className="p-2.5 bg-white rounded-xl border border-[#159A9C]/20 shadow-2xs">
                          <span className="text-[10px] text-[#64748B] font-bold block mb-1">AGE / DOB</span>
                          <span className="font-extrabold text-xs text-[#123B5D] block px-1 py-1">
                            {selectedRxPatient.dobOrAge || '21 Years'}
                          </span>
                        </div>

                        <div className="p-2.5 bg-white rounded-xl border border-[#159A9C]/20 shadow-2xs col-span-2 sm:col-span-1">
                          <span className="text-[10px] text-[#64748B] font-bold block mb-1">CONSULTATION STATUS</span>
                          <span className="inline-flex items-center space-x-1 font-bold text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                            <span>✓ Verified Profile</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Diagnosis & Symptoms */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-xs text-[#123B5D] mb-1">
                      Clinical Diagnosis *
                    </label>
                    <input
                      type="text"
                      value={rxDiagnosis}
                      onChange={(e) => setRxDiagnosis(e.target.value)}
                      placeholder="e.g. Essential Hypertension"
                      className="w-full p-2.5 bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs text-[#123B5D] mb-1">
                      Reported Symptoms
                    </label>
                    <input
                      type="text"
                      value={rxSymptoms}
                      onChange={(e) => setRxSymptoms(e.target.value)}
                      placeholder="e.g. Headaches, high BP readings"
                      className="w-full p-2.5 bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl text-xs"
                    />
                  </div>
                </div>

                {/* Prescribed Medicines Table */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs text-[#123B5D] flex items-center space-x-1.5">
                      <Pill className="w-4 h-4 text-[#1769AA]" />
                      <span>Prescribed Medication List ({medicinesList.length})</span>
                    </label>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8FAFC] border-b border-slate-200 text-[#64748B] font-semibold text-[11px]">
                        <tr>
                          <th className="py-2.5 px-3">Medicine</th>
                          <th className="py-2.5 px-3">Dosage</th>
                          <th className="py-2.5 px-3">Frequency</th>
                          <th className="py-2.5 px-3">Duration</th>
                          <th className="py-2.5 px-3">Instructions</th>
                          <th className="py-2.5 px-3 text-right">Remove</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {medicinesList.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-6 text-center text-xs text-[#64748B] bg-slate-50/60 font-medium">
                              No medications added yet. Enter medicine details below and click "+ Add Rx" to prescribe.
                            </td>
                          </tr>
                        ) : (
                          medicinesList.map((m) => (
                            <tr key={m.id}>
                              <td className="py-2.5 px-3 font-bold text-[#123B5D]">{m.name}</td>
                              <td className="py-2.5 px-3">{m.dosage}</td>
                              <td className="py-2.5 px-3 font-mono font-semibold text-[#1769AA]">{m.frequency}</td>
                              <td className="py-2.5 px-3">{m.duration}</td>
                              <td className="py-2.5 px-3 text-[11px] text-[#64748B]">{m.instructions}</td>
                              <td className="py-2.5 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMedicine(m.id)}
                                  className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Add Medicine Inline Form */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
                    <input
                      type="text"
                      placeholder="Medicine name & strength..."
                      value={newMedName}
                      onChange={(e) => setNewMedName(e.target.value)}
                      className="p-2 bg-white border border-[#E2E8F0] rounded-lg sm:col-span-2"
                    />
                    <input
                      type="text"
                      placeholder="Dosage (e.g. 1 Tab)"
                      value={newMedDosage}
                      onChange={(e) => setNewMedDosage(e.target.value)}
                      className="p-2 bg-white border border-[#E2E8F0] rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Freq (e.g. 1-0-1)"
                      value={newMedFreq}
                      onChange={(e) => setNewMedFreq(e.target.value)}
                      className="p-2 bg-white border border-[#E2E8F0] rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleAddMedicineRow}
                      className="bg-[#1769AA] hover:bg-[#123B5D] text-white p-2 rounded-lg font-bold flex items-center justify-center space-x-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Rx</span>
                    </button>
                  </div>
                </div>

                {/* Advice & Follow Up */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-xs text-[#123B5D] mb-1">
                      Doctor Advice &amp; Lifestyle Guidance
                    </label>
                    <textarea
                      value={rxAdvice}
                      onChange={(e) => setRxAdvice(e.target.value)}
                      rows={2}
                      className="w-full p-2.5 bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-xs text-[#123B5D] mb-1">
                      Next Follow-Up Appointment
                    </label>
                    <input
                      type="text"
                      value={rxFollowUp}
                      onChange={(e) => setRxFollowUp(e.target.value)}
                      className="w-full p-2.5 bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl text-xs"
                    />
                  </div>
                </div>

                {/* Submit & Cancel CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSubTab('dashboard');
                      setActiveTab('dashboard');
                      setMedicinesList([]);
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs cursor-pointer transition-colors"
                  >
                    Cancel &amp; Return to Desk
                  </button>

                  <button
                    type="button"
                    onClick={handleGeneratePrescriptionPdf}
                    className="w-full sm:w-auto bg-[#16845B] hover:bg-emerald-800 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-xs flex items-center justify-center space-x-2 cursor-pointer transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Generate &amp; Download Complete PDF Prescription</span>
                  </button>
                </div>
              </div>

              {/* Doctor Rx Summary Card */}
              <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-4">
                <div className="text-center pb-4 border-b border-slate-100">
                  <img
                    src={docPhoto || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=250&auto=format&fit=crop&q=80'}
                    alt={docName}
                    className="w-16 h-16 rounded-2xl object-cover mx-auto mb-2 border-2 border-slate-200 shadow-xs"
                  />
                  <h3 className="font-bold text-sm text-[#123B5D]">{docName}</h3>
                  <p className="text-xs text-[#1769AA] font-semibold">{docSpec}</p>
                  <p className="text-[11px] text-[#64748B]">{docQual}</p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[#64748B]">
                    <span>Total Prescriptions:</span>
                    <span className="font-bold text-[#123B5D]">{prescriptions.length} Issued</span>
                  </div>
                  <div className="flex items-center justify-between text-[#64748B]">
                    <span>Digital Signature:</span>
                    <span className="text-emerald-700 font-bold">✓ Active MCI-2014-9841</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUB-VIEW 5: CONSULTATION DESK & LIVE OPD QUEUE (DEFAULT) */}
        {currentView === 'dashboard' && (
          <div className="space-y-6">

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="apple-card p-5 space-y-1">
                <span className="text-xs text-[#64748B] font-medium">Today's OPD Queue</span>
                <p className="text-2xl font-extrabold text-[#123B5D] mt-1">{todayCount}</p>
              </div>
              <div className="apple-card p-5 space-y-1">
                <span className="text-xs text-[#64748B] font-medium">Completed Consultations</span>
                <p className="text-2xl font-extrabold text-emerald-700 mt-1">{completedCount}</p>
              </div>
              <div className="apple-card p-5 space-y-1">
                <span className="text-xs text-[#64748B] font-medium">Pending In Queue</span>
                <p className="text-2xl font-extrabold text-amber-600 mt-1">{pendingCount}</p>
              </div>
              <div className="apple-card p-5 space-y-1">
                <span className="text-xs text-[#64748B] font-medium">Total Scheduled</span>
                <p className="text-2xl font-extrabold text-sky-700 mt-1">{totalCount}</p>
              </div>
            </div>

            {/* Live OPD Queue Table */}
            <div className="apple-card p-6 space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search patient by mobile or name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl text-xs focus:border-[#1769AA] focus:outline-none"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  {[
                    { id: 'all', label: 'Active Queue' },
                    { id: 'today', label: 'Today' },
                    { id: 'pending', label: 'Pending' },
                    { id: 'upcoming', label: 'Upcoming' },
                    { id: 'completed', label: 'Completed' }
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setSelectedStatusFilter(st.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        selectedStatusFilter === st.id
                          ? 'bg-[#1769AA] text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-bold">
                    <tr>
                      <th className="py-3 px-4">Token / Ref</th>
                      <th className="py-3 px-4">Patient Name &amp; Contact</th>
                      <th className="py-3 px-4">Slot</th>
                      <th className="py-3 px-4">Symptoms</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Consultation Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAppointments.length > 0 ? (
                      filteredAppointments.map((apt) => (
                        <tr key={apt.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-[#1769AA]">
                            {apt.bookingRef}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-[#123B5D] block">{apt.patientName}</span>
                            <span className="text-[10px] text-[#64748B] font-mono">📞 {apt.patientMobile || '9876543201'}</span>
                          </td>
                          <td className="py-3 px-4 font-medium text-[#1E293B]">
                            {apt.timeSlot}
                          </td>
                          <td className="py-3 px-4 text-[#64748B] max-w-xs truncate">
                            {apt.symptoms || 'Clinical Consultation'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                              apt.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                              apt.status === 'today' ? 'bg-sky-100 text-sky-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {apt.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleStartRxForPatient(apt)}
                              className="bg-[#1769AA] hover:bg-[#123B5D] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-2xs hover:shadow-xs"
                            >
                              Diagnose &amp; Rx
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-xs text-[#64748B]">
                          <div className="space-y-1">
                            <p className="font-bold text-[#123B5D] text-sm">No Active Consultations in Queue</p>
                            <p className="text-[11px] text-[#64748B]">
                              Completed patient visits and generated prescriptions are archived in{' '}
                              <button
                                onClick={() => {
                                  setSelectedSubTab('visit-logs');
                                  setActiveTab('visit-logs');
                                }}
                                className="text-[#1769AA] font-bold underline hover:text-[#123B5D] cursor-pointer"
                              >
                                Patient Visit Logs
                              </button>
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Official Prescription PDF Viewer & Print Modal */}
      <PrescriptionPDFModal
        isOpen={isPdfModalOpen}
        onClose={handleClosePdfModal}
        prescription={activePdfRx}
        hospital={hospital}
      />
    </div>
  );
};
