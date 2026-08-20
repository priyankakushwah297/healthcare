import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Kalpanaaa.settings')
django.setup()

from Healthcare.models import Hospital, UserProfile, StaffMember, Appointment, Prescription, LabReport

def seed():
    # 1. Create Default Hospital
    hosp, created = Hospital.objects.get_or_create(
        code='HOSP-001',
        defaults={
            'name': 'Healthcare Center',
            'admin_username': 'admin',
            'admin_password': 'adminpassword123',
            'phone': '+91 98765 43210',
            'email': 'admin@healthcare.com',
            'address': '123 Healthcare Blvd, Medical Zone, City',
            'total_doctors': 12,
            'total_patients': 1450,
            'total_beds': 100,
        }
    )
    if not created:
        hosp.name = 'Healthcare Center'
        hosp.email = 'admin@healthcare.com'
        hosp.save()
    print(f"Hospital ready: {hosp.name}")

    # 2. Seed Default Users (Patient, Doctor, Receptionist, Admin)
    # Patient
    p1, _ = UserProfile.objects.get_or_create(
        user_id='PAT-101',
        defaults={
            'full_name': 'Rahul Sharma',
            'mobile_number': '9876543210',
            'email': 'rahul.sharma@example.com',
            'dob': '1995-05-15',
            'age': '29',
            'gender': 'Male',
            'role': 'patient',
            'blood_group': 'O+',
            'address': 'Flat 402, Green Valley Apartments',
            'emergency_contact': '+91 98765 00000',
        }
    )

    # Doctors & Receptionists Data Seeding
    doctors_seed = [
        {'id': 'DOC-KLP-101', 'name': 'Dr. Arvind Sharma', 'mobile': '9876543220', 'email': 'dr.arvind@healthcare.com', 'spec': 'Senior Interventional Cardiologist', 'dept': 'Cardiology', 'qual': 'MBBS, MD, DM, FACC', 'exp': '18 Years', 'fee': '₹800', 'avail': 'Mon - Sat', 'hours': '09:00 AM - 04:30 PM'},
        {'id': 'DOC-KLP-102', 'name': 'Dr. Priya Varma', 'mobile': '9876543221', 'email': 'dr.priya@healthcare.com', 'spec': 'Consultant Neurosurgeon', 'dept': 'Neurology', 'qual': 'MBBS, MS, MCh (Neurosurgery)', 'exp': '14 Years', 'fee': '₹950', 'avail': 'Mon, Wed, Thu, Sat', 'hours': '10:00 AM - 05:00 PM'},
        {'id': 'DOC-KLP-103', 'name': 'Dr. Vivek Menon', 'mobile': '9876543222', 'email': 'dr.vivek@healthcare.com', 'spec': 'Senior Physician & Diabetologist', 'dept': 'General Medicine', 'qual': 'MBBS, MD (Internal Med), MRCP', 'exp': '16 Years', 'fee': '₹650', 'avail': 'Mon - Sat', 'hours': '08:30 AM - 03:30 PM'},
        {'id': 'DOC-KLP-104', 'name': 'Dr. Rajesh Khanna', 'mobile': '9876543223', 'email': 'dr.rajesh@healthcare.com', 'spec': 'Orthopedic & Joint Replacement Surgeon', 'dept': 'Orthopedics', 'qual': 'MBBS, MS (Ortho)', 'exp': '20 Years', 'fee': '₹850', 'avail': 'Mon, Tue, Thu, Fri', 'hours': '09:30 AM - 04:00 PM'},
        {'id': 'DOC-KLP-105', 'name': 'Dr. Emily Vance', 'mobile': '9876543224', 'email': 'dr.emily@healthcare.com', 'spec': 'Senior Pediatrician', 'dept': 'Pediatrics', 'qual': 'MBBS, MD (Pediatrics)', 'exp': '10 Years', 'fee': '₹600', 'avail': 'Mon - Sat', 'hours': '09:00 AM - 02:00 PM'},
        {'id': 'DOC-KLP-106', 'name': 'Dr. Ananya Roy', 'mobile': '9876543225', 'email': 'dr.ananya@healthcare.com', 'spec': 'Consultant Dermatologist', 'dept': 'Dermatology', 'qual': 'MBBS, MD (Dermatology)', 'exp': '8 Years', 'fee': '₹700', 'avail': 'Tue, Thu, Sat', 'hours': '11:00 AM - 05:00 PM'},
    ]

    for d in doctors_seed:
        UserProfile.objects.get_or_create(
            user_id=d['id'],
            defaults={
                'full_name': d['name'],
                'mobile_number': d['mobile'],
                'email': d['email'],
                'role': 'doctor',
                'specialization': d['spec'],
                'department': d['dept'],
                'qualification': d['qual'],
                'experience': d['exp'],
                'consultation_fee': d['fee'],
                'working_hours': d['hours'],
                'availability': d['avail'],
            }
        )
        StaffMember.objects.get_or_create(
            staff_id=d['id'],
            defaults={
                'staff_type': 'doctor',
                'full_name': d['name'],
                'mobile': d['mobile'],
                'email': d['email'],
                'specialization': d['spec'],
                'department': d['dept'],
                'qualification': d['qual'],
                'experience': d['exp'],
                'consultation_fee': d['fee'],
                'availability': d['avail'],
                'working_hours': d['hours'],
            }
        )

    receptionists_seed = [
        {'id': 'REC-KLP-01', 'name': 'Sneha Kapur', 'mobile': '9876543230', 'email': 'reception@healthcare.com', 'role_title': 'Lead Receptionist & Helpdesk Coordinator', 'dept': 'Front Office Desk', 'exp': '5 Years', 'avail': 'Mon - Sat', 'hours': '08:00 AM - 04:00 PM'},
        {'id': 'REC-KLP-02', 'name': 'Ananya Verma', 'mobile': '9876543212', 'email': 'ananya.rec@healthcare.com', 'role_title': 'OPD Registration Desk Officer', 'dept': 'OPD Helpdesk', 'exp': '4 Years', 'avail': 'Mon - Sat', 'hours': '09:00 AM - 05:00 PM'},
        {'id': 'REC-KLP-03', 'name': 'Pooja Malhotra', 'mobile': '9876543232', 'email': 'pooja.rec@healthcare.com', 'role_title': 'Emergency Desk Receptionist', 'dept': 'Emergency & Trauma Desk', 'exp': '6 Years', 'avail': '24/7 Shift Rotation', 'hours': '04:00 PM - 12:00 AM'},
    ]

    for r in receptionists_seed:
        UserProfile.objects.get_or_create(
            user_id=r['id'],
            defaults={
                'full_name': r['name'],
                'mobile_number': r['mobile'],
                'email': r['email'],
                'role': 'receptionist',
                'department': r['dept'],
                'experience': r['exp'],
                'working_hours': r['hours'],
                'availability': r['avail'],
            }
        )
        StaffMember.objects.get_or_create(
            staff_id=r['id'],
            defaults={
                'staff_type': 'receptionist',
                'full_name': r['name'],
                'mobile': r['mobile'],
                'email': r['email'],
                'department': r['dept'],
                'experience': r['exp'],
                'availability': r['avail'],
                'working_hours': r['hours'],
            }
        )

    StaffMember.objects.get_or_create(
        staff_id='PAT-101',
        defaults={
            'staff_type': 'patient',
            'full_name': 'Rahul Sharma',
            'mobile': '9876543210',
            'email': 'rahul.sharma@example.com',
            'dob': '1995-05-15',
            'gender': 'Male',
            'blood_group': 'O+',
            'address': 'Flat 402, Green Valley Apartments',
            'emergency_contact': '+91 98765 00000',
        }
    )

    StaffMember.objects.get_or_create(
        staff_id='PHARM-501',
        defaults={
            'staff_type': 'pharmacy',
            'full_name': 'Aman Gupta',
            'mobile': '9876543214',
            'email': 'aman.pharmacy@healthcare.com',
            'pharmacy_role': 'Head Pharmacist',
        }
    )

    StaffMember.objects.get_or_create(
        staff_id='LAB-601',
        defaults={
            'staff_type': 'lab',
            'full_name': 'Pooja Nair',
            'mobile': '9876543215',
            'email': 'pooja.lab@healthcare.com',
            'lab_department': 'Pathology',
            'lab_role': 'Senior Lab Technician',
        }
    )

    # 4. Seed Appointments
    Appointment.objects.get_or_create(
        booking_ref='APT-1001',
        defaults={
            'patient_id': 'PAT-101',
            'patient_name': 'Rahul Sharma',
            'patient_phone': '9876543210',
            'doctor_id': 'DOC-201',
            'doctor_name': 'Dr. Sarah Jenkins',
            'department': 'Cardiology',
            'date': '2026-08-20',
            'time_slot': '10:30 AM',
            'visit_mode': 'Clinic',
            'symptoms': 'Routine cardiac checkup and BP monitoring',
            'status': 'Scheduled',
            'payment_status': 'Paid',
            'amount': '₹700',
        }
    )

    # 5. Seed Prescription
    Prescription.objects.get_or_create(
        prescription_number='RX-101',
        defaults={
            'patient_id': 'PAT-101',
            'patient_name': 'Rahul Sharma',
            'doctor_id': 'DOC-201',
            'doctor_name': 'Dr. Sarah Jenkins',
            'date': '2026-08-10',
            'medicines': [
                {'name': 'Atorvastatin', 'dosage': '10mg', 'frequency': 'Once daily after dinner', 'duration': '30 Days'},
                {'name': 'Aspirin', 'dosage': '75mg', 'frequency': 'Once daily after breakfast', 'duration': '30 Days'}
            ],
            'notes': 'Maintain low sodium diet and light morning walks.',
            'status': 'Active'
        }
    )

    # 6. Seed Lab Report
    LabReport.objects.get_or_create(
        report_number='LAB-501',
        defaults={
            'patient_id': 'PAT-101',
            'patient_name': 'Rahul Sharma',
            'test_name': 'Complete Lipid Profile & ECG',
            'test_date': '2026-08-12',
            'results': 'Cholesterol: 185 mg/dL (Normal), HDL: 48 mg/dL, Triglycerides: 140 mg/dL',
            'status': 'Completed',
            'file_url': '#'
        }
    )

    print("Data seeding completed successfully!")

if __name__ == '__main__':
    seed()
