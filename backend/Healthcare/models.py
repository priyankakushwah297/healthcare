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

APPOINTMENT_STATUS_CHOICES = [
    ('Scheduled', 'Scheduled'),
    ('Completed', 'Completed'),
    ('Cancelled', 'Cancelled'),
    ('Pending', 'Pending'),
]

class Hospital(models.Model):
    name = models.CharField(max_length=255)
    code = models.CharField(max_length=50, unique=True, default='HOSP-001')
    admin_username = models.CharField(max_length=100)
    admin_password = models.CharField(max_length=100)
    address = models.TextField(blank=True, default='')
    phone = models.CharField(max_length=20, blank=True, default='')
    email = models.EmailField(blank=True, default='')
    total_doctors = models.IntegerField(default=0)
    total_patients = models.IntegerField(default=0)
    total_beds = models.IntegerField(default=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class UserProfile(models.Model):
    user_id = models.CharField(max_length=50, unique=True)
    full_name = models.CharField(max_length=255)
    mobile_number = models.CharField(max_length=20, db_index=True)
    email = models.EmailField(blank=True, default='')
    dob = models.CharField(max_length=50, blank=True, default='')
    age = models.CharField(max_length=10, blank=True, default='')
    gender = models.CharField(max_length=20, blank=True, default='Male')
    role = models.CharField(max_length=30, choices=ROLE_CHOICES, default='patient')
    blood_group = models.CharField(max_length=10, blank=True, default='')
    address = models.TextField(blank=True, default='')
    emergency_contact = models.CharField(max_length=20, blank=True, default='')
    
    # Doctor specific fields
    specialization = models.CharField(max_length=100, blank=True, default='')
    department = models.CharField(max_length=100, blank=True, default='')
    qualification = models.CharField(max_length=100, blank=True, default='')
    experience = models.CharField(max_length=50, blank=True, default='')
    consultation_fee = models.CharField(max_length=50, blank=True, default='₹500')
    availability = models.CharField(max_length=100, blank=True, default='Mon - Sat')
    working_hours = models.CharField(max_length=100, blank=True, default='09:00 AM - 05:00 PM')
    
    # Extra settings
    clinic_name = models.CharField(max_length=255, blank=True, default='Healthcare Center')
    clinic_address = models.TextField(blank=True, default='123 Healthcare Blvd, Medical Zone')
    avatar = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} ({self.role}) - {self.user_id}"

class StaffMember(models.Model):
    STAFF_TYPES = [
        ('doctor', 'Doctor'),
        ('patient', 'Patient'),
        ('pharmacy', 'Pharmacy Staff'),
        ('lab', 'Lab Staff'),
    ]
    staff_type = models.CharField(max_length=20, choices=STAFF_TYPES)
    staff_id = models.CharField(max_length=50, unique=True)
    full_name = models.CharField(max_length=255)
    mobile = models.CharField(max_length=20)
    email = models.EmailField(blank=True, default='')
    
    # Role / Department fields
    specialization = models.CharField(max_length=100, blank=True, default='')
    department = models.CharField(max_length=100, blank=True, default='')
    qualification = models.CharField(max_length=100, blank=True, default='')
    experience = models.CharField(max_length=50, blank=True, default='')
    consultation_fee = models.CharField(max_length=50, blank=True, default='')
    availability = models.CharField(max_length=100, blank=True, default='')
    working_hours = models.CharField(max_length=100, blank=True, default='')
    
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
    doctor_id = models.CharField(max_length=50)
    doctor_name = models.CharField(max_length=255)
    department = models.CharField(max_length=100)
    date = models.CharField(max_length=50)
    time_slot = models.CharField(max_length=50)
    visit_mode = models.CharField(max_length=20, choices=VISIT_MODE_CHOICES, default='Clinic')
    symptoms = models.TextField(blank=True, default='')
    status = models.CharField(max_length=20, choices=APPOINTMENT_STATUS_CHOICES, default='Scheduled')
    payment_status = models.CharField(max_length=20, default='Paid')
    amount = models.CharField(max_length=50, default='₹500')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.booking_ref}: {self.patient_name} with {self.doctor_name} on {self.date}"

class Prescription(models.Model):
    prescription_number = models.CharField(max_length=50, unique=True)
    patient_id = models.CharField(max_length=50)
    patient_name = models.CharField(max_length=255)
    doctor_id = models.CharField(max_length=50)
    doctor_name = models.CharField(max_length=255)
    date = models.CharField(max_length=50)
    medicines = models.JSONField(default=list)  # list of {name, dosage, frequency, duration}
    notes = models.TextField(blank=True, default='')
    status = models.CharField(max_length=20, default='Active')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Prescription {self.prescription_number} for {self.patient_name}"

class LabReport(models.Model):
    report_number = models.CharField(max_length=50, unique=True)
    patient_id = models.CharField(max_length=50)
    patient_name = models.CharField(max_length=255)
    test_name = models.CharField(max_length=255)
    test_date = models.CharField(max_length=50)
    results = models.TextField(blank=True, default='Normal')
    status = models.CharField(max_length=50, default='Completed')
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
