import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Kalpanaaa.settings')
django.setup()

import cloudinary
import cloudinary.uploader
from Healthcare.models import Hospital, UserProfile, StaffMember, Appointment, Prescription, LabReport, OTPVerification

# Cloudinary Setup
CLOUDINARY_URL = os.getenv('CLOUDINARY_URL', 'cloudinary://293669848849724:2naqr72A3R6XakkrgGWpVe3NIj0@agyzxqvk')
cloudinary.config(cloudinary_url=CLOUDINARY_URL)

AVATAR_SOURCES = {
    'admin': 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80',
    'technician': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    'doctor_1': 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
    'doctor_2': 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&auto=format&fit=crop&q=80',
    'doctor_3': 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&auto=format&fit=crop&q=80',
    'doctor_4': 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=300&auto=format&fit=crop&q=80',
    'doctor_5': 'https://images.unsplash.com/photo-1594824813570-87b64010b991?w=300&auto=format&fit=crop&q=80',
    'doctor_6': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    'receptionist_1': 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
    'receptionist_2': 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&auto=format&fit=crop&q=80',
    'receptionist_3': 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=300&auto=format&fit=crop&q=80',
    'patient': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    'hospital_logo': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=300&auto=format&fit=crop&q=80'
}

def upload_images_to_cloudinary():
    cloudinary_urls = {}
    print("Uploading images to Cloudinary...")
    for key, url in AVATAR_SOURCES.items():
        try:
            res = cloudinary.uploader.upload(
                url,
                folder="healthcare_avatars",
                public_id=f"avatar_{key}",
                overwrite=True
            )
            cloudinary_urls[key] = res.get('secure_url') or res.get('url')
            print(f"Uploaded {key} -> {cloudinary_urls[key]}")
        except Exception as e:
            print(f"Cloudinary upload for {key}: {e}")
            cloudinary_urls[key] = f"https://res.cloudinary.com/agyzxqvk/image/upload/v1787224296/healthcare_avatars/avatar_{key}.jpg"
    return cloudinary_urls

def seed_supabase_database(c_urls):
    print("Seeding Supabase PostgreSQL database...")
    
    # 1. Hospital
    hosp, _ = Hospital.objects.update_or_create(
        code='HOSP-001',
        defaults={
            'name': 'Healthcare Center',
            'admin_username': 'admin',
            'admin_password': 'adminpassword123',
            'phone': '+91 98765 43210',
            'email': 'director@healthcare.com',
            'address': 'Plot 42, Medical Enclave, Health City, New Delhi - 110029',
            'total_doctors': 12,
            'total_patients': 1450,
            'total_beds': 350,
        }
    )
    print(f"Hospital ready in Supabase: {hosp.name}")

    # 2. Admin User
    UserProfile.objects.update_or_create(
        user_id='usr-admin-1',
        defaults={
            'full_name': 'Dr. Ramesh Chandra',
            'mobile_number': '9876543210',
            'email': 'director@healthcare.com',
            'role': 'hospital_admin',
            'specialization': 'Medical Director & Chief Administrator',
            'department': 'Hospital Administration',
            'qualification': 'MBBS, MD (Hospital Admin)',
            'experience': '25 Years',
            'avatar': c_urls.get('admin'),
        }
    )

    # 3. Technician User & Staff (Karan Malhotra)
    UserProfile.objects.update_or_create(
        user_id='usr-technician-1',
        defaults={
            'full_name': 'Karan Malhotra',
            'mobile_number': '9876543260',
            'email': 'tech.karan@healthcare.com',
            'role': 'technician',
            'specialization': 'Senior Systems & Staff Operations Technician',
            'department': 'Hospital Administration',
            'experience': '7 Years',
            'working_hours': '8 Hours / Day',
            'availability': 'Mon - Sat',
            'avatar': c_urls.get('technician'),
        }
    )
    StaffMember.objects.update_or_create(
        staff_id='TECH-KLP-01',
        defaults={
            'staff_type': 'doctor',
            'full_name': 'Karan Malhotra',
            'mobile': '9876543260',
            'email': 'tech.karan@healthcare.com',
            'specialization': 'Senior Systems & Staff Operations Technician',
            'department': 'Hospital Administration',
            'experience': '7 Years',
            'profile_photo': c_urls.get('technician'),
            'working_hours': '8 Hours / Day',
            'availability': 'Mon, Tue, Wed, Thu, Fri, Sat',
        }
    )

    # 4. Doctors
    doctors = [
        {
            'id': 'DOC-KLP-101', 'name': 'Dr. Arvind Sharma', 'mobile': '9876543220',
            'email': 'dr.arvind@healthcare.com', 'spec': 'Senior Interventional Cardiologist',
            'dept': 'Cardiology', 'qual': 'MBBS, MD (Cardiology), DM, FACC', 'exp': '18+ Years Experience',
            'fee': '800', 'hours': '09:00 AM - 04:30 PM (Morning OPD)', 'avail': 'Mon, Tue, Wed, Thu, Fri, Sat',
            'photo': c_urls.get('doctor_1')
        },
        {
            'id': 'DOC-KLP-102', 'name': 'Dr. Priya Varma', 'mobile': '9876543221',
            'email': 'dr.priya@healthcare.com', 'spec': 'Consultant Neurosurgeon & Specialist',
            'dept': 'Neurology', 'qual': 'MBBS, MS, MCh (Neurosurgery), FINR', 'exp': '14+ Years Experience',
            'fee': '950', 'hours': '10:00 AM - 05:00 PM (Regular OPD)', 'avail': 'Mon, Wed, Thu, Sat',
            'photo': c_urls.get('doctor_2')
        },
        {
            'id': 'DOC-KLP-103', 'name': 'Dr. Vivek Menon', 'mobile': '9876543222',
            'email': 'dr.vivek@healthcare.com', 'spec': 'Senior Physician & Diabetologist',
            'dept': 'General Medicine', 'qual': 'MBBS, MD (Internal Medicine), MRCP (UK)', 'exp': '16+ Years Experience',
            'fee': '650', 'hours': '08:30 AM - 03:30 PM (OPD)', 'avail': 'Mon, Tue, Wed, Thu, Fri, Sat',
            'photo': c_urls.get('doctor_3')
        },
        {
            'id': 'DOC-KLP-104', 'name': 'Dr. Rajesh Khanna', 'mobile': '9876543223',
            'email': 'dr.rajesh@healthcare.com', 'spec': 'Orthopedic & Joint Replacement Surgeon',
            'dept': 'Orthopedics', 'qual': 'MBBS, MS (Ortho), Fellowship Arthroscopy', 'exp': '20+ Years Experience',
            'fee': '850', 'hours': '09:30 AM - 04:00 PM', 'avail': 'Mon, Tue, Thu, Fri',
            'photo': c_urls.get('doctor_4')
        },
        {
            'id': 'DOC-KLP-105', 'name': 'Dr. Emily Vance', 'mobile': '9876543224',
            'email': 'dr.emily@healthcare.com', 'spec': 'Chief Pediatrician & Neonatologist',
            'dept': 'Pediatrics', 'qual': 'MBBS, MD (Pediatrics), DNB (Pediatrics)', 'exp': '11+ Years Experience',
            'fee': '600', 'hours': '09:00 AM - 02:00 PM', 'avail': 'Mon, Tue, Wed, Thu, Fri, Sat',
            'photo': c_urls.get('doctor_5')
        },
        {
            'id': 'DOC-KLP-106', 'name': 'Dr. Ananya Roy', 'mobile': '9876543225',
            'email': 'dr.ananya@healthcare.com', 'spec': 'Consultant Dermatologist & Cosmetologist',
            'dept': 'Dermatology', 'qual': 'MBBS, MD (Dermatology, Venereology & Leprosy)', 'exp': '9+ Years Experience',
            'fee': '700', 'hours': '11:00 AM - 05:00 PM', 'avail': 'Tue, Thu, Sat',
            'photo': c_urls.get('doctor_6')
        },
    ]

    for d in doctors:
        UserProfile.objects.update_or_create(
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
                'avatar': d['photo'],
            }
        )
        StaffMember.objects.update_or_create(
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
                'profile_photo': d['photo'],
                'working_hours': d['hours'],
                'availability': d['avail'],
            }
        )

    # 5. Receptionists
    receptionists = [
        {
            'id': 'REC-KLP-01', 'name': 'Sneha Kapur', 'mobile': '9876543230',
            'email': 'sneha.kapur@healthcare.com', 'role_title': 'Lead Receptionist & Helpdesk Coordinator',
            'dept': 'Front Office Desk', 'exp': '5+ Years', 'hours': '08:00 AM - 04:00 PM',
            'avail': 'Mon, Tue, Wed, Thu, Fri, Sat', 'photo': c_urls.get('receptionist_1')
        },
        {
            'id': 'REC-KLP-02', 'name': 'Ananya Verma', 'mobile': '9876543212',
            'email': 'ananya.rec@healthcare.com', 'role_title': 'OPD Registration Desk Officer',
            'dept': 'OPD Helpdesk', 'exp': '4+ Years', 'hours': '09:00 AM - 05:00 PM',
            'avail': 'Mon, Tue, Wed, Thu, Fri, Sat', 'photo': c_urls.get('receptionist_2')
        },
        {
            'id': 'REC-KLP-03', 'name': 'Pooja Malhotra', 'mobile': '9876543232',
            'email': 'pooja.rec@healthcare.com', 'role_title': 'Emergency Desk Receptionist',
            'dept': 'Emergency Desk', 'exp': '6+ Years', 'hours': '04:00 PM - 12:00 AM',
            'avail': 'Mon, Tue, Wed, Thu, Fri, Sat', 'photo': c_urls.get('receptionist_3')
        }
    ]

    for r in receptionists:
        UserProfile.objects.update_or_create(
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
                'avatar': r['photo'],
            }
        )
        StaffMember.objects.update_or_create(
            staff_id=r['id'],
            defaults={
                'staff_type': 'doctor',
                'full_name': r['name'],
                'mobile': r['mobile'],
                'email': r['email'],
                'specialization': r['role_title'],
                'department': r['dept'],
                'experience': r['exp'],
                'profile_photo': r['photo'],
                'working_hours': r['hours'],
                'availability': r['avail'],
            }
        )

    # 6. Patient User
    UserProfile.objects.update_or_create(
        user_id='PAT-KLP-101',
        defaults={
            'full_name': 'Aarav Mehta',
            'mobile_number': '9876543201',
            'email': 'aarav.mehta@example.com',
            'dob': '1995-08-14',
            'age': '30 Years',
            'gender': 'Male',
            'role': 'patient',
            'blood_group': 'B+',
            'address': 'D-42, South Extension Part II, New Delhi - 110049',
            'emergency_contact': '+91 98111 22334',
            'avatar': c_urls.get('patient'),
        }
    )

    # 7. Initial Seed Appointment
    Appointment.objects.update_or_create(
        booking_ref='APT-KLP-2026-1001',
        defaults={
            'patient_id': 'PAT-KLP-101',
            'patient_name': 'Aarav Mehta',
            'patient_phone': '9876543201',
            'doctor_id': 'DOC-KLP-101',
            'doctor_name': 'Dr. Arvind Sharma',
            'department': 'Cardiology',
            'date': '2026-08-21',
            'time_slot': '10:30 AM',
            'visit_mode': 'Clinic',
            'symptoms': 'Routine cardiac consultation & lipid profile review',
            'status': 'Confirmed',
            'payment_status': 'Paid',
            'amount': '₹800',
        }
    )

    print("SUCCESS: Supabase PostgreSQL database fully migrated and seeded with Cloudinary image URLs!")

if __name__ == '__main__':
    c_urls = upload_images_to_cloudinary()
    seed_supabase_database(c_urls)
