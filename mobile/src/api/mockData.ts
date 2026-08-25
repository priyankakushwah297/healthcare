import { Appointment, Prescription, LabReport, HospitalStats, User } from '../types';

export const initialHospitalStats: HospitalStats = {
  name: "Healthcare Medical Center",
  code: "HOSP-001",
  totalBeds: 350,
  occupiedBeds: 268,
  icuBeds: 45,
  ambulances: 12,
  totalDoctors: 45,
  satisfactionRate: "99.4%",
  emergencyPhone: "+91 98765 43211 / 102"
};

export const sampleUsers: Record<string, User> = {
  patient: {
    id: "PAT-101",
    name: "Rahul Sharma",
    mobile: "+91 98765 43210",
    role: "patient",
    gender: "Male",
    age: "32",
    bloodGroup: "O+"
  },
  doctor: {
    id: "DOC-202",
    name: "Dr. Ananya Roy, MD",
    mobile: "+91 98765 11223",
    role: "doctor",
    specialization: "Senior Cardiologist",
    department: "Cardiology"
  },
  receptionist: {
    id: "REC-303",
    name: "Priya Kushwah",
    mobile: "+91 98765 33445",
    role: "receptionist",
    department: "Front Desk & Admissions"
  },
  technician: {
    id: "TECH-404",
    name: "Amit Verma",
    mobile: "+91 98765 55667",
    role: "technician",
    department: "Pathology & Radiology Labs"
  },
  hospital_admin: {
    id: "ADM-505",
    name: "Hospital Super Admin",
    mobile: "+91 98765 99887",
    role: "hospital_admin",
    department: "Clinical Operations"
  }
};

export const initialAppointments: Appointment[] = [
  {
    id: "APT-1",
    bookingRef: "MED-APT-8821",
    patientName: "Rahul Sharma",
    patientPhone: "+91 98765 43210",
    doctorName: "Dr. Ananya Roy, MD",
    department: "Cardiology",
    date: "2026-08-23",
    timeSlot: "10:30 AM",
    visitMode: "Clinic",
    symptoms: "Mild chest tightness and routine ECG review",
    status: "scheduled",
    consultationFee: "₹700"
  },
  {
    id: "APT-2",
    bookingRef: "MED-APT-8822",
    patientName: "Pooja Verma",
    patientPhone: "+91 91234 56780",
    doctorName: "Dr. Vikram Seth",
    department: "Neurology",
    date: "2026-08-23",
    timeSlot: "11:15 AM",
    visitMode: "Telephone",
    symptoms: "Frequent migraine headaches and visual aura",
    status: "scheduled",
    consultationFee: "₹800"
  },
  {
    id: "APT-3",
    bookingRef: "MED-APT-8823",
    patientName: "Sanjay Gupta",
    patientPhone: "+91 99887 76655",
    doctorName: "Dr. Rajesh Kulkarni",
    department: "Orthopedics",
    date: "2026-08-24",
    timeSlot: "02:00 PM",
    visitMode: "Homecare",
    symptoms: "Post-op knee ligament rehabilitation check",
    status: "scheduled",
    consultationFee: "₹1,200"
  }
];

export const initialPrescriptions: Prescription[] = [
  {
    id: "RX-1",
    prescriptionNumber: "RX-2026-0912",
    patientName: "Rahul Sharma",
    doctorName: "Dr. Ananya Roy, MD",
    doctorSpecialization: "Cardiology",
    date: "2026-08-20",
    diagnosis: "Primary Stage 1 Hypertension with mild tachycardia",
    symptoms: "Elevated BP (145/92 mmHg), occasional palpitations",
    medicines: [
      {
        id: "M1",
        name: "Telmisartan 40mg",
        dosage: "1 Tablet",
        frequency: "Once Daily (Morning)",
        duration: "30 Days",
        instructions: "After breakfast with water"
      },
      {
        id: "M2",
        name: "Metoprolol Succinate 25mg",
        dosage: "1 Tablet",
        frequency: "Once Daily (Evening)",
        duration: "15 Days",
        instructions: "Before dinner"
      }
    ],
    advice: "Low sodium diet, brisk walking for 30 minutes daily. Avoid stress.",
    nextFollowUp: "2026-09-20 (After 4 Weeks)"
  }
];

export const initialLabReports: LabReport[] = [
  {
    id: "LAB-1",
    reportNumber: "LAB-RPT-7701",
    patientName: "Rahul Sharma",
    doctorName: "Dr. Ananya Roy, MD",
    testName: "Complete Blood Count (CBC) & Lipid Profile",
    testDate: "2026-08-21",
    results: "Normal Hemoglobin (14.8 g/dL), Total Cholesterol 185 mg/dL",
    status: "Ready",
    labDepartment: "Pathology",
    normalRange: "Cholesterol: < 200 mg/dL",
    units: "mg/dL",
    findings: "All hematological indices within normal clinical ranges. Triglycerides slightly borderline.",
    isAbnormal: false
  },
  {
    id: "LAB-2",
    reportNumber: "LAB-RPT-7702",
    patientName: "Pooja Verma",
    doctorName: "Dr. Vikram Seth",
    testName: "Brain MRI with Angiography",
    testDate: "2026-08-20",
    results: "No intracranial hemorrhage or acute infarct identified.",
    status: "Ready",
    labDepartment: "Radiology",
    normalRange: "Unremarkable study",
    units: "Visual",
    findings: "Normal brain parenchyma with preserved vascular flow.",
    isAbnormal: false
  }
];
