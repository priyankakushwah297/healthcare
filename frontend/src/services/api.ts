const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api';

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

  // Hospital & Admin
  async fetchAdminOverview() {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/overview/`);
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  // Staff Management
  async fetchStaff() {
    try {
      const res = await fetch(`${API_BASE_URL}/staff/`);
      return await res.json();
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
  async fetchAppointments(patientId?: string, doctorId?: string) {
    try {
      let url = `${API_BASE_URL}/appointments/`;
      const params = new URLSearchParams();
      if (patientId) params.append('patient_id', patientId);
      if (doctorId) params.append('doctor_id', doctorId);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async bookAppointment(data: any) {
    try {
      const res = await fetch(`${API_BASE_URL}/appointments/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async updateAppointmentStatus(id: string | number, status: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/appointments/${id}/status/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      return await res.json();
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
  async fetchPrescriptions(patientId?: string, doctorId?: string) {
    try {
      let url = `${API_BASE_URL}/prescriptions/`;
      const params = new URLSearchParams();
      if (patientId) params.append('patient_id', patientId);
      if (doctorId) params.append('doctor_id', doctorId);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  async fetchLabReports(patientId?: string) {
    try {
      let url = `${API_BASE_URL}/lab-reports/`;
      if (patientId) url += `?patient_id=${patientId}`;
      const res = await fetch(url);
      return await res.json();
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
