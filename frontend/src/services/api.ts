import { Appointment, Prescription, LabReport, StaffMember, UserProfile } from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api';

// Helper to normalize and map Django Appointment objects to frontend Appointment interface
export const mapBackendAppointment = (a: any): Appointment => ({
  id: a.booking_ref || (a.id ? `apt-${a.id}` : `apt-${Date.now()}`),
  bookingRef: a.booking_ref || `KLP-APT-${a.id || Math.floor(1000 + Math.random() * 9000)}`,
  patientId: a.patient_id || a.patientId || 'PAT-101',
  patientName: a.patient_name || a.patientName || 'Patient',
  patientMobile: a.patient_phone || a.patientMobile || '',
  patientGender: a.patient_gender || a.patientGender || undefined,
  patientAge: a.patient_age || a.patientAge || undefined,
  doctorId: a.doctor_id || a.doctorId || 'DOC-KLP-101',
  doctorName: a.doctor_name || a.doctorName || 'Dr. Arvind Sharma',
  doctorSpecialization: a.doctor_specialization || a.doctorSpecialization || undefined,
  department: a.department || 'General Medicine',
  date: a.date || new Date().toISOString().split('T')[0],
  timeSlot: a.time_slot || a.timeSlot || '10:00 AM',
  visitMode: (a.visit_mode || a.visitMode || 'Clinic') as any,
  symptoms: a.symptoms || '',
  status: (a.status || 'scheduled') as any,
  paymentStatus: (a.payment_status || a.paymentStatus || 'paid') as any,
  amount: typeof a.amount === 'number' ? a.amount : (parseInt(String(a.amount || '700').replace(/[^0-9]/g, '')) || 700),
  consultationFee: typeof a.consultation_fee === 'number' ? a.consultation_fee : (parseInt(String(a.consultation_fee || a.amount || '700').replace(/[^0-9]/g, '')) || 700),
  homeLocation: a.home_location || a.homeLocation || undefined,
  notes: a.notes || undefined,
  createdAt: a.created_at ? a.created_at.split('T')[0] : new Date().toISOString().split('T')[0]
});

// Helper to normalize and map Django Prescription objects to frontend Prescription interface
export const mapBackendPrescription = (p: any): Prescription => ({
  id: p.prescription_number || (p.id ? `rx-${p.id}` : `rx-${Date.now()}`),
  prescriptionNumber: p.prescription_number || `RX-KLP-2026-${Math.floor(100 + Math.random() * 900)}`,
  appointmentId: p.appointment_id || p.appointmentId || undefined,
  patientId: p.patient_id || p.patientId || '',
  patientName: p.patient_name || p.patientName || '',
  patientMobile: p.patient_mobile || p.patientMobile || '',
  patientAge: p.patient_age || p.patientAge || '24 Years',
  patientGender: p.patient_gender || p.patientGender || 'Female',
  doctorId: p.doctor_id || p.doctorId || '',
  doctorName: p.doctor_name || p.doctorName || '',
  doctorSpecialization: p.doctor_specialization || p.doctorSpecialization || 'Specialist Physician',
  doctorQualification: p.doctor_qualification || p.doctorQualification || 'MBBS, MD',
  department: p.department || 'General Medicine',
  date: p.date || new Date().toISOString().split('T')[0],
  time: p.time || '10:30 AM',
  diagnosis: p.diagnosis || 'Clinical OPD Consultation',
  symptoms: p.symptoms || '',
  medicines: Array.isArray(p.medicines) ? p.medicines : [],
  status: (p.status || 'active') as any,
  expiryDate: p.expiry_date || p.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  adviceNotes: p.advice_notes || p.advice || p.adviceNotes || '',
  advice: p.advice || p.advice_notes || p.adviceNotes || '',
  dietAdvice: p.diet_advice || p.dietAdvice || '',
  nextFollowUp: p.next_follow_up || p.nextFollowUp || 'After 7 Days'
});

// Helper to normalize and map Django LabReport objects
export const mapBackendLabReport = (l: any): LabReport => ({
  id: l.report_number || (l.id ? `lab-${l.id}` : `lab-${Date.now()}`),
  reportNumber: l.report_number || `LAB-KLP-2026-${Math.floor(4000 + Math.random() * 1000)}`,
  patientId: l.patient_id || l.patientId || '',
  patientName: l.patient_name || l.patientName || '',
  doctorId: l.doctor_id || l.doctorId || '',
  doctorName: l.doctor_name || l.doctorName || '',
  testName: l.test_name || l.testName || '',
  testDate: l.test_date || l.testDate || new Date().toISOString().split('T')[0],
  results: l.results || 'Normal',
  reportStatus: (l.status || l.reportStatus || 'Ready') as any,
  labDepartment: l.lab_department || l.labDepartment || 'Pathology',
  technicianName: l.technician_name || l.technicianName || 'Lab Technician',
  normalRange: l.normal_range || l.normalRange || 'Standard Range',
  units: l.units || '',
  findings: l.findings || '',
  isAbnormal: Boolean(l.is_abnormal || l.isAbnormal)
});

export const api = {
  // Auth
  async checkPhone(mobile_number: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/check-phone/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile_number }),
      });
      return await res.json();
    } catch (e) {
      console.warn('Backend offline, using fallback:', e);
      return null;
    }
  },

  async sendOtp(mobile_number: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/send-otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile_number }),
      });
      return await res.json();
    } catch (e) {
      console.warn('Backend offline, using fallback:', e);
      return { success: true, otp: '123456' };
    }
  },

  async verifyOtp(mobile_number: string, otp: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile_number, otp }),
      });
      return await res.json();
    } catch (e) {
      console.warn('Backend offline, using fallback:', e);
      return { success: true };
    }
  },

  async registerUser(userData: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return await res.json();
    } catch (e) {
      console.warn('Backend offline, using fallback:', e);
      return { success: true, user: userData };
    }
  },

  async fetchUsers(role?: string): Promise<UserProfile[] | null> {
    try {
      let url = `${API_BASE_URL}/users/`;
      if (role) url += `?role=${role}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        return data.map((u: any) => ({
          id: u.user_id || `usr-${u.id}`,
          role: u.role,
          fullName: u.full_name,
          mobile: u.mobile_number,
          email: u.email,
          dobOrAge: u.age || u.dob || '30 Years',
          gender: u.gender,
          bloodGroup: u.blood_group,
          address: u.address,
          emergencyContact: u.emergency_contact,
          patientId: u.patient_id || (u.role === 'patient' ? u.user_id : undefined),
          doctorId: u.doctor_id || (u.role === 'doctor' ? u.user_id : undefined),
          staffId: u.staff_id || u.user_id,
          specialization: u.specialization,
          department: u.department,
          qualification: u.qualification,
          experience: u.experience,
          consultationFee: parseInt(String(u.consultation_fee || '700').replace(/[^0-9]/g, '')) || 700,
          workingHours: u.working_hours,
          shiftTiming: u.shift_timing,
          profilePhoto: u.avatar,
          avatar: u.avatar,
          createdAt: u.created_at ? u.created_at.split('T')[0] : '2026-08-20'
        }));
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  // Hospital & Admin
  async fetchAdminOverview() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/overview/`);
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async fetchHospital() {
    try {
      const res = await fetch(`${API_BASE_URL}/hospitals/`);
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async updateHospital(data: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/hospitals/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  // Staff Management
  async fetchStaff(): Promise<StaffMember[] | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/staff/`);
      if (res.ok) {
        const backendStaff = await res.json();
        return backendStaff.map((s: any) => ({
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
          consultationFee: s.consultation_fee ? (parseInt(String(s.consultation_fee).replace(/[^0-9]/g, '')) || 700) : 700,
          availability: s.availability,
          shiftTiming: s.shift_timing || '09:00 AM - 05:00 PM',
          workingHours: s.working_hours || '8 Hours / Day',
          isActive: s.is_active !== false,
          profilePhoto: s.profile_photo,
          dobOrAge: s.dob || s.age,
          gender: s.gender,
          bloodGroup: s.blood_group,
          address: s.address,
          emergencyContact: s.emergency_contact,
          createdAt: s.created_at ? s.created_at.split('T')[0] : '2026-08-20'
        }));
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  async addStaff(staffData: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/staff/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffData),
      });
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async updateStaff(staffId: string, staffData: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/staff/${staffId}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffData),
      });
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async deleteStaff(staffId: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/staff/${staffId}/`, {
        method: 'DELETE',
      });
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  // Appointments
  async fetchAppointments(patientId?: string, doctorId?: string): Promise<Appointment[] | null> {
    try {
      let url = `${API_BASE_URL}/appointments/`;
      const params = new URLSearchParams();
      if (patientId) params.append('patient_id', patientId);
      if (doctorId) params.append('doctor_id', doctorId);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (res.ok) {
        const raw = await res.json();
        return raw.map(mapBackendAppointment);
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  async bookAppointment(data: any): Promise<Appointment | null> {
    try {
      const payload = {
        booking_ref: data.bookingRef || data.booking_ref,
        patient_id: data.patientId || data.patient_id,
        patient_name: data.patientName || data.patient_name,
        patient_phone: data.patientMobile || data.patient_phone,
        patient_gender: data.patientGender || data.patient_gender || '',
        patient_age: data.patientAge || data.patient_age || '',
        doctor_id: data.doctorId || data.doctor_id,
        doctor_name: data.doctorName || data.doctor_name,
        doctor_specialization: data.doctorSpecialization || data.doctor_specialization || '',
        department: data.department,
        date: data.date,
        time_slot: data.timeSlot || data.time_slot,
        visit_mode: data.visitMode || data.visit_mode || 'Clinic',
        symptoms: data.symptoms || '',
        status: data.status || 'scheduled',
        payment_status: data.paymentStatus || data.payment_status || 'paid',
        amount: data.amount || '₹500',
        consultation_fee: data.consultationFee || data.consultation_fee || '500',
        home_location: data.homeLocation || data.home_location || '',
        notes: data.notes || ''
      };

      const res = await fetch(`${API_BASE_URL}/appointments/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const saved = await res.json();
        return mapBackendAppointment(saved);
      }
      return null;
    } catch (e) {
      console.warn('api.bookAppointment failed, fallback:', e);
      return null;
    }
  },

  async updateAppointmentStatus(idOrRef: string | number, status: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/appointments/${idOrRef}/status/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const data = await res.json();
        return mapBackendAppointment(data);
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  async fetchDoctorAnalytics(doctorId: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/doctors/${doctorId}/analytics/`);
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  // Prescriptions & Lab Reports
  async fetchPrescriptions(patientId?: string, doctorId?: string): Promise<Prescription[] | null> {
    try {
      let url = `${API_BASE_URL}/prescriptions/`;
      const params = new URLSearchParams();
      if (patientId) params.append('patient_id', patientId);
      if (doctorId) params.append('doctor_id', doctorId);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (res.ok) {
        const raw = await res.json();
        return raw.map(mapBackendPrescription);
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  async addPrescription(data: any): Promise<Prescription | null> {
    try {
      const payload = {
        prescription_number: data.prescriptionNumber || data.prescription_number,
        appointment_id: data.appointmentId || data.appointment_id || '',
        patient_id: data.patientId || data.patient_id,
        patient_name: data.patientName || data.patient_name,
        patient_mobile: data.patientMobile || data.patient_mobile || '',
        patient_age: data.patientAge || data.patient_age || '',
        patient_gender: data.patientGender || data.patient_gender || '',
        doctor_id: data.doctorId || data.doctor_id,
        doctor_name: data.doctorName || data.doctor_name,
        doctor_specialization: data.doctorSpecialization || data.doctor_specialization || '',
        doctor_qualification: data.doctorQualification || data.doctor_qualification || '',
        department: data.department || '',
        date: data.date,
        time: data.time || '',
        diagnosis: data.diagnosis || '',
        symptoms: data.symptoms || '',
        medicines: data.medicines || [],
        status: data.status || 'active',
        expiry_date: data.expiryDate || data.expiry_date || '',
        advice_notes: data.adviceNotes || data.advice || data.advice_notes || '',
        diet_advice: data.dietAdvice || data.diet_advice || '',
        next_follow_up: data.nextFollowUp || data.next_follow_up || ''
      };

      const res = await fetch(`${API_BASE_URL}/prescriptions/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const saved = await res.json();
        return mapBackendPrescription(saved);
      }
      return null;
    } catch (e) {
      console.warn('api.addPrescription error:', e);
      return null;
    }
  },

  async fetchLabReports(patientId?: string): Promise<LabReport[] | null> {
    try {
      let url = `${API_BASE_URL}/lab-reports/`;
      if (patientId) url += `?patient_id=${patientId}`;
      const res = await fetch(url);
      if (res.ok) {
        const raw = await res.json();
        return raw.map(mapBackendLabReport);
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  async addLabReport(data: any): Promise<LabReport | null> {
    try {
      const payload = {
        report_number: data.reportNumber || data.report_number,
        patient_id: data.patientId || data.patient_id,
        patient_name: data.patientName || data.patient_name,
        doctor_id: data.doctorId || data.doctor_id || '',
        doctor_name: data.doctorName || data.doctor_name || '',
        test_name: data.testName || data.test_name,
        test_date: data.testDate || data.test_date,
        results: data.results || 'Normal',
        status: data.reportStatus || data.status || 'Ready',
        lab_department: data.labDepartment || data.lab_department || 'Pathology',
        technician_name: data.technicianName || data.technician_name || '',
        normal_range: data.normalRange || data.normal_range || '',
        units: data.units || '',
        findings: data.findings || '',
        is_abnormal: Boolean(data.isAbnormal || data.is_abnormal),
        file_url: data.fileUrl || data.file_url || '#'
      };

      const res = await fetch(`${API_BASE_URL}/lab-reports/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const saved = await res.json();
        return mapBackendLabReport(saved);
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  // Receptionist
  async fetchReceptionistAnalytics() {
    try {
      const res = await fetch(`${API_BASE_URL}/receptionist/analytics/`);
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async registerPatientReceptionist(data: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/receptionist/register-patient/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  // Cloudinary Image Upload
  async uploadImage(imageFileOrBase64: File | string) {
    try {
      if (typeof imageFileOrBase64 === 'string') {
        const res = await fetch(`${API_BASE_URL}/upload-image/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageFileOrBase64 }),
        });
        return await res.json();
      } else {
        const formData = new FormData();
        formData.append('image', imageFileOrBase64);
        const res = await fetch(`${API_BASE_URL}/upload-image/`, {
          method: 'POST',
          body: formData,
        });
        return await res.json();
      }
    } catch (e) {
      console.warn('Image upload failed, fallback:', e);
      return null;
    }
  }
};
