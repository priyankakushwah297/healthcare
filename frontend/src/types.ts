export type UserRole =
  | 'admin'
  | 'technician'
  | 'doctor'
  | 'receptionist'
  | 'patient';

export type VisitMode = 'Clinic' | 'Telephone' | 'Homecare';

export type AppointmentStatus =
  | 'today'
  | 'upcoming'
  | 'completed'
  | 'cancelled'
  | 'pending';

export type PaymentStatus = 'paid' | 'pending' | 'refunded';

export interface UserProfile {
  id: string;
  role: UserRole;
  fullName: string;
  mobile: string;
  email: string;
  dobOrAge?: string;
  gender?: 'Male' | 'Female' | 'Other';
  bloodGroup?: string;
  address?: string;
  emergencyContact?: string;
  profilePhoto?: string;
  roleTitle?: string;
  createdAt: string;
  
  // Doctor & Receptionist Roster Fields
  doctorId?: string;
  staffId?: string;
  specialization?: string;
  department?: string;
  qualification?: string;
  experience?: string;
  consultationFee?: number;
  availableDays?: string[] | string;
  shiftTiming?: string;
  workingHours?: string;
  isActive?: boolean;
  clinicName?: string;
  clinicAddress?: string;

  // Patient Health & Treatment Tracker Fields
  patientId?: string;
  currentTreatmentDepartment?: string;
  treatmentType?: string;
  currentDiagnosis?: string;
  treatmentStatus?: 'Active' | 'Under Observation' | 'Completed';
  treatmentStartDate?: string;
  overallHealthCondition?: string;
  previousDiseases?: string[];
  pastSurgeries?: string[];
  chronicConditions?: string[];
  allergies?: string[];
}

export type User = UserProfile;

export interface Appointment {
  id: string;
  bookingRef: string;
  patientId: string;
  patientName: string;
  patientMobile: string;
  patientGender?: string;
  patientAge?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization?: string;
  department: string;
  date: string;
  timeSlot: string;
  visitMode: VisitMode;
  symptoms: string;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  amount: number;
  consultationFee?: number;
  paymentMethod?: string;
  createdAt: string;
  notes?: string;
  homeLocation?: string;
}

export interface MedicineItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  status: 'active' | 'completed';
}

export interface Prescription {
  id: string;
  prescriptionNumber: string;
  appointmentId?: string;
  patientId: string;
  patientName: string;
  patientMobile?: string;
  patientAge?: string;
  patientGender?: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  doctorQualification?: string;
  department?: string;
  date: string;
  time: string;
  diagnosis: string;
  symptoms?: string;
  medicines: MedicineItem[];
  status: 'active' | 'completed';
  expiryDate: string;
  adviceNotes?: string;
  advice?: string;
  dietAdvice?: string;
  nextFollowUp?: string;
}

export interface LabReport {
  id: string;
  reportNumber: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  testName: string;
  testDate: string;
  results: string;
  reportStatus: 'Ready' | 'In Progress' | 'Reviewed' | 'Completed';
  labDepartment: string;
  technicianName?: string;
  normalRange?: string;
  units?: string;
  findings?: string;
  isAbnormal?: boolean;
}

export interface MedicalHistoryRecord {
  id: string;
  patientId: string;
  condition: string;
  diagnosedDate: string;
  status: 'Ongoing' | 'Managed' | 'Resolved';
  treatingDoctor: string;
  treatmentSummary: string;
  hospitalName?: string;
  allergies?: string[];
}

export interface AppNotification {
  id: string;
  userId: string;
  targetRole?: UserRole | 'all';
  type: 'appointment' | 'medicine' | 'lab_report' | 'payment' | 'system';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  link?: string;
}

export interface Hospital {
  id: string;
  name: string;
  code: string;
  logo?: string;
  tagline?: string;
  adminName: string;
  adminEmail: string;
  adminMobile: string;
  address: string;
  phone: string;
  emergencyPhone: string;
  totalBeds: number;
  occupiedBeds: number;
  icuBeds: number;
  ambulances: number;
  departments: string[];
  status: 'Active' | 'Under Maintenance';
  establishedYear: string;
}

export interface DepartmentInfo {
  id: string;
  name: string;
  headDoctor: string;
  doctorCount: number;
  description: string;
  iconName: string;
}

export interface PatientVisitAnalytics {
  totalPatientsToday: number;
  totalVisitedToday?: number;
  newPatients?: number;
  returningPatients?: number;
  dailyVisits: { date: string; day: string; visits: number; newPatients: number; returningPatients: number }[];
  monthlyVisits: { month: string; visits: number }[];
  newPatientsCount: number;
  returningPatientsCount: number;
  departmentWiseVisits: { department: string; count: number }[];
  doctorWiseVisits: { doctor: string; count: number }[];
}

export interface StaffMember {
  id: string;
  name?: string;
  fullName?: string;
  staffId: string;
  mobile: string;
  email?: string;
  type?: 'doctor' | 'receptionist' | 'technician' | 'admin' | 'patient';
  staffType?: 'doctor' | 'receptionist' | 'technician' | 'admin' | 'patient';
  department?: string;
  roleTitle?: string;
  specialization?: string;
  qualification?: string;
  experience?: string;
  consultationFee?: number | string;
  availableDays?: string[] | string;
  shiftTiming?: string;
  workingHours?: string;
  isActive?: boolean;
  dobOrAge?: string;
  dob?: string;
  gender?: string;
  bloodGroup?: string;
  address?: string;
  emergencyContact?: string;
  profilePhoto?: string;
  createdAt?: string;
}

