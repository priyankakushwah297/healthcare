from django.urls import path
from . import views

urlpatterns = [
    # Auth endpoints
    path('auth/check-phone/', views.check_phone, name='check_phone'),
    path('auth/send-otp/', views.send_otp, name='send_otp'),
    path('auth/verify-otp/', views.verify_otp, name='verify_otp'),
    path('auth/register/', views.register_user, name='register_user'),

    # Users & Patients Directory
    path('users/', views.user_list, name='user_list'),
    path('patients/', views.patient_list, name='patient_list'),

    # Hospital & Admin
    path('hospitals/', views.hospital_list_create, name='hospital_list_create'),
    path('admin/overview/', views.admin_overview, name='admin_overview'),

    # Staff Management (Doctors, Receptionists, Technicians)
    path('staff/', views.staff_list_create, name='staff_list_create'),
    path('staff/<str:staff_id>/', views.staff_detail, name='staff_detail'),

    # Appointments
    path('appointments/', views.appointment_list_create, name='appointment_list_create'),
    path('appointments/<str:booking_ref_or_pk>/', views.appointment_detail_update, name='appointment_detail_update'),
    path('appointments/<str:booking_ref_or_pk>/status/', views.update_appointment_status, name='update_appointment_status'),
    path('doctors/<str:doctor_id>/analytics/', views.doctor_appointment_analytics, name='doctor_appointment_analytics'),

    # Prescriptions & Lab Reports
    path('prescriptions/', views.prescription_list_create, name='prescription_list_create'),
    path('lab-reports/', views.lab_report_list_create, name='lab_report_list_create'),

    # Receptionist
    path('receptionist/analytics/', views.receptionist_analytics, name='receptionist_analytics'),
    path('receptionist/register-patient/', views.register_patient_receptionist, name='register_patient_receptionist'),

    # Cloudinary Image Upload
    path('upload-image/', views.upload_image, name='upload_image'),
]
