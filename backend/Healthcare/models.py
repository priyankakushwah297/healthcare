from django.db import models
from django.utils import timezone

ROLE_CHOICES = [
    ('patient', 'Patient'),
    ('doctor', 'Doctor'),
    ('receptionist', 'Receptionist'),
    ('hospital_admin', 'Hospital Admin'),
    ('super_admin', 'Super Admin'),
    ('technician', 'Staff Technician'),
    ('pharmacist', 'Pharmacy Staff'),
    ('lab_technician', 'Lab Staff'),
]

VISIT_MODE_CHOICES = [
    ('Clinic', 'Clinic'),
    ('Telephone', 'Telephone'),
    ('Homecare', 'Homecare'),
]

class Hospital(models.Model):
    name = models.CharField(max_length=255, default='Healthcare Center')
    code = models.CharField(max_length=50, unique=True, default='HOSP-001')
    admin_username = models.CharField(max_length=100, default='admin')
    admin_password = models.CharField(max_length=100, default='admin123')
    address = models.TextField(blank=True, default='Plot 42, Medical Enclave, Health City, New Delhi')
    phone = models.CharField(max_length=20, blank=True, default='+91 11 2678 9000')
    emergency_phone = models.CharField(max_length=50, blank=True, default='+91 11 2678 9999 / 108')
    email = models.EmailField(blank=True, default='director@healthcare.com')
    tagline = models.CharField(max_length=255, blank=True, default='Advanced EHR Medical System')
    logo = models.TextField(blank=True, default='')
    total_doctors = models.IntegerField(default=12)
    total_patients = models.IntegerField(default=1450)
    total_beds = models.IntegerField(default=350)
    occupied_beds = models.IntegerField(default=268)
    icu_beds = models.IntegerField(default=45)
    ambulances = models.IntegerField(default=12)
    departments = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class UserProfile(models.Model):
    user_id = models.CharField(max_length=50, unique=True)
    full_name = models.CharField(max_length=255)
    mobile_number = models.CharField(max_length=20, db_index=True)
    email = models.EmailField(blank=True, default='')
    dob = models.CharField(max_length=50, blank=True, default='')
    age = models.CharField(max_length=20, blank=True, default='')
    gender = models.CharField(max_length=20, blank=True, default='Male')
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default='patient')
    blood_group = models.CharField(max_length=10, blank=True, default='O+')
    address = models.TextField(blank=True, default='')
    emergency_contact = models.CharField(max_length=20, blank=True, default='')
    
    # Doctor / Staff specific fields
    staff_id = models.CharField(max_length=50, blank=True, default='')
    doctor_id = models.CharField(max_length=50, blank=True, default='')
    patient_id = models.CharField(max_length=50, blank=True, default='')
    specialization = models.CharField(max_length=100, blank=True, default='')
    department = models.CharField(max_length=100, blank=True, default='')
    qualification = models.CharField(max_length=100, blank=True, default='')
    experience = models.CharField(max_length=50, blank=True, default='')
    consultation_fee = models.CharField(max_length=50, blank=True, default='₹500')
    availability = models.CharField(max_length=100, blank=True, default='Mon - Sat')
    shift_timing = models.CharField(max_length=100, blank=True, default='09:00 AM - 05:00 PM')
    working_hours = models.CharField(max_length=100, blank=True, default='8 Hours / Day')
    
    # Patient health fields
    current_treatment_department = models.CharField(max_length=100, blank=True, default='')
    treatment_status = models.CharField(max_length=50, blank=True, default='Active')
    current_diagnosis = models.CharField(max_length=255, blank=True, default='')
    medical_history = models.JSONField(default=list, blank=True)
    
    # Media & settings
    clinic_name = models.CharField(max_length=255, blank=True, default='Healthcare Center')
    clinic_address = models.TextField(blank=True, default='Plot 42, Medical Enclave, Health City, New Delhi')
    avatar = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} ({self.role}) - {self.user_id}"

class StaffMember(models.Model):
    STAFF_TYPES = [
        ('doctor', 'Doctor'),
        ('patient', 'Patient'),
        ('receptionist', 'Receptionist'),
        ('technician', 'Staff Technician'),
        ('pharmacy', 'Pharmacy Staff'),
        ('lab', 'Lab Staff'),
    ]
    staff_type = models.CharField(max_length=20, choices=STAFF_TYPES, default='doctor')
    staff_id = models.CharField(max_length=50, unique=True)
    full_name = models.CharField(max_length=255)
    mobile = models.CharField(max_length=20)
    email = models.EmailField(blank=True, default='')
    
    # Role / Department fields
    specialization = models.CharField(max_length=100, blank=True, default='')
    department = models.CharField(max_length=100, blank=True, default='')
    qualification = models.CharField(max_length=100, blank=True, default='')
    experience = models.CharField(max_length=50, blank=True, default='')
    consultation_fee = models.CharField(max_length=50, blank=True, default='700')
    availability = models.CharField(max_length=100, blank=True, default='Mon - Sat')
    shift_timing = models.CharField(max_length=100, blank=True, default='09:00 AM - 05:00 PM')
    working_hours = models.CharField(max_length=100, blank=True, default='8 Hours / Day')
    is_active = models.BooleanField(default=True)
    
    dob = models.CharField(max_length=50, blank=True, default='')
    gender = models.CharField(max_length=20, blank=True, default='')
    blood_group = models.CharField(max_length=10, blank=True, default='')
    address = models.TextField(blank=True, default='')
    emergency_contact = models.CharField(max_length=20, blank=True, default='')
    
    pharmacy_role = models.CharField(max_length=100, blank=True, default='')
    lab_department = models.CharField(max_length=100, blank=True, default='')
    lab_role = models.CharField(max_length=100, blank=True, default='')
    
    profile_photo = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} - {self.staff_type} ({self.staff_id})"

class Appointment(models.Model):
    booking_ref = models.CharField(max_length=50, unique=True)
    patient_id = models.CharField(max_length=50)
    patient_name = models.CharField(max_length=255)
    patient_phone = models.CharField(max_length=20, blank=True, default='')
    patient_gender = models.CharField(max_length=20, blank=True, default='')
    patient_age = models.CharField(max_length=20, blank=True, default='')
    doctor_id = models.CharField(max_length=50)
    doctor_name = models.CharField(max_length=255)
    doctor_specialization = models.CharField(max_length=100, blank=True, default='')
    department = models.CharField(max_length=100)
    date = models.CharField(max_length=50)
    time_slot = models.CharField(max_length=50)
    visit_mode = models.CharField(max_length=20, choices=VISIT_MODE_CHOICES, default='Clinic')
    symptoms = models.TextField(blank=True, default='')
    status = models.CharField(max_length=30, default='scheduled')
    payment_status = models.CharField(max_length=20, default='paid')
    amount = models.CharField(max_length=50, default='₹500')
    consultation_fee = models.CharField(max_length=50, blank=True, default='500')
    home_location = models.TextField(blank=True, default='')
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.booking_ref}: {self.patient_name} with {self.doctor_name} on {self.date}"

class Prescription(models.Model):
    prescription_number = models.CharField(max_length=50, unique=True)
    appointment_id = models.CharField(max_length=50, blank=True, default='')
    patient_id = models.CharField(max_length=50)
    patient_name = models.CharField(max_length=255)
    patient_mobile = models.CharField(max_length=20, blank=True, default='')
    patient_age = models.CharField(max_length=20, blank=True, default='')
    patient_gender = models.CharField(max_length=20, blank=True, default='')
    doctor_id = models.CharField(max_length=50)
    doctor_name = models.CharField(max_length=255)
    doctor_specialization = models.CharField(max_length=100, blank=True, default='')
    doctor_qualification = models.CharField(max_length=100, blank=True, default='')
    department = models.CharField(max_length=100, blank=True, default='')
    date = models.CharField(max_length=50)
    time = models.CharField(max_length=50, blank=True, default='')
    diagnosis = models.TextField(blank=True, default='')
    symptoms = models.TextField(blank=True, default='')
    medicines = models.JSONField(default=list)  # list of {id, name, dosage, frequency, duration, instructions, status}
    status = models.CharField(max_length=20, default='active')
    expiry_date = models.CharField(max_length=50, blank=True, default='')
    advice_notes = models.TextField(blank=True, default='')
    advice = models.TextField(blank=True, default='')
    diet_advice = models.TextField(blank=True, default='')
    next_follow_up = models.CharField(max_length=100, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Prescription {self.prescription_number} for {self.patient_name}"

class LabReport(models.Model):
    report_number = models.CharField(max_length=50, unique=True)
    patient_id = models.CharField(max_length=50)
    patient_name = models.CharField(max_length=255)
    doctor_id = models.CharField(max_length=50, blank=True, default='')
    doctor_name = models.CharField(max_length=255, blank=True, default='')
    test_name = models.CharField(max_length=255)
    test_date = models.CharField(max_length=50)
    results = models.TextField(blank=True, default='Normal')
    status = models.CharField(max_length=50, default='Ready')
    lab_department = models.CharField(max_length=100, blank=True, default='Pathology')
    technician_name = models.CharField(max_length=100, blank=True, default='')
    normal_range = models.CharField(max_length=100, blank=True, default='')
    units = models.CharField(max_length=50, blank=True, default='')
    findings = models.TextField(blank=True, default='')
    is_abnormal = models.BooleanField(default=False)
    file_url = models.CharField(max_length=500, blank=True, default='#')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"LabReport {self.report_number} for {self.patient_name}"

class OTPVerification(models.Model):
    mobile_number = models.CharField(max_length=20)
    otp_code = models.CharField(max_length=10)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"OTP {self.otp_code} for {self.mobile_number}"
