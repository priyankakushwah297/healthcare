import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  Appointment,
  Prescription,
  LabReport,
  MedicalHistoryRecord,
  AppNotification,
  Hospital,
  DepartmentInfo,
  PatientVisitAnalytics,
  StaffMember
} from '../types';
import {
  INITIAL_HOSPITAL,
  INITIAL_USERS,
  INITIAL_APPOINTMENTS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_LAB_REPORTS,
  INITIAL_MEDICAL_HISTORY,
  INITIAL_NOTIFICATIONS,
  INITIAL_VISIT_ANALYTICS,
  INITIAL_DEPARTMENTS,
  INITIAL_STAFF
} from '../data/initialData';

interface HospitalContextType {
  currentUser: UserProfile | null;
  currentRole: UserRole | 'guest';
  hospital: Hospital;
  users: UserProfile[];
  appointments: Appointment[];
  prescriptions: Prescription[];
  labReports: LabReport[];
  medicalHistory: MedicalHistoryRecord[];
  notifications: AppNotification[];
  visitAnalytics: PatientVisitAnalytics;
  departments: DepartmentInfo[];
  staff: StaffMember[];
  
  // Navigation & Page state
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAuthModalOpen: boolean;
  openAuthModal: (initialRole?: UserRole) => void;
  closeAuthModal: () => void;
  isBookModalOpen: boolean;
  openBookModal: () => void;
  closeBookModal: () => void;
  
  // Auth flows
  checkPhoneExists: (phone: string) => { exists: boolean; user?: UserProfile };
  requestOtp: (phone: string) => Promise<{ success: boolean; otp: string }>;
  verifyOtpAndLogin: (phone: string, otp: string) => Promise<{ success: boolean; user?: UserProfile; message?: string }>;
  registerAndLogin: (userData: Partial<UserProfile>) => Promise<{ success: boolean; user?: UserProfile; message?: string }>;
  switchUserRole: (role: UserRole, userId?: string) => void;
  logout: () => void;
  
  // Actions
  bookAppointment: (aptData: Omit<Appointment, 'id' | 'bookingRef' | 'createdAt'>) => Promise<Appointment>;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  addPrescription: (prescription: Omit<Prescription, 'id' | 'prescriptionNumber'>) => Promise<Prescription>;
  updatePrescription: (id: string, updates: Partial<Prescription>) => void;
  addLabReport: (report: Omit<LabReport, 'id' | 'reportNumber'>) => Promise<LabReport>;
  addStaff: (member: Omit<StaffMember, 'id' | 'createdAt'>) => Promise<StaffMember>;
  updateStaff: (idOrStaffId: string, updates: Partial<StaffMember>) => Promise<void>;
  deleteStaff: (idOrStaffId: string) => Promise<void>;
  toggleStaffActiveStatus: (idOrStaffId: string) => Promise<void>;
  registerPatientByReceptionist: (data: any) => Promise<UserProfile>;
  updateUserProfile: (id: string, updates: Partial<UserProfile>) => void;
  updateHospitalInfo: (updates: Partial<Hospital>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_USER: 'healthcare_current_user',
  APPOINTMENTS: 'healthcare_appointments',
  PRESCRIPTIONS: 'healthcare_prescriptions',
  LAB_REPORTS: 'healthcare_lab_reports',
  USERS: 'healthcare_users',
  STAFF: 'healthcare_staff',
  DELETED_STAFF: 'healthcare_deleted_staff',
  NOTIFICATIONS: 'healthcare_notifications',
  HOSPITAL: 'healthcare_hospital'
};

const getDeletedStaffKeys = (): Set<string> => {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.DELETED_STAFF);
    if (!saved) return new Set<string>();
    const parsed: string[] = JSON.parse(saved);
    // Un-blacklist previous technician (Karan Malhotra / TECH-KLP-01)
    const technicianKeys = new Set(['usr-technician-1', 'stf-10', 'TECH-KLP-01', '9876543260', 'karan malhotra']);
    const filtered = parsed.filter(k => !technicianKeys.has(k));
    try {
      localStorage.setItem(STORAGE_KEYS.DELETED_STAFF, JSON.stringify(filtered));
    } catch {}
    return new Set<string>(filtered);
  } catch {
    return new Set<string>();
  }
};

export const HospitalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current user state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [currentRole, setCurrentRole] = useState<UserRole | 'guest'>(() => {
    return currentUser ? currentUser.role : 'guest';
  });

  // App data state: Always ensure modern INITIAL_USERS (Admin, Technician, Doctor, Receptionist, Patient) are active
  const [users, setUsers] = useState<UserProfile[]>(() => {
    const deleted = getDeletedStaffKeys();
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        const map = new Map<string, UserProfile>();
        INITIAL_USERS.forEach(u => {
          const isDeleted = deleted.has(u.id) || deleted.has(u.staffId || '') || deleted.has(u.doctorId || '') || deleted.has((u.fullName || '').trim().toLowerCase());
          if (!isDeleted) map.set(u.id, u);
        });
        parsed.forEach((u: UserProfile) => {
          const isDeleted = deleted.has(u.id) || deleted.has(u.staffId || '') || deleted.has(u.doctorId || '') || deleted.has((u.fullName || '').trim().toLowerCase());
          if (!isDeleted) {
            const seed = INITIAL_USERS.find(s => s.id === u.id || (Boolean(s.staffId) && Boolean(u.staffId) && s.role === u.role && s.staffId === u.staffId) || (s.fullName && u.fullName && s.fullName.toLowerCase() === u.fullName.toLowerCase()));
            if (seed) {
              map.set(u.id, { ...seed, ...u, profilePhoto: u.profilePhoto || seed.profilePhoto });
            } else {
              map.set(u.id, u);
            }
          }
        });
        // Ensure default technician is present
        const techSeed = INITIAL_USERS.find(u => u.role === 'technician');
        if (techSeed && !map.has(techSeed.id)) {
          map.set(techSeed.id, techSeed);
        }
        return Array.from(map.values());
      }
      return INITIAL_USERS.filter(u => !deleted.has(u.id) && !deleted.has(u.staffId || '') && !deleted.has(u.doctorId || '') && !deleted.has((u.fullName || '').trim().toLowerCase()));
    } catch {
      return INITIAL_USERS.filter(u => !deleted.has(u.id) && !deleted.has(u.staffId || '') && !deleted.has(u.doctorId || '') && !deleted.has((u.fullName || '').trim().toLowerCase()));
    }
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        const map = new Map<string, Appointment>();
        INITIAL_APPOINTMENTS.forEach(a => map.set(a.id, a));
        parsed.forEach((a: Appointment) => map.set(a.id, a));
        return Array.from(map.values());
      }
      return INITIAL_APPOINTMENTS;
    } catch {
      return INITIAL_APPOINTMENTS;
    }
  });

  const [prescriptions, setPrescriptions] = useState<Prescription[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        const map = new Map<string, Prescription>();
        INITIAL_PRESCRIPTIONS.forEach(p => map.set(p.id, p));
        parsed.forEach((p: Prescription) => map.set(p.id, p));
        return Array.from(map.values());
      }
      return INITIAL_PRESCRIPTIONS;
    } catch {
      return INITIAL_PRESCRIPTIONS;
    }
  });

  const [labReports, setLabReports] = useState<LabReport[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LAB_REPORTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        const map = new Map<string, LabReport>();
        INITIAL_LAB_REPORTS.forEach(l => map.set(l.id, l));
        parsed.forEach((l: LabReport) => map.set(l.id, l));
        return Array.from(map.values());
      }
      return INITIAL_LAB_REPORTS;
    } catch {
      return INITIAL_LAB_REPORTS;
    }
  });

  const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryRecord[]>(INITIAL_MEDICAL_HISTORY);
  const [departments] = useState<DepartmentInfo[]>(INITIAL_DEPARTMENTS);

  const [staff, setStaff] = useState<StaffMember[]>(() => {
    const deleted = getDeletedStaffKeys();
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STAFF);
      if (saved) {
        const parsed: StaffMember[] = JSON.parse(saved);
        const map = new Map<string, StaffMember>();
        INITIAL_STAFF.forEach(s => {
          if (!deleted.has(s.id) && !deleted.has(s.staffId) && !deleted.has((s.fullName || s.name || '').trim().toLowerCase())) {
            map.set(s.id, s);
          }
        });
        parsed.forEach((s: StaffMember) => {
          if (!deleted.has(s.id) && !deleted.has(s.staffId) && !deleted.has((s.fullName || s.name || '').trim().toLowerCase())) {
            const seed = INITIAL_STAFF.find(st => st.id === s.id || st.staffId === s.staffId || (st.fullName && s.fullName && st.fullName.toLowerCase() === s.fullName.toLowerCase()));
            if (seed) {
              map.set(s.id, { ...seed, ...s, profilePhoto: s.profilePhoto || seed.profilePhoto });
            } else {
              map.set(s.id, s);
            }
          }
        });
        // Ensure default technician staff is present
        const techStaffSeed = INITIAL_STAFF.find(s => s.type === 'technician' || s.staffType === 'technician');
        if (techStaffSeed && !map.has(techStaffSeed.id)) {
          map.set(techStaffSeed.id, techStaffSeed);
        }
        return Array.from(map.values());
      }
      return INITIAL_STAFF.filter(s => !deleted.has(s.id) && !deleted.has(s.staffId) && !deleted.has((s.fullName || s.name || '').trim().toLowerCase()));
    } catch {
      return INITIAL_STAFF.filter(s => !deleted.has(s.id) && !deleted.has(s.staffId) && !deleted.has((s.fullName || s.name || '').trim().toLowerCase()));
    }
  });

  const [hospital, setHospital] = useState<Hospital>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HOSPITAL);
      return saved ? JSON.parse(saved) : INITIAL_HOSPITAL;
    } catch {
      return INITIAL_HOSPITAL;
    }
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [visitAnalytics, setVisitAnalytics] = useState<PatientVisitAnalytics>(INITIAL_VISIT_ANALYTICS);

  const PUBLIC_TABS = ['home', 'about', 'services', 'doctors', 'contact'];

  // UI state with initial route guard
  const [activeTab, setActiveTabRaw] = useState<string>(() => {
    return currentUser ? 'dashboard' : 'home';
  });

  const setActiveTab = (tab: string) => {
    if (currentUser && PUBLIC_TABS.includes(tab)) {
      setActiveTabRaw('dashboard');
    } else {
      setActiveTabRaw(tab);
    }
  };

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState<boolean>(false);

  // Keep localStorage synchronized & lock active tab to portal for logged-in users
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
        setCurrentRole(currentUser.role);
        setActiveTabRaw(prev => PUBLIC_TABS.includes(prev) ? 'dashboard' : prev);

        // Browser history lock: Prevent pressing Back button from navigating to public landing page
        try {
          window.history.pushState({ authenticated: true, role: currentUser.role }, '', window.location.href);
        } catch {}

        const handlePopState = () => {
          try {
            window.history.pushState({ authenticated: true, role: currentUser.role }, '', window.location.href);
          } catch {}
          setActiveTabRaw('dashboard');
        };

        window.addEventListener('popstate', handlePopState);
        return () => {
          window.removeEventListener('popstate', handlePopState);
        };
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        setCurrentRole('guest');
        setActiveTabRaw(prev => prev === 'dashboard' ? 'home' : prev);
      }
    } catch (err) {
      console.warn('LocalStorage error syncing current user:', err);
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (err) {
      console.warn('LocalStorage error syncing users:', err);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
    } catch (err) {
      console.warn('LocalStorage error syncing appointments:', err);
    }
  }, [appointments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(prescriptions));
    } catch (err) {
      console.warn('LocalStorage error syncing prescriptions:', err);
    }
  }, [prescriptions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LAB_REPORTS, JSON.stringify(labReports));
    } catch (err) {
      console.warn('LocalStorage error syncing lab reports:', err);
    }
  }, [labReports]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff));
    } catch (err) {
      console.warn('LocalStorage error syncing staff:', err);
    }
  }, [staff]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    } catch (err) {
      console.warn('LocalStorage error syncing notifications:', err);
    }
  }, [notifications]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HOSPITAL, JSON.stringify(hospital));
    } catch (err) {
      console.warn('LocalStorage error syncing hospital:', err);
    }
  }, [hospital]);

  // Sync staff from backend database on mount
  useEffect(() => {
    const syncStaff = async () => {
      const deleted = getDeletedStaffKeys();
      try {
        const backendStaff = await api.fetchStaff();
        if (backendStaff && Array.isArray(backendStaff) && backendStaff.length > 0) {
          const mapped: StaffMember[] = backendStaff
            .filter((s: any) => 
              !deleted.has(s.staff_id) && 
              !deleted.has(`stf-${s.id}`) && 
              !deleted.has(String(s.id)) &&
              !deleted.has((s.full_name || '').trim().toLowerCase())
            )
            .map((s: any) => ({
              id: s.id ? `stf-${s.id}` : `stf-${s.staff_id}`,
              name: s.full_name,
              fullName: s.full_name,
              staffId: s.staff_id,
              mobile: s.mobile,
              email: s.email,
              type: s.staff_type,
              staffType: s.staff_type,
              department: s.department,
              roleTitle: s.specialization || s.role_title,
              specialization: s.specialization,
              qualification: s.qualification,
              experience: s.experience,
              consultationFee: s.consultation_fee ? parseInt(String(s.consultation_fee).replace(/[^0-9]/g, '')) || 700 : 700,
              availability: s.availability,
              workingHours: s.working_hours,
              profilePhoto: s.profile_photo,
              createdAt: s.created_at || new Date().toISOString()
            }));
          setStaff(mapped);
          try {
            localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(mapped));
          } catch {}
        }
      } catch (err) {
        console.warn('syncStaff error:', err);
      }
    };
    syncStaff();
  }, []);

  // Auth Functions
  const checkPhoneExists = (phone: string) => {
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    if (!cleanPhone) return { exists: false, user: undefined };

    const deleted = getDeletedStaffKeys();
    if (deleted.has(cleanPhone)) {
      return { exists: false, user: undefined };
    }

    // 1. Check in active state users (excluding deleted)
    let found = users.find(u => {
      const isDeleted = deleted.has(u.id) || deleted.has(u.staffId || '') || deleted.has(u.doctorId || '') || deleted.has((u.fullName || '').trim().toLowerCase()) || deleted.has((u.mobile || '').replace(/[^0-9]/g, ''));
      if (isDeleted) return false;
      const uMobile = (u.mobile || (u as any).mobileNumber || '').replace(/[^0-9]/g, '');
      return uMobile === cleanPhone;
    });

    // 2. Check in staff list (excluding deleted)
    if (!found) {
      const staffMember = staff.find(s => {
        const isDeleted = deleted.has(s.id) || deleted.has(s.staffId || '') || deleted.has((s.fullName || s.name || '').trim().toLowerCase()) || deleted.has((s.mobile || '').replace(/[^0-9]/g, ''));
        if (isDeleted) return false;
        return (s.mobile || '').replace(/[^0-9]/g, '') === cleanPhone;
      });
      if (staffMember) {
        found = {
          id: staffMember.id,
          role: (staffMember.type || staffMember.staffType || 'technician') as UserRole,
          staffId: staffMember.staffId,
          doctorId: (staffMember.type === 'doctor' || staffMember.staffType === 'doctor') ? staffMember.staffId : undefined,
          fullName: staffMember.name || staffMember.fullName || 'Staff Member',
          mobile: staffMember.mobile,
          email: staffMember.email || '',
          profilePhoto: staffMember.profilePhoto,
          createdAt: staffMember.createdAt || '2024-01-01'
        };
      }
    }

    // 3. Default Admin fallback numbers
    if (!found && (cleanPhone === '9876543210' || cleanPhone === '9876543240') && !deleted.has(cleanPhone)) {
      found = INITIAL_USERS.find(u => u.role === 'admin') || {
        id: 'usr-admin-1',
        role: 'admin',
        staffId: 'ADM-001',
        fullName: 'Dr. Ramesh Chandra (Hospital Director)',
        mobile: '9876543210',
        email: 'director@healthcare.com',
        dobOrAge: '56 Years',
        gender: 'Male',
        createdAt: '2024-01-01'
      };
    }

    return {
      exists: !!found,
      user: found
    };
  };

  const requestOtp = async (phone: string) => {
    // Generate a secure standard 6-digit OTP (e.g. 123456 for instant verification)
    try {
      await api.sendOtp((phone || '').replace(/[^0-9]/g, ''));
    } catch {}
    return new Promise<{ success: boolean; otp: string }>((resolve) => {
      setTimeout(() => {
        resolve({ success: true, otp: '123456' });
      }, 500);
    });
  };

  const verifyOtpAndLogin = async (phone: string, otp: string) => {
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    if (otp !== '123456' && otp.length !== 6) {
      return { success: false, message: 'Invalid OTP. Please enter valid 6-digit OTP (use 123456 for demo verification).' };
    }

    const { exists, user } = checkPhoneExists(cleanPhone);
    if (!exists || !user) {
      return { success: false, message: 'Mobile number not found. Please register as a new patient or doctor.' };
    }

    try {
      await api.verifyOtp(cleanPhone, otp);
    } catch {}

    setCurrentUser(user);
    setCurrentRole(user.role);
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } catch {}
    setActiveTab('dashboard');
    setIsAuthModalOpen(false);
    return { success: true, user };
  };

  const registerAndLogin = async (userData: Partial<UserProfile> | any) => {
    const cleanMobile = (userData.mobile || userData.mobileNumber || '').replace(/[^0-9]/g, '');
    const newId = `usr-${Date.now()}`;
    const patientNum = 1000 + users.filter(u => u.role === 'patient').length + 1;
    const patientId = userData.role === 'doctor' 
      ? `DOC-KLP-${200 + users.filter(u => u.role === 'doctor').length}`
      : `PAT-2026-${patientNum}`;

    const newUser: UserProfile = {
      id: newId,
      role: userData.role || 'patient',
      patientId: userData.role === 'patient' ? patientId : undefined,
      doctorId: userData.role === 'doctor' ? patientId : undefined,
      fullName: userData.fullName || 'New User',
      mobile: cleanMobile,
      email: userData.email || '',
      dobOrAge: userData.dobOrAge || userData.dob || '30 Years',
      gender: userData.gender || 'Male',
      bloodGroup: userData.bloodGroup || 'O+',
      address: userData.address || '',
      emergencyContact: userData.emergencyContact || '',
      profilePhoto: userData.gender === 'Female'
        ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString().split('T')[0],
      ...(userData.role === 'doctor' ? {
        specialization: userData.specialization || 'Consultant Specialist',
        department: userData.department || 'General Medicine',
        qualification: userData.qualification || 'MBBS, MD',
        experience: userData.experience || '8+ Years',
        consultationFee: userData.consultationFee || 700,
        availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        shiftTiming: '09:00 AM - 05:00 PM',
        workingHours: '8 Hours / Day',
        clinicName: 'Main OPD Wing, Healthcare Center',
        clinicAddress: INITIAL_HOSPITAL.address
      } : {})
    };

    // 1. Sync to backend API database if available
    try {
      await api.registerUser({
        full_name: newUser.fullName,
        mobile_number: newUser.mobile,
        email: newUser.email,
        role: newUser.role,
        gender: newUser.gender,
        dob: newUser.dobOrAge,
        blood_group: newUser.bloodGroup,
        specialization: newUser.specialization,
        department: newUser.department
      });
    } catch (err) {
      console.warn('Backend API registration notice (falling back to permanent local storage):', err);
    }

    // 2. Immediately persist user in state & LocalStorage
    setUsers(prev => {
      const updated = [newUser, ...prev.filter(u => (u.mobile || (u as any).mobileNumber || '').replace(/[^0-9]/g, '') !== cleanMobile)];
      try {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
      } catch (err) {
        console.warn('LocalStorage error:', err);
      }
      return updated;
    });

    // 3. Also add to staff list if staff
    if (newUser.role !== 'patient') {
      const newStaff: StaffMember = {
        id: `stf-${Date.now()}`,
        name: newUser.fullName,
        fullName: newUser.fullName,
        staffId: newUser.doctorId || newUser.staffId || `STF-${Date.now().toString().slice(-4)}`,
        mobile: newUser.mobile,
        email: newUser.email,
        type: newUser.role as any,
        staffType: newUser.role as any,
        department: newUser.department || 'General',
        roleTitle: newUser.specialization || 'Healthcare Professional',
        qualification: newUser.qualification || 'Certified Professional',
        experience: newUser.experience || 'Experienced',
        consultationFee: newUser.consultationFee || 700,
        availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        shiftTiming: '09:00 AM - 05:00 PM',
        workingHours: '8 Hours / Day',
        isActive: true,
        profilePhoto: newUser.profilePhoto,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setStaff(prev => {
        const updatedStaff = [newStaff, ...prev.filter(s => (s.mobile || '').replace(/[^0-9]/g, '') !== cleanMobile)];
        try {
          localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(updatedStaff));
        } catch {}
        return updatedStaff;
      });
    }

    // 4. Set active user & persist session
    setCurrentUser(newUser);
    setCurrentRole(newUser.role);
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    } catch {}
    setActiveTab('dashboard');
    setIsAuthModalOpen(false);

    // 5. Add welcome notification
    const welcomeNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: newUser.id,
      type: 'system',
      title: 'Welcome to Healthcare Center',
      message: `Account created successfully. Your Unique ID is ${patientId}.`,
      date: new Date().toISOString(),
      isRead: false
    };
    setNotifications(prev => [welcomeNotif, ...prev]);

    return { success: true, user: newUser };
  };

  const switchUserRole = (role: UserRole, targetUserId?: string) => {
    const deleted = getDeletedStaffKeys();
    
    // Find active user for this role that is NOT in deleted blacklist
    let target = targetUserId 
      ? users.find(u => u.id === targetUserId && !deleted.has(u.id) && !deleted.has(u.staffId || '') && !deleted.has((u.mobile || '').replace(/[^0-9]/g, '')))
      : null;

    if (!target) {
      target = users.find(u => u.role === role && !deleted.has(u.id) && !deleted.has(u.staffId || '') && !deleted.has((u.mobile || '').replace(/[^0-9]/g, ''))) || null;
    }

    // Also check active staff
    if (!target && role !== 'patient') {
      const staffTarget = staff.find(s => 
        (s.type === role || s.staffType === role) && 
        s.isActive !== false && 
        !deleted.has(s.id) && 
        !deleted.has(s.staffId) && 
        !deleted.has((s.mobile || '').replace(/[^0-9]/g, ''))
      );
      if (staffTarget) {
        target = {
          id: staffTarget.id,
          role: role,
          staffId: staffTarget.staffId,
          doctorId: role === 'doctor' ? staffTarget.staffId : undefined,
          fullName: staffTarget.name || staffTarget.fullName || 'Staff Member',
          mobile: staffTarget.mobile,
          email: staffTarget.email || '',
          profilePhoto: staffTarget.profilePhoto,
          createdAt: staffTarget.createdAt || new Date().toISOString().split('T')[0]
        };
      }
    }

    if (target) {
      setCurrentUser(target);
      setCurrentRole(role);
      setActiveTab('dashboard');
    } else {
      // Role has no active accounts in hospital master
      alert(`No active ${role.toUpperCase()} profile exists in the system. If deleted by Admin, please add a new ${role} from the Admin Dashboard first.`);
      if (currentUser?.role === role) {
        logout();
      }
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentRole('guest');
    setActiveTab('home');
  };

  // Actions
  const bookAppointment = async (aptData: Omit<Appointment, 'id' | 'bookingRef' | 'createdAt'>) => {
    const bookingRef = `KLP-APT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newApt: Appointment = {
      ...aptData,
      id: `apt-${Date.now()}`,
      bookingRef,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setAppointments(prev => [newApt, ...prev]);

    // Send notifications to Patient & Doctor
    const patientNotif: AppNotification = {
      id: `notif-${Date.now()}-1`,
      userId: newApt.patientId,
      type: 'appointment',
      title: 'Appointment Confirmed & Scheduled',
      message: `Your appointment with ${newApt.doctorName} (${newApt.department}) is confirmed for ${newApt.date} at ${newApt.timeSlot} via ${newApt.visitMode}. Ref: ${bookingRef}`,
      date: new Date().toISOString(),
      isRead: false,
      link: 'appointments'
    };

    const doctorNotif: AppNotification = {
      id: `notif-${Date.now()}-2`,
      userId: newApt.doctorId,
      type: 'appointment',
      title: 'New Patient Booking Received',
      message: `${newApt.patientName} has booked a ${newApt.visitMode} appointment on ${newApt.date} at ${newApt.timeSlot}.`,
      date: new Date().toISOString(),
      isRead: false
    };

    setNotifications(prev => [patientNotif, doctorNotif, ...prev]);

    // Update visit analytics dynamically
    setVisitAnalytics(prev => ({
      ...prev,
      totalPatientsToday: prev.totalPatientsToday + 1,
      newPatientsCount: prev.newPatientsCount + 1
    }));

    return newApt;
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments(prev => prev.map(a => (a.id === id ? { ...a, status } : a)));
  };

  const addPrescription = async (prescriptionData: Omit<Prescription, 'id' | 'prescriptionNumber'>) => {
    const prescriptionNumber = `RX-KLP-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newPrescription: Prescription = {
      ...prescriptionData,
      id: `rx-${Date.now()}`,
      prescriptionNumber
    };

    setPrescriptions(prev => [newPrescription, ...prev]);

    // Send notification to Patient
    const rxNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: newPrescription.patientId,
      type: 'medicine',
      title: 'New Prescription Issued',
      message: `${newPrescription.doctorName} has issued a new prescription (${prescriptionNumber}) with ${newPrescription.medicines.length} medications.`,
      date: new Date().toISOString(),
      isRead: false,
      link: 'prescriptions'
    };
    setNotifications(prev => [rxNotif, ...prev]);

    return newPrescription;
  };

  const updatePrescription = (id: string, updates: Partial<Prescription>) => {
    setPrescriptions(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
  };

  const addLabReport = async (reportData: Omit<LabReport, 'id' | 'reportNumber'>) => {
    const reportNumber = `LAB-KLP-2026-${Math.floor(4000 + Math.random() * 1000)}`;
    const newReport: LabReport = {
      ...reportData,
      id: `lab-${Date.now()}`,
      reportNumber
    };

    setLabReports(prev => [newReport, ...prev]);

    const labNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: newReport.patientId,
      type: 'lab_report',
      title: 'Laboratory Report Available',
      message: `Your test report for "${newReport.testName}" is now ${newReport.reportStatus} for review and download.`,
      date: new Date().toISOString(),
      isRead: false,
      link: 'history'
    };
    setNotifications(prev => [labNotif, ...prev]);

    return newReport;
  };

  const addStaff = async (memberData: Omit<StaffMember, 'id' | 'createdAt'>) => {
    const newStaff: StaffMember = {
      ...memberData,
      id: `stf-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setStaff(prev => [newStaff, ...prev]);

    // If it's a doctor or patient or staff, also add to user profiles
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      role: (memberData.type as UserRole) || 'technician',
      fullName: memberData.name,
      mobile: memberData.mobile,
      email: memberData.email,
      staffId: memberData.staffId,
      doctorId: memberData.type === 'doctor' ? memberData.staffId : undefined,
      patientId: memberData.type === 'patient' ? memberData.staffId : undefined,
      department: memberData.department,
      specialization: memberData.roleTitle,
      qualification: memberData.qualification,
      experience: memberData.experience,
      consultationFee: memberData.consultationFee,
      availableDays: memberData.availability,
      workingHours: memberData.workingHours,
      dobOrAge: memberData.dobOrAge,
      gender: memberData.gender as any,
      bloodGroup: memberData.bloodGroup,
      address: memberData.address,
      emergencyContact: memberData.emergencyContact,
      pharmacyRole: memberData.pharmacyRole,
      labDepartment: memberData.labDepartment,
      labRole: memberData.labRole,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUsers(prev => [newUser, ...prev]);
    return newStaff;
  };

  const updateStaff = async (idOrStaffId: string, updates: Partial<StaffMember>) => {
    const target = staff.find(s => s.id === idOrStaffId || s.staffId === idOrStaffId);
    const staffIdToUpdate = target ? (target.staffId || target.id) : idOrStaffId;
    const targetName = target ? (target.fullName || target.name) : '';

    const payload: any = {};
    if (updates.name !== undefined || updates.fullName !== undefined) payload.full_name = updates.name || updates.fullName;
    if (updates.mobile !== undefined) payload.mobile = updates.mobile;
    if (updates.email !== undefined) payload.email = updates.email;
    if (updates.specialization !== undefined || updates.roleTitle !== undefined) payload.specialization = updates.specialization || updates.roleTitle;
    if (updates.department !== undefined) payload.department = updates.department;
    if (updates.qualification !== undefined) payload.qualification = updates.qualification;
    if (updates.experience !== undefined) payload.experience = updates.experience;
    if (updates.availability !== undefined) payload.availability = updates.availability;
    if (updates.workingHours !== undefined) payload.working_hours = updates.workingHours;
    if (updates.profilePhoto !== undefined) payload.profile_photo = updates.profilePhoto;
    if (updates.pharmacyRole !== undefined) payload.pharmacy_role = updates.pharmacyRole;
    if (updates.labDepartment !== undefined) payload.lab_department = updates.labDepartment;
    if (updates.labRole !== undefined) payload.lab_role = updates.labRole;

    try {
      await api.updateStaff(staffIdToUpdate, payload);
    } catch (err) {
      console.warn('API updateStaff error:', err);
    }

    setStaff(prev => {
      const updated = prev.map(s => {
        const matches = s.id === idOrStaffId || 
                        s.staffId === idOrStaffId || 
                        s.staffId === staffIdToUpdate || 
                        (targetName && (s.fullName === targetName || s.name === targetName));
        if (matches) {
          return {
            ...s,
            ...updates,
            name: updates.name || updates.fullName || s.name,
            fullName: updates.name || updates.fullName || s.fullName || s.name,
            profilePhoto: updates.profilePhoto !== undefined ? updates.profilePhoto : s.profilePhoto
          };
        }
        return s;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setUsers(prev => {
      const updated = prev.map(u => {
        const matches = u.staffId === staffIdToUpdate || 
                        u.doctorId === staffIdToUpdate || 
                        u.id === idOrStaffId || 
                        u.staffId === idOrStaffId || 
                        (targetName && u.fullName === targetName) || 
                        (target?.mobile && u.mobile === target.mobile);
        if (matches) {
          return {
            ...u,
            fullName: updates.name || updates.fullName || u.fullName,
            mobile: updates.mobile || u.mobile,
            email: updates.email || u.email,
            specialization: updates.specialization || updates.roleTitle || u.specialization,
            department: updates.department || u.department,
            qualification: updates.qualification || u.qualification,
            experience: updates.experience || u.experience,
            availableDays: updates.availability || u.availableDays,
            workingHours: updates.workingHours || u.workingHours,
            profilePhoto: updates.profilePhoto !== undefined ? updates.profilePhoto : u.profilePhoto,
            avatar: updates.profilePhoto !== undefined ? updates.profilePhoto : u.avatar,
            staffId: target?.staffId || u.staffId || staffIdToUpdate,
            doctorId: target?.staffId || u.doctorId || staffIdToUpdate
          };
        }
        return u;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // DYNAMICALLY SYNC CURRENT USER STATE AND LOCALSTORAGE
    setCurrentUser(prev => {
      if (!prev) return prev;
      const isTarget = prev.id === idOrStaffId ||
                       prev.staffId === staffIdToUpdate ||
                       prev.doctorId === staffIdToUpdate ||
                       prev.id === staffIdToUpdate ||
                       prev.staffId === idOrStaffId ||
                       (targetName && (prev.fullName === targetName)) ||
                       (target?.mobile && prev.mobile === target.mobile) ||
                       (prev.role === 'technician' && (target?.type === 'technician' || target?.staffType === 'technician'));
      if (isTarget) {
        const updated = {
          ...prev,
          fullName: updates.name || updates.fullName || prev.fullName,
          mobile: updates.mobile || prev.mobile,
          email: updates.email || prev.email,
          specialization: updates.specialization || updates.roleTitle || prev.specialization,
          department: updates.department || prev.department,
          qualification: updates.qualification || prev.qualification,
          experience: updates.experience || prev.experience,
          availableDays: updates.availability || prev.availableDays,
          workingHours: updates.workingHours || prev.workingHours,
          profilePhoto: updates.profilePhoto !== undefined ? updates.profilePhoto : prev.profilePhoto,
          avatar: updates.profilePhoto !== undefined ? updates.profilePhoto : prev.avatar,
          staffId: target?.staffId || prev.staffId || staffIdToUpdate,
          doctorId: target?.staffId || prev.doctorId || staffIdToUpdate
        };
        try {
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updated));
        } catch {}
        return updated;
      }
      return prev;
    });
  };

  const deleteStaff = async (idOrStaffId: string) => {
    const target = staff.find(s => s.id === idOrStaffId || s.staffId === idOrStaffId) ||
                   users.find(u => u.id === idOrStaffId || u.staffId === idOrStaffId || u.doctorId === idOrStaffId);
    const staffIdToDelete = target?.staffId || (target as any)?.doctorId || idOrStaffId;
    const targetName = (target?.fullName || (target as any)?.name || '').trim().toLowerCase();
    const targetMobile = ((target?.mobile || (target as any)?.mobileNumber || '')).replace(/[^0-9]/g, '');

    // 1. Add all identifiers to persistent deleted blacklist
    const deleted = getDeletedStaffKeys();
    if (idOrStaffId) deleted.add(idOrStaffId);
    if (staffIdToDelete) deleted.add(staffIdToDelete);
    if (targetName) deleted.add(targetName);
    if (targetMobile) deleted.add(targetMobile);
    try {
      localStorage.setItem(STORAGE_KEYS.DELETED_STAFF, JSON.stringify(Array.from(deleted)));
    } catch {}

    // 2. Call backend SQLite DELETE endpoint
    try {
      await api.deleteStaff(staffIdToDelete);
      if (idOrStaffId !== staffIdToDelete) {
        await api.deleteStaff(idOrStaffId);
      }
    } catch (err) {
      console.warn('api.deleteStaff error:', err);
    }

    // 3. Remove from staff state & localStorage
    setStaff(prev => {
      const updated = prev.filter(s => 
        s.id !== idOrStaffId && 
        s.staffId !== idOrStaffId && 
        s.staffId !== staffIdToDelete &&
        s.id !== staffIdToDelete &&
        (!targetMobile || (s.mobile || '').replace(/[^0-9]/g, '') !== targetMobile) &&
        (!targetName || (s.fullName || s.name || '').trim().toLowerCase() !== targetName)
      );
      try {
        localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // 4. Remove from users state & localStorage
    setUsers(prev => {
      const updated = prev.filter(u => 
        u.id !== idOrStaffId && 
        u.staffId !== idOrStaffId && 
        u.staffId !== staffIdToDelete && 
        u.doctorId !== staffIdToDelete &&
        u.id !== staffIdToDelete &&
        (!targetMobile || (u.mobile || (u as any).mobileNumber || '').replace(/[^0-9]/g, '') !== targetMobile) &&
        (!targetName || (u.fullName || '').trim().toLowerCase() !== targetName)
      );
      try {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // 5. If currently logged in as this deleted user, terminate session immediately
    if (currentUser) {
      const isCurDeleted = 
        currentUser.id === idOrStaffId ||
        currentUser.staffId === idOrStaffId ||
        currentUser.staffId === staffIdToDelete ||
        currentUser.id === staffIdToDelete ||
        (targetMobile && (currentUser.mobile || '').replace(/[^0-9]/g, '') === targetMobile) ||
        (targetName && (currentUser.fullName || '').trim().toLowerCase() === targetName);

      if (isCurDeleted) {
        logout();
      }
    }
  };

  const registerPatientByReceptionist = async (patientFormData: any) => {
    const cleanMobile = (patientFormData.mobile || patientFormData.mobileNumber || '').replace(/[^0-9]/g, '');
    const patientId = `PAT-2026-${1000 + users.filter(u => u.role === 'patient').length + 1}`;
    const newPatient: UserProfile = {
      id: `usr-pat-${Date.now()}`,
      role: 'patient',
      patientId,
      fullName: patientFormData.fullName || 'Patient',
      mobile: cleanMobile,
      email: patientFormData.email || `${(patientFormData.fullName || 'patient').toLowerCase().replace(/\s+/g, '.')}@example.com`,
      dobOrAge: patientFormData.dobOrAge || '30 Years',
      gender: patientFormData.gender || 'Male',
      bloodGroup: patientFormData.bloodGroup || 'O+',
      address: patientFormData.address || '',
      emergencyContact: patientFormData.emergencyContact || '',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUsers(prev => {
      const updated = [newPatient, ...prev.filter(u => (u.mobile || '').replace(/[^0-9]/g, '') !== cleanMobile)];
      try {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Also add to staff table as patient record
    const staffRec: StaffMember = {
      id: `stf-${Date.now()}`,
      name: newPatient.fullName,
      fullName: newPatient.fullName,
      staffId: patientId,
      mobile: newPatient.mobile,
      email: newPatient.email,
      type: 'patient',
      staffType: 'patient',
      dobOrAge: newPatient.dobOrAge,
      gender: newPatient.gender,
      bloodGroup: newPatient.bloodGroup,
      address: newPatient.address,
      emergencyContact: newPatient.emergencyContact,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setStaff(prev => [staffRec, ...prev]);

    // If an initial appointment was also booked during registration
    if (patientFormData.doctor && patientFormData.department) {
      const doc = users.find(u => u.fullName === patientFormData.doctor || u.doctorId === patientFormData.doctorId);
      await bookAppointment({
        patientId: newPatient.id,
        patientName: newPatient.fullName,
        patientMobile: newPatient.mobile,
        patientGender: newPatient.gender,
        patientAge: newPatient.dobOrAge,
        doctorId: doc ? doc.id : 'usr-doctor-1',
        doctorName: doc ? doc.fullName : patientFormData.doctor,
        doctorSpecialization: doc?.specialization || 'Consultant',
        department: patientFormData.department,
        date: new Date().toISOString().split('T')[0],
        timeSlot: '11:00 AM - 11:30 AM',
        visitMode: patientFormData.visitMode || 'Clinic',
        symptoms: patientFormData.symptoms || 'Receptionist Walk-in Registration Consultation',
        status: 'today',
        paymentStatus: 'paid',
        amount: doc?.consultationFee || 700,
        paymentMethod: 'Cash / Hospital Desk'
      });
    }

    return newPatient;
  };

  const toggleStaffActiveStatus = async (idOrStaffId: string) => {
    const target = staff.find(s => s.id === idOrStaffId || s.staffId === idOrStaffId);
    if (!target) return;
    const newStatus = target.isActive === false ? true : false;
    await updateStaff(idOrStaffId, { isActive: newStatus });
  };

  const updateUserProfile = (id: string, updates: Partial<UserProfile>) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const updated = { ...u, ...updates };
        if (currentUser && currentUser.id === id) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return u;
    }));
  };

  const updateHospitalInfo = (updates: Partial<Hospital>) => {
    setHospital(prev => {
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEYS.HOSPITAL, JSON.stringify(updated));
      } catch (err) {
        console.warn('LocalStorage error saving hospital info:', err);
      }
      return updated;
    });
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const openAuthModal = (initialRole?: UserRole) => {
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const openBookModal = () => {
    setIsBookModalOpen(true);
  };

  const closeBookModal = () => {
    setIsBookModalOpen(false);
  };

  return (
    <HospitalContext.Provider
      value={{
        currentUser,
        currentRole,
        hospital,
        users,
        appointments,
        prescriptions,
        labReports,
        medicalHistory,
        notifications,
        visitAnalytics,
        departments,
        staff,
        activeTab,
        setActiveTab,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        isBookModalOpen,
        openBookModal,
        closeBookModal,
        checkPhoneExists,
        requestOtp,
        verifyOtpAndLogin,
        registerAndLogin,
        switchUserRole,
        logout,
        bookAppointment,
        updateAppointmentStatus,
        addPrescription,
        updatePrescription,
        addLabReport,
        addStaff,
        updateStaff,
        deleteStaff,
        toggleStaffActiveStatus,
        registerPatientByReceptionist,
        updateUserProfile,
        updateHospitalInfo,
        markNotificationAsRead,
        markAllNotificationsAsRead
      }}
    >
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
};
