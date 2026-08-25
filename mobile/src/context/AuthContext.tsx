import React, { createContext, useContext, useState } from 'react';
import { User, UserRole, Appointment, Prescription, LabReport, HospitalStats } from '../types';
import { sampleUsers, initialAppointments, initialPrescriptions, initialLabReports, initialHospitalStats } from '../api/mockData';

interface AuthContextType {
  currentUser: User | null;
  currentRole: UserRole;
  setRole: (role: UserRole) => void;
  login: (role?: UserRole) => void;
  logout: () => void;
  appointments: Appointment[];
  addAppointment: (apt: Omit<Appointment, 'id' | 'bookingRef' | 'status'>) => void;
  prescriptions: Prescription[];
  addPrescription: (rx: Omit<Prescription, 'id' | 'prescriptionNumber'>) => void;
  labReports: LabReport[];
  addLabReport: (report: Omit<LabReport, 'id' | 'reportNumber'>) => void;
  hospitalStats: HospitalStats;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('patient');
  const [currentUser, setCurrentUser] = useState<User | null>(sampleUsers.patient);
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(initialPrescriptions);
  const [labReports, setLabReports] = useState<LabReport[]>(initialLabReports);
  const [hospitalStats, setHospitalStats] = useState<HospitalStats>(initialHospitalStats);

  const setRole = (role: UserRole) => {
    setCurrentRole(role);
    setCurrentUser(sampleUsers[role] || null);
  };

  const login = (role: UserRole = 'patient') => {
    setRole(role);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addAppointment = (aptData: Omit<Appointment, 'id' | 'bookingRef' | 'status'>) => {
    const randomRef = `MED-APT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newApt: Appointment = {
      ...aptData,
      id: `APT-${Date.now()}`,
      bookingRef: randomRef,
      status: 'scheduled'
    };
    setAppointments(prev => [newApt, ...prev]);
  };

  const addPrescription = (rxData: Omit<Prescription, 'id' | 'prescriptionNumber'>) => {
    const rxRef = `RX-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRx: Prescription = {
      ...rxData,
      id: `RX-${Date.now()}`,
      prescriptionNumber: rxRef
    };
    setPrescriptions(prev => [newRx, ...prev]);
  };

  const addLabReport = (repData: Omit<LabReport, 'id' | 'reportNumber'>) => {
    const repRef = `LAB-RPT-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRep: LabReport = {
      ...repData,
      id: `LAB-${Date.now()}`,
      reportNumber: repRef
    };
    setLabReports(prev => [newRep, ...prev]);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        setRole,
        login,
        logout,
        appointments,
        addAppointment,
        prescriptions,
        addPrescription,
        labReports,
        addLabReport,
        hospitalStats
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
