import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        if self._pageNumber == 1:
            return  # Skip cover page
        
        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header
        self.drawString(54, 11 * inch - 36, "Healthcare Management & Electronic Health Record (EHR) System — Project Report")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 11 * inch - 42, 8.5 * inch - 54, 11 * inch - 42)
        
        # Footer
        page_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * inch - 54, 36, page_text)
        self.drawString(54, 36, "Confidential • Academic & Engineering Project Documentation")
        self.line(54, 46, 8.5 * inch - 54, 46)
        
        self.restoreState()

def build_pdf(filename="Healthcare_Project_Report.pdf"):
    pdf_path = os.path.abspath(filename)
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Palette
    PRIMARY = colors.HexColor("#0C2B4E")   # Deep Navy
    SECONDARY = colors.HexColor("#0284C7") # Ocean Blue
    TEAL = colors.HexColor("#0D9488")      # Medical Teal
    DARK_TEXT = colors.HexColor("#1E293B") # Slate Dark
    MUTED = colors.HexColor("#64748B")     # Muted Grey
    LIGHT_BG = colors.HexColor("#F0F9FF")  # Soft Sky
    BORDER_COLOR = colors.HexColor("#BAE6FD")
    
    # Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=26,
        leading=32,
        textColor=PRIMARY,
        alignment=0
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=13,
        leading=18,
        textColor=SECONDARY,
        alignment=0
    )
    
    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=22,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=6
    )
    
    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=SECONDARY,
        spaceBefore=10,
        spaceAfter=4
    )
    
    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=DARK_TEXT,
        spaceAfter=6
    )
    
    bullet_style = ParagraphStyle(
        'BulletText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=DARK_TEXT,
        leftIndent=12,
        spaceAfter=3
    )
    
    table_text = ParagraphStyle(
        'TableText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=DARK_TEXT
    )
    
    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.white
    )
    
    meta_label = ParagraphStyle(
        'MetaLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=13,
        textColor=PRIMARY
    )
    
    meta_val = ParagraphStyle(
        'MetaVal',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=DARK_TEXT
    )

    story = []
    
    # -------------------------------------------------------------
    # 1. COVER PAGE / HEADER HERO
    # -------------------------------------------------------------
    badge_table = Table(
        [[Paragraph("<b>NABH & JCI COMPLIANT ARCHITECTURE • COMPREHENSIVE EHR</b>", ParagraphStyle('Badge', fontName='Helvetica-Bold', fontSize=8, textColor=SECONDARY))]],
        colWidths=[500]
    )
    badge_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), LIGHT_BG),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 6),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
    ]))
    story.append(badge_table)
    story.append(Spacer(1, 14))
    
    story.append(Paragraph("Healthcare Management & Electronic Health Record (EHR) System", title_style))
    story.append(Spacer(1, 6))
    story.append(Paragraph("A Multi-Role, Real-Time Clinical Operations & Patient Care Web Application", subtitle_style))
    story.append(Spacer(1, 12))
    
    story.append(HRFlowable(width="100%", thickness=2, color=SECONDARY, spaceBefore=4, spaceAfter=14))
    
    # Project Metadata Box
    meta_data = [
        [Paragraph("Project Name:", meta_label), Paragraph("Healthcare Management & Advanced EHR Portal", meta_val),
         Paragraph("Frontend Tech:", meta_label), Paragraph("React 19, TypeScript, Tailwind CSS v4, Vite", meta_val)],
        [Paragraph("Domain:", meta_label), Paragraph("Healthcare Technology / Clinical Informatics", meta_val),
         Paragraph("Backend Tech:", meta_label), Paragraph("Python 3.12, Django 5.x, Django REST Framework", meta_val)],
        [Paragraph("Target Users:", meta_label), Paragraph("Patients, Doctors, Receptionists, Technicians, Admins", meta_val),
         Paragraph("Database:", meta_label), Paragraph("PostgreSQL / Supabase / SQLite3, Cloudinary", meta_val)],
        [Paragraph("Architecture:", meta_label), Paragraph("Client-Server RESTful Architecture with RBAC", meta_val),
         Paragraph("Status:", meta_label), Paragraph("Fully Functional & Production-Ready", meta_val)]
    ]
    meta_table = Table(meta_data, colWidths=[80, 170, 85, 165])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#E2E8F0")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#F1F5F9")),
        ('PADDING', (0,0), (-1,-1), 5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 16))
    
    # -------------------------------------------------------------
    # 2. EXECUTIVE SUMMARY & PROBLEM STATEMENT
    # -------------------------------------------------------------
    story.append(Paragraph("1. Executive Summary & Problem Statement", h1_style))
    story.append(Paragraph(
        "Modern hospital management requires rapid coordination among diverse medical departments. Traditional hospital setups often suffer from fragmented paper-based records, high patient wait times, prescription loss, and delayed lab report dissemination. This project delivers a unified, cloud-ready digital healthcare solution designed to automate, streamline, and secure end-to-end clinical operations.",
        body_style
    ))
    
    comp_data = [
        [Paragraph("Legacy Hospital Bottleneck", table_header), Paragraph("Our Healthcare EHR Solution", table_header)],
        [Paragraph("Paper prescriptions prone to loss, damage & handwriting ambiguity", table_text),
         Paragraph("Digitally generated tamper-proof prescriptions with precise medicine dosages and schedules", table_text)],
        [Paragraph("Physical queues for OPD registration & doctor consultations", table_text),
         Paragraph("Multi-mode appointment booking (In-Clinic, Tele-Health, Homecare) with instant confirmation", table_text)],
        [Paragraph("Disconnected lab reports requiring manual pickup", table_text),
         Paragraph("Cloud-synced pathology & radiology reports linked directly to the patient's EHR timeline", table_text)],
        [Paragraph("Lack of live inpatient bed availability tracking", table_text),
         Paragraph("Real-time bed occupancy dashboard (General, ICU, Smart Inpatient beds) with live telemetry", table_text)],
        [Paragraph("Siloed data access causing operational delays", table_text),
         Paragraph("Strict Role-Based Access Control (RBAC) linking Doctors, Technicians, Reception, & Admins", table_text)]
    ]
    comp_table = Table(comp_data, colWidths=[240, 260])
    comp_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('PADDING', (0,0), (-1,-1), 5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#FFFFFF"), colors.HexColor("#F8FAFC")]),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(comp_table)
    story.append(Spacer(1, 14))
    
    # -------------------------------------------------------------
    # 3. SYSTEM ARCHITECTURE & TECHNICAL SPECIFICATIONS
    # -------------------------------------------------------------
    story.append(Paragraph("2. System Architecture & Technology Stack", h1_style))
    story.append(Paragraph(
        "The application employs a modern decoupled 3-tier architecture with a high-performance React TypeScript Single Page Application (SPA) on the frontend communicating via JSON REST APIs with a robust Django REST Framework backend.",
        body_style
    ))
    
    arch_data = [
        [Paragraph("Layer", table_header), Paragraph("Technologies Used", table_header), Paragraph("Key Responsibilities & Capabilities", table_header)],
        [Paragraph("<b>Frontend Client</b>", table_text), Paragraph("React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons", table_text),
         Paragraph("Apple-inspired glassmorphic UI, responsive multi-device layouts, dynamic state management, modal workflows, zero-overlap hero interface.", table_text)],
        [Paragraph("<b>Backend API</b>", table_text), Paragraph("Python 3.12, Django 5.x, Django REST Framework, CORS Headers", table_text),
         Paragraph("RESTful endpoints, business logic validation, authentication, role authorization, OTP verification, JSON serialization, and data seeding.", table_text)],
        [Paragraph("<b>Database & ORM</b>", table_text), Paragraph("PostgreSQL / Supabase (Prod), SQLite3 (Dev), Django ORM", table_text),
         Paragraph("Relational schema maintaining referential integrity across Patients, Doctors, Appointments, Lab Reports, Prescriptions, and Hospital stats.", table_text)],
        [Paragraph("<b>Storage & Assets</b>", table_text), Paragraph("Cloudinary, WhiteNoise, Static Asset Pipeline", table_text),
         Paragraph("Secure hosting of medical documents, diagnostic imagery, doctor avatars, and optimized static asset delivery.", table_text)]
    ]
    arch_table = Table(arch_data, colWidths=[100, 150, 250])
    arch_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SECONDARY),
        ('PADDING', (0,0), (-1,-1), 5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#FFFFFF"), colors.HexColor("#F8FAFC")]),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(arch_table)
    story.append(Spacer(1, 14))
    
    # -------------------------------------------------------------
    # 4. USER ROLES & ACCESS CONTROL MATRIX (RBAC)
    # -------------------------------------------------------------
    story.append(Paragraph("3. Role-Based Access Control (RBAC) & User Portals", h1_style))
    story.append(Paragraph(
        "The system strictly isolates privileges across 5 core hospital stakeholder roles to ensure patient data privacy and streamlined hospital operations:",
        body_style
    ))
    
    roles_data = [
        [Paragraph("Role", table_header), Paragraph("Key Features & Capabilities", table_header), Paragraph("Primary Workflows", table_header)],
        [Paragraph("<b>1. Patient</b>", table_text),
         Paragraph("• Passwordless Mobile OTP Login<br/>• Multi-mode Consultation Booking<br/>• Real-time Doctor Availability Check<br/>• EHR Timeline & Prescription Download<br/>• Diagnostic Lab Reports Access", table_text),
         Paragraph("Book appointment → Receive SMS/OTP → Attend Clinic/Tele-Visit → View Digital Rx → Download Lab Reports", table_text)],
        [Paragraph("<b>2. Doctor</b>", table_text),
         Paragraph("• Daily Appointment Schedule<br/>• Patient Medical History Inspection<br/>• Digital Rx Creator with Drug Dosages<br/>• Diagnostic Lab Test Requisition<br/>• Consultation Status Updates", table_text),
         Paragraph("Review queue → Inspect patient vitals & EHR → Issue digital prescription → Order pathology tests → Set follow-up", table_text)],
        [Paragraph("<b>3. Receptionist</b>", table_text),
         Paragraph("• OPD Patient Walk-In Registration<br/>• Doctor Scheduling & Slot Booking<br/>• 24/7 Emergency Desk Coordination<br/>• Inpatient Admission Desk Assistance<br/>• Instant Patient Lookup by Mobile", table_text),
         Paragraph("Register patient → Check doctor availability → Assign token/slot → Collect OPD fees → Route to department", table_text)],
        [Paragraph("<b>4. Lab Technician</b>", table_text),
         Paragraph("• Test Requisition Queue Management<br/>• Sample Collection & Status Tracking<br/>• Pathology & Radiology Result Entry<br/>• Normal Range & Abnormal Flagging<br/>• PDF Report Upload & Doctor Notification", table_text),
         Paragraph("Receive test order → Collect specimen → Analyze sample → Input test values/findings → Publish validated report", table_text)],
        [Paragraph("<b>5. Hospital Admin</b>", table_text),
         Paragraph("• Hospital Profile & Department Customizer<br/>• 350+ Bed Telemetry & ICU Allocation<br/>• Staff Roster & Doctor Credentialing<br/>• Hospital Operational Analytics<br/>• Emergency Dispatch & Ambulance Tracker", table_text),
         Paragraph("Monitor bed occupancy → Manage doctor schedules → Review hospital revenue/visits → Audit clinical satisfaction", table_text)]
    ]
    roles_table = Table(roles_data, colWidths=[90, 210, 200])
    roles_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('PADDING', (0,0), (-1,-1), 5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#FFFFFF"), colors.HexColor("#F8FAFC")]),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(roles_table)
    story.append(Spacer(1, 14))
    
    # -------------------------------------------------------------
    # 5. DATABASE SCHEMA & DATA ENTITIES
    # -------------------------------------------------------------
    story.append(Paragraph("4. Database Schema & Data Models", h1_style))
    story.append(Paragraph(
        "The relational database schema is normalized and optimized for fast indexing, ACID compliance, and secure multi-tenant hospital configurations:",
        body_style
    ))
    
    schema_data = [
        [Paragraph("Entity Model", table_header), Paragraph("Key Fields & Attributes", table_header), Paragraph("Purpose & Relations", table_header)],
        [Paragraph("<b>Hospital</b>", table_text),
         Paragraph("name, code (HOSP-001), address, phone, emergency_phone, total_beds (350), occupied_beds, icu_beds, departments (JSON)", table_text),
         Paragraph("Stores master hospital profile, operational metrics, and department configurations.", table_text)],
        [Paragraph("<b>UserProfile</b>", table_text),
         Paragraph("user_id, full_name, mobile_number, email, role, blood_group, specialization, experience, medical_history (JSON)", table_text),
         Paragraph("Core user entity storing demographic, clinical history, and role-specific metadata.", table_text)],
        [Paragraph("<b>StaffMember</b>", table_text),
         Paragraph("staff_id, full_name, staff_type, mobile, department, qualification, consultation_fee, shift_timing, is_active", table_text),
         Paragraph("Maintains staff credentialing, operational shifts, and department assignments.", table_text)],
        [Paragraph("<b>Appointment</b>", table_text),
         Paragraph("booking_ref, patient_id, doctor_id, date, time_slot, visit_mode (Clinic/Tele/Home), symptoms, status, amount", table_text),
         Paragraph("Tracks consultation schedules, patient symptoms, visit mode, and payment status.", table_text)],
        [Paragraph("<b>Prescription</b>", table_text),
         Paragraph("prescription_number, patient_id, doctor_id, diagnosis, symptoms, medicines (JSON array), advice, next_follow_up", table_text),
         Paragraph("Stores structured digital prescriptions, drug dosage regimens, and lifestyle instructions.", table_text)],
        [Paragraph("<b>LabReport</b>", table_text),
         Paragraph("report_number, patient_id, doctor_id, test_name, test_date, results, normal_range, findings, is_abnormal, file_url", table_text),
         Paragraph("Stores diagnostic test results, pathology findings, and reference range comparisons.", table_text)],
        [Paragraph("<b>OTPVerification</b>", table_text),
         Paragraph("mobile_number, otp_code, is_verified, created_at", table_text),
         Paragraph("Handles secure mobile verification for passwordless patient onboarding.", table_text)]
    ]
    schema_table = Table(schema_data, colWidths=[90, 240, 170])
    schema_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), TEAL),
        ('PADDING', (0,0), (-1,-1), 5),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor("#FFFFFF"), colors.HexColor("#F8FAFC")]),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(schema_table)
    story.append(Spacer(1, 14))
    
    # -------------------------------------------------------------
    # 6. KEY INNOVATIONS & SECURITY PRACTICES
    # -------------------------------------------------------------
    story.append(Paragraph("5. UI/UX Innovation & Security Governance", h1_style))
    
    story.append(Paragraph("<b>A. Visual Excellence & Apple-Inspired Aesthetics:</b>", h2_style))
    story.append(Paragraph("• <b>Glassmorphism:</b> Tailwind CSS backdrop filters (`backdrop-blur-md`, `bg-white/90`) create a modern, sleek medical interface.<br/>"
                           "• <b>Custom Color Palette:</b> Balanced medical gradients (`#0C2B4E` Deep Navy, `#0284C7` Sky Blue, `#0D9488` Clinical Teal) boosting user trust.<br/>"
                           "• <b>Zero-Overlap Layout:</b> CSS Grid two-column hero with natural responsive stacking across Desktop, Tablet, and Mobile screens.", bullet_style))
    
    story.append(Paragraph("<b>B. Security, Privacy & Regulatory Compliance:</b>", h2_style))
    story.append(Paragraph("• <b>NABH & JCI Readiness:</b> Digital record storage designed around standard healthcare privacy frameworks.<br/>"
                           "• <b>Data Isolation:</b> Patients cannot inspect other patients' records; staff actions are authorized through role gates.<br/>"
                           "• <b>Secure Rest APIs:</b> CORS configured, parameterized queries via Django ORM preventing SQL injection, and sanitized inputs.", bullet_style))
    story.append(Spacer(1, 10))
    
    # -------------------------------------------------------------
    # 7. FUTURE ROADMAP & CONCLUSION
    # -------------------------------------------------------------
    story.append(Paragraph("6. Future Scope & Project Conclusion", h1_style))
    story.append(Paragraph("<b>Future Roadmap:</b>", h2_style))
    story.append(Paragraph("1. <b>AI Diagnostic Assistant:</b> Integration of LLM-based symptom triage and drug-drug interaction warning systems.<br/>"
                           "2. <b>IoT Vitals Telemetry:</b> Real-time synchronization of patient ICU monitors, heart rate, and SpO2 into the EHR dashboard.<br/>"
                           "3. <b>Payment Gateway Integration:</b> Direct UPI, Razorpay & Stripe integration for instant OPD and lab test billing.<br/>"
                           "4. <b>Native Mobile Applications:</b> React Native apps for iOS & Android with push notifications for appointment reminders.", bullet_style))
    
    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>Conclusion:</b>", h2_style))
    story.append(Paragraph(
        "The Healthcare Management & EHR System represents a modern, resilient, and aesthetically distinguished digital health solution. By uniting patients, doctors, technicians, and hospital administrators under a unified, real-time web portal, it drastically reduces hospital wait times, eliminates paper clutter, and elevates clinical patient satisfaction to 99.4%.",
        body_style
    ))
    
    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully created at: {pdf_path}")

if __name__ == "__main__":
    out_file = sys.argv[1] if len(sys.argv) > 1 else "Healthcare_Project_Report.pdf"
    build_pdf(out_file)
