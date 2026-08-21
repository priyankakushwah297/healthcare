import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
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
import { api } from '../services/api';

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
  refreshBackendData: () => Promise<void>;
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

  // App data state
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
        INITIAL_APPOINTMENTS.forEach(a => map.set(a.id || a.bookingRef, a));
        parsed.forEach((a: Appointment) => map.set(a.id || a.bookingRef, a));
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
        INITIAL_PRESCRIPTIONS.forEach(p => map.set(p.id || p.prescriptionNumber, p));
        parsed.forEach((p: Prescription) => map.set(p.id || p.prescriptionNumber, p));
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
        INITIAL_LAB_REPORTS.forEach(l => map.set(l.id || l.reportNumber, l));
        parsed.forEach((l: LabReport) => map.set(l.id || l.reportNumber, l));
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

  // =========================================================================
  // CONTINUOUS REAL-TIME CROSS-DEVICE SYNCHRONIZATION WITH SUPABASE POSTGRESQL
  // =========================================================================
  const isSyncingRef = useRef(false);

  const refreshBackendData = useCallback(async () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    const deleted = getDeletedStaffKeys();

    try {
      // 1. Fetch & Merge Appointments
      const remoteApts = await api.fetchAppointments();
      if (remoteApts && Array.isArray(remoteApts) && remoteApts.length > 0) {
        setAppointments(prev => {
          const map = new Map<string, Appointment>();
          INITIAL_APPOINTMENTS.forEach(a => map.set(a.bookingRef || a.id, a));
          prev.forEach(a => map.set(a.bookingRef || a.id, a));
          remoteApts.forEach(a => map.set(a.bookingRef || a.id, a));
          const merged = Array.from(map.values()).sort((a, b) => {
            return (b.createdAt || '').localeCompare(a.createdAt || '') || (b.bookingRef || '').localeCompare(a.bookingRef || '');
          });
          return merged;
        });
      }

      // 2. Fetch & Merge Prescriptions
      const remoteRx = await api.fetchPrescriptions();
      if (remoteRx && Array.isArray(remoteRx) && remoteRx.length > 0) {
        setPrescriptions(prev => {
          const map = new Map<string, Prescription>();
          INITIAL_PRESCRIPTIONS.forEach(p => map.set(p.prescriptionNumber || p.id, p));
          prev.forEach(p => map.set(p.prescriptionNumber || p.id, p));
          remoteRx.forEach(p => map.set(p.prescriptionNumber || p.id, p));
          return Array.from(map.values());
        });
      }

      // 3. Fetch & Merge Lab Reports
      const remoteLab = await api.fetchLabReports();
      if (remoteLab && Array.isArray(remoteLab) && remoteLab.length > 0) {
        setLabReports(prev => {
          const map = new Map<string, LabReport>();
          INITIAL_LAB_REPORTS.forEach(l => map.set(l.reportNumber || l.id, l));
          prev.forEach(l => map.set(l.reportNumber || l.id, l));
          remoteLab.forEach(l => map.set(l.reportNumber || l.id, l));
          return Array.from(map.values());
        });
      }

      // 4. Fetch & Merge Staff Members
      const remoteStaff = await api.fetchStaff();
      if (remoteStaff && Array.isArray(remoteStaff) && remoteStaff.length > 0) {
        setStaff(prev => {
          const map = new Map<string, StaffMember>();
          INITIAL_STAFF.forEach(s => {
            if (!deleted.has(s.id) && !deleted.has(s.staffId) && !deleted.has((s.fullName || s.name || '').trim().toLowerCase())) {
              map.set(s.staffId || s.id, s);
            }
          });
          prev.forEach(s => {
            if (!deleted.has(s.id) && !deleted.has(s.staffId) && !deleted.has((s.fullName || s.name || '').trim().toLowerCase())) {
              map.set(s.staffId || s.id, s);
            }
          });
          remoteStaff.forEach(s => {
            if (!deleted.has(s.id) && !deleted.has(s.staffId) && !deleted.has((s.fullName || s.name || '').trim().toLowerCase())) {
              const existing = map.get(s.staffId || s.id);
              map.set(s.staffId || s.id, { ...existing, ...s, profilePhoto: s.profilePhoto || existing?.profilePhoto });
            }
          });
          return Array.from(map.values());
        });
      }

      // 5. Fetch & Merge Registered Users & Patients
      const remoteUsers = await api.fetchUsers();
      if (remoteUsers && Array.isArray(remoteUsers) && remoteUsers.length > 0) {
        setUsers(prev => {
          const map = new Map<string, UserProfile>();
          INITIAL_USERS.forEach(u => {
            if (!deleted.has(u.id) && !deleted.has(u.staffId || '') && !deleted.has(u.doctorId || '') && !deleted.has((u.fullName || '').trim().toLowerCase())) {
              map.set(u.id, u);
            }
          });
          prev.forEach(u => {
            if (!deleted.has(u.id) && !deleted.has(u.staffId || '') && !deleted.has(u.doctorId || '') && !deleted.has((u.fullName || '').trim().toLowerCase())) {
              map.set(u.id, u);
            }
          });
          remoteUsers.forEach(u => {
            if (!deleted.has(u.id) && !deleted.has(u.staffId || '') && !deleted.has(u.doctorId || '') && !deleted.has((u.fullName || '').trim().toLowerCase())) {
              map.set(u.id, u);
            }
          });
          return Array.from(map.values());
        });
      }
    } catch (err) {
      console.warn('Real-time sync notice:', err);
    } finally {
      isSyncingRef.current = false;
    }
  }, []);

  // Initial fetch on mount & background polling every 5 seconds + visibility listener
  useEffect(() => {
    refreshBackendData();

    // 5-second polling interval to capture appointments/prescriptions created on other phones/laptops
    const intervalId = setInterval(() => {
      refreshBackendData();
    }, 5000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshBackendData();
      }
    };

    const handleFocus = () => {
      refreshBackendData();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshBackendData]);

  // Auth Functions
  const checkPhoneExists = (phone: string) => {
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    if (!cleanPhone) return { exists: false, user: undefined };

    const deleted = getDeletedStaffKeys();
    if (deleted.has(cleanPhone)) {
      return { exists: false, user: undefined };
    }

    // 1. Check in active state users
    let found = users.find(u => {
      const isDeleted = deleted.has(u.id) || deleted.has(u.staffId || '') || deleted.has(u.doctorId || '') || deleted.has((u.fullName || '').trim().toLowerCase()) || deleted.has((u.mobile || '').replace(/[^0-9]/g, ''));
      if (isDeleted) return false;
      const uMobile = (u.mobile || (u as any).mobileNumber || '').replace(/[^0-9]/g, '');
      return uMobile === cleanPhone || (cleanPhone.length >= 10 && uMobile.endsWith(cleanPhone.slice(-10)));
    });

    // 2. Check in staff list
    if (!found) {
      const staffMember = staff.find(s => {
        const isDeleted = deleted.has(s.id) || deleted.has(s.staffId || '') || deleted.has((s.fullName || s.name || '').trim().toLowerCase()) || deleted.has((s.mobile || '').replace(/[^0-9]/g, ''));
        if (isDeleted) return false;
        const sMob = (s.mobile || '').replace(/[^0-9]/g, '');
        return sMob === cleanPhone || (cleanPhone.length >= 10 && sMob.endsWith(cleanPhone.slice(-10)));
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
          createdAt: staffMember.createdAt || '2026-08-20'
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
        createdAt: '2026-08-20'
      };
    }

    return {
      exists: !!found,
      user: found
    };
  };

  const requestOtp = async (phone: string) => {
    try {
      await api.sendOtp((phone || '').replace(/[^0-9]/g, ''));
    } catch {}
    return new Promise<{ success: boolean; otp: string }>((resolve) => {
      setTimeout(() => {
        resolve({ success: true, otp: '123456' });
      }, 400);
    });
  };

  const verifyOtpAndLogin = async (phone: string, otp: string) => {
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    if (otp !== '123456' && otp.length !== 6) {
      return { success: false, message: 'Invalid OTP. Please enter valid 6-digit OTP (use 123456 for instant verification).' };
    }

    let { exists, user } = checkPhoneExists(cleanPhone);

    // If not in memory yet, check backend database
    if (!exists || !user) {
      try {
        const backendCheck = await api.checkPhone(cleanPhone);
        if (backendCheck && backendCheck.exists && backendCheck.user) {
          const u = backendCheck.user;
          user = {
            id: u.user_id || `usr-${u.id}`,
            role: u.role,
            fullName: u.full_name,
            mobile: u.mobile_number,
            email: u.email || '',
            dobOrAge: u.age || u.dob || '30 Years',
            gender: u.gender || 'Male',
            bloodGroup: u.blood_group || 'O+',
            patientId: u.role === 'patient' ? u.user_id : undefined,
            doctorId: u.role === 'doctor' ? u.user_id : undefined,
            staffId: u.user_id,
            profilePhoto: u.avatar,
            createdAt: '2026-08-20'
          };
          exists = true;
          setUsers(prev => [user!, ...prev]);
        }
      } catch (err) {
        console.warn('Backend phone check notice:', err);
      }
    }

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
    
    // Trigger immediate sync
    refreshBackendData();
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
        ? 'https://res.cloudinary.com/agyzxqvk/image/upload/v1787224300/healthcare_avatars/avatar_receptionist_1.jpg'
        : 'https://res.cloudinary.com/agyzxqvk/image/upload/v1787224303/healthcare_avatars/avatar_patient.jpg',
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

    // 1. Sync to Supabase PostgreSQL database
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
        department: newUser.department,
        user_id: patientId
      });
    } catch (err) {
      console.warn('Backend API registration notice:', err);
    }

    // 2. Persist in state & LocalStorage
    setUsers(prev => {
      const updated = [newUser, ...prev.filter(u => (u.mobile || (u as any).mobileNumber || '').replace(/[^0-9]/g, '') !== cleanMobile)];
      return updated;
    });

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
      setStaff(prev => [newStaff, ...prev.filter(s => (s.mobile || '').replace(/[^0-9]/g, '') !== cleanMobile)]);
    }

    setCurrentUser(newUser);
    setCurrentRole(newUser.role);
    setActiveTab('dashboard');
    setIsAuthModalOpen(false);

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
    
    let target = targetUserId 
      ? users.find(u => u.id === targetUserId && !deleted.has(u.id) && !deleted.has(u.staffId || '') && !deleted.has((u.mobile || '').replace(/[^0-9]/g, '')))
      : null;

    if (!target) {
      target = users.find(u => u.role === role && !deleted.has(u.id) && !deleted.has(u.staffId || '') && !deleted.has((u.mobile || '').replace(/[^0-9]/g, ''))) || null;
    }

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
      alert(`No active ${role.toUpperCase()} profile exists in the system. Please add a new ${role} from the Admin Dashboard.`);
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

  // =========================================================================
  // ACTIONS: WRITE-THROUGH TO SUPABASE POSTGRESQL + REAL-TIME LOCAL DISPATCH
  // =========================================================================

  const bookAppointment = async (aptData: Omit<Appointment, 'id' | 'bookingRef' | 'createdAt'>): Promise<Appointment> => {
    const bookingRef = `KLP-APT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newApt: Appointment = {
      ...aptData,
      id: `apt-${Date.now()}`,
      bookingRef,
      createdAt: new Date().toISOString().split('T')[0]
    };

    // 1. Immediate optimistic UI update
    setAppointments(prev => [newApt, ...prev]);

    // 2. Persist to Supabase PostgreSQL database
    try {
      const saved = await api.bookAppointment({
        booking_ref: bookingRef,
        patient_id: newApt.patientId,
        patient_name: newApt.patientName,
        patient_phone: newApt.patientMobile,
        patient_gender: newApt.patientGender,
        patient_age: newApt.patientAge,
        doctor_id: newApt.doctorId,
        doctor_name: newApt.doctorName,
        doctor_specialization: newApt.doctorSpecialization,
        department: newApt.department,
        date: newApt.date,
        time_slot: newApt.timeSlot,
        visit_mode: newApt.visitMode,
        symptoms: newApt.symptoms,
        status: newApt.status,
        payment_status: newApt.paymentStatus,
        amount: newApt.amount,
        consultation_fee: newApt.consultationFee,
        home_location: newApt.homeLocation,
        notes: newApt.notes
      });
      if (saved) {
        setAppointments(prev => prev.map(a => a.bookingRef === bookingRef ? { ...a, ...saved } : a));
      }
    } catch (err) {
      console.warn('Backend bookAppointment notice:', err);
    }

    // 3. Notifications & analytics
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

    setVisitAnalytics(prev => ({
      ...prev,
      totalPatientsToday: prev.totalPatientsToday + 1,
      newPatientsCount: prev.newPatientsCount + 1
    }));

    return newApt;
  };

  const updateAppointmentStatus = async (idOrBookingRef: string, status: Appointment['status']) => {
    setAppointments(prev => prev.map(a => (a.id === idOrBookingRef || a.bookingRef === idOrBookingRef ? { ...a, status } : a)));

    try {
      await api.updateAppointmentStatus(idOrBookingRef, status);
    } catch (err) {
      console.warn('api.updateAppointmentStatus notice:', err);
    }
  };

  const addPrescription = async (prescriptionData: Omit<Prescription, 'id' | 'prescriptionNumber'>): Promise<Prescription> => {
    const prescriptionNumber = `RX-KLP-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newPrescription: Prescription = {
      ...prescriptionData,
      id: `rx-${Date.now()}`,
      prescriptionNumber
    };

    // 1. Optimistic UI update
    setPrescriptions(prev => [newPrescription, ...prev]);

    // 2. Persist to Supabase PostgreSQL database
    try {
      const saved = await api.addPrescription({
        prescription_number: prescriptionNumber,
        appointment_id: newPrescription.appointmentId,
        patient_id: newPrescription.patientId,
        patient_name: newPrescription.patientName,
        patient_mobile: newPrescription.patientMobile,
        patient_age: newPrescription.patientAge,
        patient_gender: newPrescription.patientGender,
        doctor_id: newPrescription.doctorId,
        doctor_name: newPrescription.doctorName,
        doctor_specialization: newPrescription.doctorSpecialization,
        doctor_qualification: newPrescription.doctorQualification,
        department: newPrescription.department,
        date: newPrescription.date,
        time: newPrescription.time,
        diagnosis: newPrescription.diagnosis,
        symptoms: newPrescription.symptoms,
        medicines: newPrescription.medicines,
        status: newPrescription.status,
        expiry_date: newPrescription.expiryDate,
        advice_notes: newPrescription.adviceNotes || newPrescription.advice,
        diet_advice: newPrescription.dietAdvice,
        next_follow_up: newPrescription.nextFollowUp
      });
      if (saved) {
        setPrescriptions(prev => prev.map(p => p.prescriptionNumber === prescriptionNumber ? { ...p, ...saved } : p));
      }
    } catch (err) {
      console.warn('Backend addPrescription notice:', err);
    }

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
    setPrescriptions(prev => prev.map(p => (p.id === id || p.prescriptionNumber === id ? { ...p, ...updates } : p)));
  };

  const addLabReport = async (reportData: Omit<LabReport, 'id' | 'reportNumber'>): Promise<LabReport> => {
    const reportNumber = `LAB-KLP-2026-${Math.floor(4000 + Math.random() * 1000)}`;
    const newReport: LabReport = {
      ...reportData,
      id: `lab-${Date.now()}`,
      reportNumber
    };

    setLabReports(prev => [newReport, ...prev]);

    try {
      await api.addLabReport({
        report_number: reportNumber,
        patient_id: newReport.patientId,
        patient_name: newReport.patientName,
        doctor_id: newReport.doctorId,
        doctor_name: newReport.doctorName,
        test_name: newReport.testName,
        test_date: newReport.testDate,
        results: newReport.results,
        status: newReport.reportStatus,
        lab_department: newReport.labDepartment,
        technician_name: newReport.technicianName,
        normal_range: newReport.normalRange,
        units: newReport.units,
        findings: newReport.findings,
        is_abnormal: newReport.isAbnormal,
        file_url: '#'
      });
    } catch (err) {
      console.warn('Backend addLabReport notice:', err);
    }

    const labNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      userId: newReport.patientId,
      type: 'lab_report',
      title: 'Laboratory Report Available',
      message: `Your test report for "${newReport.testName}" is now ${newReport.reportStatus} for review.`,
      date: new Date().toISOString(),
      isRead: false,
      link: 'history'
    };
    setNotifications(prev => [labNotif, ...prev]);

    return newReport;
  };

  const addStaff = async (memberData: Omit<StaffMember, 'id' | 'createdAt'>): Promise<StaffMember> => {
    const newStaff: StaffMember = {
      ...memberData,
      id: `stf-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setStaff(prev => [newStaff, ...prev]);

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      role: (memberData.type as UserRole) || 'technician',
      fullName: memberData.name || memberData.fullName || 'Staff Member',
      mobile: memberData.mobile,
      email: memberData.email || '',
      staffId: memberData.staffId,
      doctorId: memberData.type === 'doctor' ? memberData.staffId : undefined,
      patientId: memberData.type === 'patient' ? memberData.staffId : undefined,
      department: memberData.department,
      specialization: memberData.roleTitle || memberData.specialization,
      qualification: memberData.qualification,
      experience: memberData.experience,
      consultationFee: typeof memberData.consultationFee === 'number' ? memberData.consultationFee : 700,
      availableDays: memberData.availableDays,
      workingHours: memberData.workingHours,
      shiftTiming: memberData.shiftTiming,
      dobOrAge: memberData.dobOrAge,
      gender: memberData.gender as any,
      bloodGroup: memberData.bloodGroup,
      address: memberData.address,
      emergencyContact: memberData.emergencyContact,
      profilePhoto: memberData.profilePhoto,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setUsers(prev => [newUser, ...prev]);

    try {
      await api.addStaff({
        staff_type: memberData.type || memberData.staffType || 'doctor',
        staff_id: memberData.staffId,
        full_name: memberData.name || memberData.fullName,
        mobile: memberData.mobile,
        email: memberData.email,
        specialization: memberData.roleTitle || memberData.specialization,
        department: memberData.department,
        qualification: memberData.qualification,
        experience: memberData.experience,
        consultation_fee: memberData.consultationFee,
        availability: memberData.availableDays,
        shift_timing: memberData.shiftTiming,
        working_hours: memberData.workingHours,
        profile_photo: memberData.profilePhoto
      });
    } catch (err) {
      console.warn('Backend addStaff notice:', err);
    }

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
    if (updates.availableDays !== undefined) payload.availability = updates.availableDays;
    if (updates.workingHours !== undefined) payload.working_hours = updates.workingHours;
    if (updates.shiftTiming !== undefined) payload.shift_timing = updates.shiftTiming;
    if (updates.profilePhoto !== undefined) payload.profile_photo = updates.profilePhoto;
    if (updates.isActive !== undefined) payload.is_active = updates.isActive;

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
            availableDays: updates.availableDays || u.availableDays,
            workingHours: updates.workingHours || u.workingHours,
            shiftTiming: updates.shiftTiming || u.shiftTiming,
            profilePhoto: updates.profilePhoto !== undefined ? updates.profilePhoto : u.profilePhoto,
            avatar: updates.profilePhoto !== undefined ? updates.profilePhoto : u.avatar,
            staffId: target?.staffId || u.staffId || staffIdToUpdate,
            doctorId: target?.staffId || u.doctorId || staffIdToUpdate
          };
        }
        return u;
      });
      return updated;
    });

    setCurrentUser(prev => {
      if (!prev) return prev;
      const isTarget = prev.id === idOrStaffId ||
                       prev.staffId === staffIdToUpdate ||
                       prev.doctorId === staffIdToUpdate ||
                       prev.id === staffIdToUpdate ||
                       prev.staffId === idOrStaffId ||
                       (targetName && (prev.fullName === targetName)) ||
                       (target?.mobile && prev.mobile === target.mobile);
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
          availableDays: updates.availableDays || prev.availableDays,
          workingHours: updates.workingHours || prev.workingHours,
          shiftTiming: updates.shiftTiming || prev.shiftTiming,
          profilePhoto: updates.profilePhoto !== undefined ? updates.profilePhoto : prev.profilePhoto,
          avatar: updates.profilePhoto !== undefined ? updates.profilePhoto : prev.avatar,
          staffId: target?.staffId || prev.staffId || staffIdToUpdate,
          doctorId: target?.staffId || prev.doctorId || staffIdToUpdate
        };
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

    const deleted = getDeletedStaffKeys();
    if (idOrStaffId) deleted.add(idOrStaffId);
    if (staffIdToDelete) deleted.add(staffIdToDelete);
    if (targetName) deleted.add(targetName);
    if (targetMobile) deleted.add(targetMobile);
    try {
      localStorage.setItem(STORAGE_KEYS.DELETED_STAFF, JSON.stringify(Array.from(deleted)));
    } catch {}

    try {
      await api.deleteStaff(staffIdToDelete);
      if (idOrStaffId !== staffIdToDelete) {
        await api.deleteStaff(idOrStaffId);
      }
    } catch (err) {
      console.warn('api.deleteStaff error:', err);
    }

    setStaff(prev => {
      const updated = prev.filter(s => 
        s.id !== idOrStaffId && 
        s.staffId !== idOrStaffId && 
        s.staffId !== staffIdToDelete &&
        s.id !== staffIdToDelete &&
        (!targetMobile || (s.mobile || '').replace(/[^0-9]/g, '') !== targetMobile) &&
        (!targetName || (s.fullName || s.name || '').trim().toLowerCase() !== targetName)
      );
      return updated;
    });

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
      return updated;
    });

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

    setUsers(prev => [newPatient, ...prev.filter(u => (u.mobile || '').replace(/[^0-9]/g, '') !== cleanMobile)]);

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

    try {
      await api.registerPatientReceptionist({
        full_name: newPatient.fullName,
        mobile_number: newPatient.mobile,
        email: newPatient.email,
        dob: newPatient.dobOrAge,
        gender: newPatient.gender,
        blood_group: newPatient.bloodGroup,
        address: newPatient.address,
        emergency_contact: newPatient.emergencyContact,
        patient_id: patientId,
        department: patientFormData.department,
        doctor: patientFormData.doctor
      });
    } catch (err) {
      console.warn('Backend registerPatientReceptionist notice:', err);
    }

    if (patientFormData.doctor && patientFormData.department) {
      const doc = users.find(u => u.fullName === patientFormData.doctor || u.doctorId === patientFormData.doctorId);
      await bookAppointment({
        patientId: newPatient.id,
        patientName: newPatient.fullName,
        patientMobile: newPatient.mobile,
        patientGender: newPatient.gender,
        patientAge: newPatient.dobOrAge,
        doctorId: doc ? doc.id : 'DOC-KLP-101',
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
      return updated;
    });

    try {
      api.updateHospital(updates);
    } catch (err) {
      console.warn('api.updateHospital error:', err);
    }
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
        markAllNotificationsAsRead,
        refreshBackendData
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
