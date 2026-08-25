export type UserRole = 'patient' | 'doctor' | 'receptionist' | 'technician' | 'hospital_admin';

export interface User {
  id: string;
  name: string;
  mobile: string;
  email?: string;
  role: UserRole;
  gender?: string;
  age?: string;
  specialization?: string;
  department?: string;
  bloodGroup?: string;
}

export interface Appointment {
  id: string;
  bookingRef: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  department: string;
  date: string;
  timeSlot: string;
  visitMode: 'Clinic' | 'Telephone' | 'Homecare';
  symptoms: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  consultationFee: string;
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface Prescription {
  id: string;
  prescriptionNumber: string;
  patientName: string;
  doctorName: string;
  doctorSpecialization: string;
  date: string;
  diagnosis: string;
  symptoms: string;
  medicines: Medicine[];
  advice: string;
  nextFollowUp: string;
}

export interface LabReport {
  id: string;
  reportNumber: string;
  patientName: string;
  doctorName: string;
  testName: string;
  testDate: string;
  results: string;
  status: 'Ready' | 'In-Process' | 'Pending';
  labDepartment: string;
  normalRange: string;
  units: string;
  findings: string;
  isAbnormal: boolean;
}

export interface HospitalStats {
  name: string;
  code: string;
  totalBeds: number;
  occupiedBeds: number;
  icuBeds: number;
  ambulances: number;
  totalDoctors: number;
  satisfactionRate: string;
  emergencyPhone: string;
}
