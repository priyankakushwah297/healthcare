import os
import sys
import shutil
from PIL import Image
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def prepare_background_images():
    base_img_path = "bg_medical.jpg"
    if not os.path.exists(base_img_path):
        src_path = r"C:\Users\priya\.gemini\antigravity-ide\brain\6fe3d257-ec40-432c-991e-c169ff0e1a97\.user_uploaded\media_1787299404768.jpg"
        if os.path.exists(src_path):
            shutil.copyfile(src_path, base_img_path)
            
    screen_path = "landing_screenshot.png"
    if not os.path.exists(screen_path):
        src_screen = r"C:\Users\priya\.gemini\antigravity-ide\brain\6fe3d257-ec40-432c-991e-c169ff0e1a97\.user_uploaded\media_1787299242772.png"
        if os.path.exists(src_screen):
            shutil.copyfile(src_screen, screen_path)
    
    if os.path.exists(base_img_path):
        img = Image.open(base_img_path).convert('RGBA')
        
        # 1. Dark variant for Hero / Closing slides (Navy blue blend)
        dark_overlay = Image.new('RGBA', img.size, (15, 23, 42, 195))
        img_dark = Image.alpha_composite(img, dark_overlay).convert('RGB')
        img_dark.save('bg_dark.jpg', quality=95)
        
        # 2. Light variant for Content slides (Soft white/ice-blue wash)
        light_overlay = Image.new('RGBA', img.size, (241, 245, 249, 215))
        img_light = Image.alpha_composite(img, light_overlay).convert('RGB')
        img_light.save('bg_light.jpg', quality=95)
        print("Background images prepared successfully!")

def create_presentation():
    prepare_background_images()
    
    prs = Presentation()
    # 16:9 Widescreen dimensions
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6] # blank slide layout

    # Professional Healthcare Color Palette
    NAVY_DARK = RGBColor(15, 23, 42)       # #0F172A - Deep Slate/Navy
    NAVY_BLUE = RGBColor(30, 41, 59)       # #1E293B
    PRIMARY_TEAL = RGBColor(13, 148, 136)  # #0D9488 - Teal
    TEAL_LIGHT = RGBColor(204, 251, 241)   # #CCFBF1 - Soft Teal badge
    CYAN_ACCENT = RGBColor(2, 132, 199)    # #0284C7 - Blue accent
    TEXT_DARK = RGBColor(30, 41, 59)       # #1E293B
    TEXT_MUTED = RGBColor(100, 116, 139)   # #64748B
    CARD_BG = RGBColor(255, 255, 255)      # White
    BORDER_COLOR = RGBColor(226, 232, 240) # #E2E8F0
    CORAL_RED = RGBColor(239, 68, 68)      # #EF4444

    def set_slide_background_image(slide, is_dark=False):
        img_file = 'bg_dark.jpg' if is_dark else 'bg_light.jpg'
        if os.path.exists(img_file):
            slide.shapes.add_picture(img_file, 0, 0, width=prs.slide_width, height=prs.slide_height)
        else:
            bg_shape = slide.shapes.add_shape(
                MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height
            )
            bg_shape.fill.solid()
            bg_shape.fill.fore_color.rgb = NAVY_DARK if is_dark else RGBColor(241, 245, 249)
            bg_shape.line.fill.background()

    def add_header(slide, title_text, category_text="5 KEY HOSPITAL USERS • HEALTHCARE SYSTEM"):
        # Top banner category badge
        badge = slide.shapes.add_shape(
            MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.4), Inches(4.8), Inches(0.35)
        )
        badge.fill.solid()
        badge.fill.fore_color.rgb = TEAL_LIGHT
        badge.line.color.rgb = PRIMARY_TEAL
        badge.line.width = Pt(1)
        tf_b = badge.text_frame
        tf_b.word_wrap = True
        p_b = tf_b.paragraphs[0]
        p_b.text = category_text.upper()
        p_b.font.size = Pt(11)
        p_b.font.bold = True
        p_b.font.color.rgb = PRIMARY_TEAL
        p_b.alignment = PP_ALIGN.CENTER

        # Main slide title
        tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.78), Inches(11.5), Inches(0.7))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = title_text
        p.font.size = Pt(25)
        p.font.bold = True
        p.font.color.rgb = NAVY_DARK

        # Subtle bottom line below header
        line = slide.shapes.add_shape(
            MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.5), Inches(11.73), Inches(0.02)
        )
        line.fill.solid()
        line.fill.fore_color.rgb = PRIMARY_TEAL
        line.line.fill.background()

    def add_card(slide, left, top, width, height, title, items, subtitle=None, border_color=PRIMARY_TEAL, title_color=PRIMARY_TEAL):
        card = slide.shapes.add_shape(
            MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height
        )
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = border_color
        card.line.width = Pt(1.5)

        offset_top = top + Inches(0.18)
        tb_hdr = slide.shapes.add_textbox(left + Inches(0.25), offset_top, width - Inches(0.5), Inches(0.4))
        tf_hdr = tb_hdr.text_frame
        tf_hdr.word_wrap = True
        p_hdr = tf_hdr.paragraphs[0]
        p_hdr.text = title
        p_hdr.font.size = Pt(17)
        p_hdr.font.bold = True
        p_hdr.font.color.rgb = title_color
        offset_top += Inches(0.38)

        if subtitle:
            tb_sub = slide.shapes.add_textbox(left + Inches(0.25), offset_top, width - Inches(0.5), Inches(0.32))
            tf_sub = tb_sub.text_frame
            tf_sub.word_wrap = True
            p_sub = tf_sub.paragraphs[0]
            p_sub.text = subtitle
            p_sub.font.size = Pt(12)
            p_sub.font.italic = True
            p_sub.font.color.rgb = TEXT_MUTED
            offset_top += Inches(0.35)

        tb_cnt = slide.shapes.add_textbox(left + Inches(0.25), offset_top, width - Inches(0.5), height - (offset_top - top) - Inches(0.15))
        tf_cnt = tb_cnt.text_frame
        tf_cnt.word_wrap = True
        tf_cnt.margin_left = tf_cnt.margin_right = tf_cnt.margin_top = tf_cnt.margin_bottom = 0

        for i, item in enumerate(items):
            p = tf_cnt.paragraphs[0] if i == 0 else tf_cnt.add_paragraph()
            p.text = f"• {item}"
            p.font.size = Pt(13)
            p.font.color.rgb = TEXT_DARK
            p.space_after = Pt(7)
            p.space_before = Pt(2)

    # -------------------------------------------------------------
    # SLIDE 1: Title Slide (Dark Hero Theme with Stethoscope BG)
    # -------------------------------------------------------------
    s1 = prs.slides.add_slide(blank_layout)
    set_slide_background_image(s1, is_dark=True)

    pill = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.2), Inches(1.2), Inches(4.8), Inches(0.45))
    pill.fill.solid()
    pill.fill.fore_color.rgb = PRIMARY_TEAL
    pill.line.fill.background()
    tf_p = pill.text_frame
    p_p = tf_p.paragraphs[0]
    p_p.text = "HEALTHCARE & EHR MANAGEMENT"
    p_p.font.size = Pt(13)
    p_p.font.bold = True
    p_p.font.color.rgb = RGBColor(255, 255, 255)
    p_p.alignment = PP_ALIGN.CENTER

    tb = s1.shapes.add_textbox(Inches(1.2), Inches(1.85), Inches(11.0), Inches(2.2))
    tf = tb.text_frame
    tf.word_wrap = True
    p1 = tf.paragraphs[0]
    p1.text = "Smart Hospital & Electronic\nHealth Records (EHR) System"
    p1.font.size = Pt(36)
    p1.font.bold = True
    p1.font.color.rgb = RGBColor(255, 255, 255)
    p1.space_after = Pt(12)

    p2 = tf.add_paragraph()
    p2.text = "An all-in-one digital platform designed for 5 Key Hospital Users: Admin, Technician, Doctor, Receptionist, and Patient."
    p2.font.size = Pt(16)
    p2.font.color.rgb = RGBColor(203, 213, 225)

    highlights = [
        ("5 Key Users", "Admin, Technician, Doctor, Receptionist, Patient"),
        ("Modern Tech Stack", "React 19, TypeScript, Tailwind v4, Django 5, DRF"),
        ("Cloud & Storage", "Supabase PostgreSQL & Cloudinary CDN")
    ]
    for idx, (head, desc) in enumerate(highlights):
        c_left = Inches(1.2 + idx * 3.8)
        box = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, c_left, Inches(4.7), Inches(3.5), Inches(1.5))
        box.fill.solid()
        box.fill.fore_color.rgb = NAVY_BLUE
        box.line.color.rgb = PRIMARY_TEAL
        box.line.width = Pt(1.5)
        
        tbox = s1.shapes.add_textbox(c_left + Inches(0.2), Inches(4.85), Inches(3.1), Inches(1.2))
        tframe = tbox.text_frame
        tframe.word_wrap = True
        ph = tframe.paragraphs[0]
        ph.text = head
        ph.font.size = Pt(15)
        ph.font.bold = True
        ph.font.color.rgb = RGBColor(45, 212, 191)
        
        pd = tframe.add_paragraph()
        pd.text = desc
        pd.font.size = Pt(12)
        pd.font.color.rgb = RGBColor(226, 232, 240)
        pd.space_before = Pt(4)

    # -------------------------------------------------------------
    # SLIDE 2: Project Overview & UI Showcase (Screenshot Embedded)
    # -------------------------------------------------------------
    s2 = prs.slides.add_slide(blank_layout)
    set_slide_background_image(s2, is_dark=False)
    add_header(s2, "Project Overview: Live Platform & Capabilities", "EXECUTIVE SUMMARY")

    add_card(
        s2, Inches(0.8), Inches(1.75), Inches(5.6), Inches(5.1),
        "What is this Project?",
        [
            "A modern web application digitizing hospital operations and Electronic Health Records (EHR).",
            "Designed for 5 Key Hospital Users: Admin, Technician, Doctor, Receptionist, and Patient.",
            "Enables rapid appointment booking across 3 modes: In-Clinic, Telephone, and Homecare visit.",
            "Replaces paper files with lifetime cloud health records in PostgreSQL.",
            "Equipped with live bed tracking (350 Beds / 45 ICU) and 24/7 emergency hotline integration."
        ],
        subtitle="Unifying hospital care into one single web platform"
    )

    # Right side: Show landing screenshot image
    if os.path.exists("landing_screenshot.png"):
        img_card = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.75), Inches(1.75), Inches(5.75), Inches(5.1))
        img_card.fill.solid()
        img_card.fill.fore_color.rgb = CARD_BG
        img_card.line.color.rgb = PRIMARY_TEAL
        img_card.line.width = Pt(1.5)
        
        tb_ui = s2.shapes.add_textbox(Inches(7.0), Inches(1.9), Inches(5.2), Inches(0.4))
        tf_ui = tb_ui.text_frame
        p_ui = tf_ui.paragraphs[0]
        p_ui.text = "Live Hospital Public Portal"
        p_ui.font.size = Pt(17)
        p_ui.font.bold = True
        p_ui.font.color.rgb = PRIMARY_TEAL
        
        s2.shapes.add_picture("landing_screenshot.png", Inches(7.0), Inches(2.4), width=Inches(5.25), height=Inches(2.65))
        
        tb_desc = s2.shapes.add_textbox(Inches(7.0), Inches(5.2), Inches(5.2), Inches(1.5))
        tf_desc = tb_desc.text_frame
        tf_desc.word_wrap = True
        pd1 = tf_desc.paragraphs[0]
        pd1.text = "• 350+ Smart Inpatient Beds (45+ ICU Units)"
        pd1.font.size = Pt(12)
        pd1.font.color.rgb = TEXT_DARK
        pd2 = tf_desc.add_paragraph()
        pd2.text = "• 45+ Senior Medical Specialists & 12 Ambulances"
        pd2.font.size = Pt(12)
        pd2.font.color.rgb = TEXT_DARK
        pd3 = tf_desc.add_paragraph()
        pd3.text = "• 24/7 Emergency Support (+91 98765 43211 / 102)"
        pd3.font.size = Pt(12)
        pd3.font.color.rgb = TEXT_DARK
    else:
        add_card(
            s2, Inches(6.8), Inches(1.75), Inches(5.7), Inches(5.1),
            "Main Goals of the Platform",
            [
                "Fast Patient Access: Book appointments in under 60 seconds from any mobile or PC.",
                "Zero Wait Confusion: Automated front-desk check-in, token queues, and vitals recording.",
                "Clear Medical Records: Lifetime access to prescriptions, diagnosis, and lab test results.",
                "Accurate Prescriptions: Itemized medicine dosages eliminate handwriting reading mistakes.",
                "Real-Time Hospital Control: Live tracking of 350 beds (45 ICU), 12 ambulances, and staff rosters."
            ],
            subtitle="Key targets achieved by this healthcare system"
        )

    # -------------------------------------------------------------
    # SLIDE 3: Problem vs. Solution
    # -------------------------------------------------------------
    s3 = prs.slides.add_slide(blank_layout)
    set_slide_background_image(s3, is_dark=False)
    add_header(s3, "Traditional Hospital Problems vs. Our Solution", "PROBLEM VS SOLUTION")

    add_card(
        s3, Inches(0.8), Inches(1.75), Inches(5.6), Inches(5.1),
        "Traditional Hospital Problems",
        [
            "Lost Paper Files: Patients carry paper folders that get lost, torn, or misplaced.",
            "Illegible Handwriting: Unclear doctor handwriting causes dangerous medicine dispensing errors.",
            "Crowded Front Desks: Long physical queues for walk-in registration and fee payment.",
            "Disconnected Staff: Doctors, technicians, and receptionists work in isolated manual silos.",
            "Blind Resource Management: Admins lack real-time visibility into ICU beds and ambulance readiness."
        ],
        subtitle="Daily bottlenecks in traditional paper hospitals",
        border_color=CORAL_RED,
        title_color=CORAL_RED
    )

    add_card(
        s3, Inches(6.8), Inches(1.75), Inches(5.7), Inches(5.1),
        "Our Smart Digital Solution",
        [
            "PostgreSQL Cloud EHR: 100% secure, permanent lifetime medical history in the cloud.",
            "Structured E-Prescriptions: Exact medicine names, dosages (500mg), frequencies (1-0-1), and meal advice.",
            "Instant Check-In: Receptionists register walk-ins and assign doctor queues in seconds.",
            "Integrated 5-User Portals: Real-time updates between patient, doctor, technician, reception, and admin.",
            "Live Admin Dashboards: Instant tracking of 350 beds, 45 ICU units, 12 ambulances, and revenue."
        ],
        subtitle="How our software solves every single bottleneck",
        border_color=PRIMARY_TEAL,
        title_color=PRIMARY_TEAL
    )

    # -------------------------------------------------------------
    # SLIDE 4: Exact Technology Stack
    # -------------------------------------------------------------
    s4 = prs.slides.add_slide(blank_layout)
    set_slide_background_image(s4, is_dark=False)
    add_header(s4, "Exact Technology Stack Used in the Project", "TECHNOLOGY STACK")

    tech_cards = [
        (Inches(0.8), Inches(1.75), Inches(2.7), Inches(5.1), "Frontend", "React 19 & TypeScript",
         ["React 19 (v19.0.1)", "TypeScript (v5.8.2)", "Vite 6 Fast Bundler", "Tailwind CSS v4", "Motion (Animations)", "Lucide React Icons", "Canvas-Confetti FX"]),
        (Inches(3.75), Inches(1.75), Inches(2.7), Inches(5.1), "Backend API", "Django & DRF",
         ["Django 5.x Framework", "Django REST (DRF)", "Python 3.x", "Mobile OTP Auth", "CORS Middleware", "WhiteNoise Static", "Gunicorn WSGI"]),
        (Inches(6.7), Inches(1.75), Inches(2.7), Inches(5.1), "Database", "Supabase PostgreSQL",
         ["Supabase Managed Cloud", "PostgreSQL Database", "dj-database-url & psycopg2", "SQLite Local Fallback", "Strict Foreign Keys", "Fast Query Indexing"]),
        (Inches(9.65), Inches(1.75), Inches(2.85), Inches(5.1), "Cloud & Media", "Cloudinary & Vercel",
         ["Cloudinary Media Storage", "Auto Base64 to CDN Upload", "Doctor/Staff Photos", "Medical Report Scans", "Vercel Cloud Hosting", "Full HTTPS / SSL"])
    ]

    for left, top, width, height, title, sub, bullets in tech_cards:
        add_card(s4, left, top, width, height, title, bullets, subtitle=sub)

    # -------------------------------------------------------------
    # SLIDE 5: System Architecture & Dual-Layer Data Flow
    # -------------------------------------------------------------
    s5 = prs.slides.add_slide(blank_layout)
    set_slide_background_image(s5, is_dark=False)
    add_header(s5, "System Architecture: Dual-Layer Data Sync", "ARCHITECTURE & DATA FLOW")

    add_card(
        s5, Inches(0.8), Inches(1.75), Inches(5.6), Inches(5.1),
        "Backend & Cloud Infrastructure",
        [
            "Django REST Framework: Provides RESTful API endpoints for appointments, prescriptions, labs, and staff.",
            "Supabase PostgreSQL: Central cloud database storing all persistent user profiles and clinical data.",
            "Cloudinary CDN: Safely stores prescription attachments, profile avatars, and diagnostic test scan files.",
            "OTP Auth Service: Generates random 6-digit verification codes sent to user mobile numbers.",
            "Vercel Serverless WSGI: Hosts the backend API with high uptime and low latency."
        ],
        subtitle="Cloud infrastructure handling storage and logic"
    )

    add_card(
        s5, Inches(6.8), Inches(1.75), Inches(5.7), Inches(5.1),
        "Frontend & Smart Dual-Layer Cache",
        [
            "React Context API (HospitalContext): Manages global state across all 5 user portals seamlessly.",
            "Automatic LocalStorage Sync: Saves appointments, prescriptions, and users locally in browser.",
            "Zero Downtime / Offline Fallback: If backend is offline, app continues working using local data!",
            "API Normalization Layer: Transforms backend database models into clean TypeScript interfaces.",
            "Instant UI Updates: State updates immediately without requiring manual page reloads."
        ],
        subtitle="Ensures blazing fast speed and 100% reliability"
    )

    # -------------------------------------------------------------
    # SLIDE 6: The 5 Key Hospital Users Overview
    # -------------------------------------------------------------
    s6 = prs.slides.add_slide(blank_layout)
    set_slide_background_image(s6, is_dark=False)
    add_header(s6, "The 5 Key Hospital Users & Portals", "CORE USERS")

    users_5 = [
        ("1. Patient", "Self-service care: Book appointments (Clinic, Phone, Homecare), view digital prescriptions, download lab test reports, and track lifetime medical history.", PRIMARY_TEAL),
        ("2. Doctor", "Clinical workspace: Manage daily patient queues, review medical history, create structured e-prescriptions, and order lab tests.", PRIMARY_TEAL),
        ("3. Receptionist", "Front-desk operations: Fast walk-in registration, check doctor availability roster, manage queue tokens, record vitals, and collect fees.", PRIMARY_TEAL),
        ("4. Technician", "Hospital operations & diagnostics: Manage staff roster (doctors, receptionists), upload avatars, configure shifts/fees, and process lab tests.", PRIMARY_TEAL),
        ("5. Admin", "Hospital governance: Real-time bed monitoring (350 Beds / 45 ICU), 12 ambulances, emergency hotlines, and hospital-wide analytics.", PRIMARY_TEAL),
    ]

    for idx in range(3):
        title, desc, color = users_5[idx]
        c_left = Inches(0.8 + idx * 3.95)
        c_top = Inches(1.75)
        card = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, c_left, c_top, Inches(3.75), Inches(2.35))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = color
        card.line.width = Pt(1.5)

        tb = s6.shapes.add_textbox(c_left + Inches(0.2), c_top + Inches(0.15), Inches(3.35), Inches(2.0))
        tf = tb.text_frame
        tf.word_wrap = True
        p_t = tf.paragraphs[0]
        p_t.text = title
        p_t.font.size = Pt(16)
        p_t.font.bold = True
        p_t.font.color.rgb = NAVY_DARK

        p_d = tf.add_paragraph()
        p_d.text = desc
        p_d.font.size = Pt(12)
        p_d.font.color.rgb = TEXT_MUTED
        p_d.space_before = Pt(6)

    for idx in range(3, 5):
        title, desc, color = users_5[idx]
        b_idx = idx - 3
        c_left = Inches(2.75 + b_idx * 4.0)
        c_top = Inches(4.35)
        card = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, c_left, c_top, Inches(3.85), Inches(2.35))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = color
        card.line.width = Pt(1.5)

        tb = s6.shapes.add_textbox(c_left + Inches(0.2), c_top + Inches(0.15), Inches(3.45), Inches(2.0))
        tf = tb.text_frame
        tf.word_wrap = True
        p_t = tf.paragraphs[0]
        p_t.text = title
        p_t.font.size = Pt(16)
        p_t.font.bold = True
        p_t.font.color.rgb = NAVY_DARK

        p_d = tf.add_paragraph()
        p_d.text = desc
        p_d.font.size = Pt(12)
        p_d.font.color.rgb = TEXT_MUTED
        p_d.space_before = Pt(6)

    # -------------------------------------------------------------
    # SLIDE 7: Passwordless Mobile OTP Authentication
    # -------------------------------------------------------------
    s7 = prs.slides.add_slide(blank_layout)
    set_slide_background_image(s7, is_dark=False)
    add_header(s7, "Passwordless Mobile OTP Authentication", "AUTHENTICATION SYSTEM")

    add_card(
        s7, Inches(0.8), Inches(1.75), Inches(5.6), Inches(5.1),
        "How Mobile OTP Login Works",
        [
            "Step 1 - Enter Phone Number: User enters their 10-digit mobile number on the login screen.",
            "Step 2 - Phone Verification: Backend checks `/api/auth/check-phone/` to see if user exists.",
            "Step 3 - OTP Generation: Server generates a 6-digit code via `/api/auth/send-otp/` and stores it in `OTPVerification` model.",
            "Step 4 - 6-Digit Code Verification: User enters code; server validates it via `/api/auth/verify-otp/`.",
            "Step 5 - Role-Based Routing: System directs user directly to their respective portal (Admin, Tech, Doctor, Receptionist, or Patient)."
        ],
        subtitle="Zero passwords to remember - fast & secure"
    )

    add_card(
        s7, Inches(6.8), Inches(1.75), Inches(5.7), Inches(5.1),
        "Why Mobile OTP is Ideal for Healthcare",
        [
            "Elderly & Patient Friendly: Patients do not need to memorize passwords or login emails.",
            "Unique Health Identifier: Mobile numbers act as a permanent key linking all patient visits.",
            "Auto-Profile Setup: New patients complete a quick 30-second form and are instantly registered.",
            "Fast Demo Switcher: Built-in quick switch buttons allow instant testing of all 5 hospital roles.",
            "Secure Verification: All OTP timestamps are recorded in the database for security compliance."
        ],
        subtitle="Designed for seamless hospital access"
    )

    # -------------------------------------------------------------
    # SLIDE 8: User 1 - Patient Portal
    # -------------------------------------------------------------
    s8 = prs.slides.add_slide(blank_layout)
    set_slide_background_image(s8, is_dark=False)
    add_header(s8, "User 1: Patient Portal (Self-Service Care)", "PATIENT EXPERIENCE")

    add_card(
        s8, Inches(0.8), Inches(1.75), Inches(5.6), Inches(5.1),
        "Booking Appointments (3 Visit Modes)",
        [
            "1. In-Clinic Visit: Book an in-person consultation at the hospital clinic.",
            "2. Telephone Consultation: Schedule a remote phone consultation with a specialist.",
            "3. Homecare Doctor Visit: Request a doctor or nurse to visit the patient's home address.",
            "Specialist Filter: Browse doctors by department (Cardiology, Neurology, Pediatrics, Orthopedics, etc.).",
            "Date & Time Slots: Choose convenient time slots with clear consultation fees (₹500 - ₹700).",
            "Booking Confirmation: Generates unique reference code (`KLP-APT-1001`) with celebration confetti!"
        ],
        subtitle="Fast, intuitive booking in under 60 seconds"
    )

    add_card(
        s8, Inches(6.8), Inches(1.75), Inches(5.7), Inches(5.1),
        "Digital Health Records & History",
        [
            "E-Prescription Viewer: View active medicines, exact dosages (500mg), schedules (1-0-1), and meal advice.",
            "Lab Test Results: Download diagnostic test reports with normal benchmarks and findings.",
            "Personal Medical Timeline: Permanent log of past illnesses, chronic conditions, and allergies.",
            "Payment Status: Track consultation fees and payment receipts (Paid / Pending).",
            "Emergency Quick Call: 1-click button to contact hospital emergency helpline (`+91 11 2678 9999 / 108`)."
        ],
        subtitle="Complete medical records in the patient's pocket"
    )

    # -------------------------------------------------------------
    # SLIDE 9: User 2 - Doctor Portal
    # -------------------------------------------------------------
    s9 = prs.slides.add_slide(blank_layout)
    set_slide_background_image(s9, is_dark=False)
    add_header(s9, "User 2: Doctor Portal (Clinical Workspace)", "DOCTOR WORKSPACE")

    add_card(
        s9, Inches(0.8), Inches(1.75), Inches(5.6), Inches(5.1),
        "Managing Daily Patient Queue",
        [
            "Today's Appointments: View list of patients scheduled for today with time slots and visit modes.",
            "Patient Context: Inspect patient's age, gender, symptoms, and initial vitals recorded by reception.",
            "Lifetime History Review: Access patient's previous diagnoses and past prescriptions before prescribing.",
            "Status Updates: Mark appointments as 'in-progress' or 'completed' in real time.",
            "Consultation Notes: Record diagnosis, clinical findings, dietary advice, and lifestyle guidelines."
        ],
        subtitle="Optimized for rapid, accurate clinical consultations"
    )

    add_card(
        s9, Inches(6.8), Inches(1.75), Inches(5.7), Inches(5.1),
        "Diagnostic Orders & Schedule Control",
        [
            "Order Lab Tests: Order Blood Tests, Lipid Profile, Thyroid, or X-Rays with 1 click.",
            "Review Lab Reports: View completed test findings submitted by technicians directly on screen.",
            "Abnormal Value Alert: High/low diagnostic readings are highlighted in red for doctor attention.",
            "Follow-Up Scheduling: Set scheduled follow-up visits (e.g. 'After 7 Days').",
            "Doctor Shift Settings: Configure active consultation days, working hours, and consultation fee."
        ],
        subtitle="Integrated clinical tools for high quality medical care"
    )

    # -------------------------------------------------------------
    # SLIDE 10: Structured E-Prescription System
    # -------------------------------------------------------------
    s10 = prs.slides.add_slide(blank_layout)
    set_slide_background_image(s10, is_dark=False)
    add_header(s10, "Structured E-Prescriptions: Zero Medicine Errors", "E-PRESCRIPTION SYSTEM")

    add_card(
        s10, Inches(0.8), Inches(1.75), Inches(5.6), Inches(5.1),
        "Itemized Medication Breakdown",
        [
            "Medicine Name: e.g., Amoxicillin, Paracetamol, Metformin, Telmisartan.",
            "Exact Dosage: Standard milligrams like 500mg, 10mg, 650mg (no ambiguity).",
            "Daily Frequency: Standard notation like 1-0-1 (Morning & Night) or 1-1-1.",
            "Duration: Specific treatment duration (e.g. 5 Days, 1 Month).",
            "Meal Instructions: Clear instructions like 'After Food', 'Before Meals', or 'With Warm Water'.",
            "Auto-Expiry: Prescriptions stay 'active' and auto-archive after completion."
        ],
        subtitle="Crystal-clear digital instructions for patients & doctors"
    )

    add_card(
        s10, Inches(6.8), Inches(1.75), Inches(5.7), Inches(5.1),
        "Why E-Prescriptions are Better",
        [
            "Unique Rx Identifier: Generates official code like `RX-KLP-2026-501`.",
            "No Lost Papers: Patients can open and show their prescription anytime from their smartphone.",
            "Printable & Shareable: Clean layout with hospital logo, doctor credentials (MBBS, MD), and date.",
            "Dietary Guidelines: Includes customized dietary advice and lifestyle notes.",
            "Follow-Up Date: Clearly displays the exact date the patient should return for a checkup."
        ],
        subtitle="Replacing illegible paper slips with permanent digital records"
    )

    # -------------------------------------------------------------
    # SLIDE 11: User 3 - Receptionist Portal
    # -------------------------------------------------------------
    s11 = prs.slides.add_slide(blank_layout)
    set_slide_background_image(s11, is_dark=False)
    add_header(s11, "User 3: Receptionist Portal (Front-Desk)", "FRONT-DESK OPERATIONS")

    add_card(
        s11, Inches(0.8), Inches(1.75), Inches(5.6), Inches(5.1),
        "Walk-In Patient Registration & Check-In",
        [
            "Rapid Walk-In Registration: Register new walk-in patients with name, mobile, age, gender, and address.",
            "Doctor Availability Roster: View real-time doctor shifts, duty status, and consultation fees.",
            "Queue Assignment: Assign walk-ins to available doctors and generate instant appointment tokens.",
            "Vitals Recording: Log Blood Pressure (BP), Pulse rate, Temperature, and Body Weight at check-in.",
            "Quick Patient Search: Find existing patient profiles by entering their phone number or booking ref."
        ],
        subtitle="Eliminating front-desk chaos and long waiting queues"
    )

    add_card(
        s11, Inches(6.8), Inches(1.75), Inches(5.7), Inches(5.1),
        "Billing & Queue Coordination",
        [
            "Fee Collection: Mark consultation fee as 'Paid' or 'Pending' and generate payment receipts.",
            "Appointment Rescheduling: Manage delayed or cancelled visits and reassign available doctors.",
            "Daily Footfall Summary: Monitor total patients checked in, ongoing visits, and completed OPD visits.",
            "Department Routing: Direct patients to Radiology, Pathology, or Inpatient wards smoothly.",
            "Emergency Escalation: Fast-track critical trauma patients directly to emergency duty doctors."
        ],
        subtitle="Connecting patient arrivals with doctors effortlessly"
    )

    # -------------------------------------------------------------
    # SLIDE 12: User 4 - Technician Portal
    # -------------------------------------------------------------
    s12 = prs.slides.add_slide(blank_layout)
    set_slide_background_image(s12, is_dark=False)
    add_header(s12, "User 4: Technician Portal (Staff & Diagnostics)", "TECHNICIAN WORKSPACE")

    add_card(
        s12, Inches(0.8), Inches(1.75), Inches(5.6), Inches(5.1),
        "Hospital Staff Roster Management",
        [
            "Doctor & Staff Roster CRUD: Add, edit, and toggle active status for Doctors and Receptionists.",
            "Shift & Working Hours: Configure shift timings (e.g. 09:00 AM - 05:00 PM) and consultation fees.",
            "Department & Specialization: Assign staff to Cardiology, Neurology, Pediatrics, Orthopedics, etc.",
            "Profile Photo Uploads: Auto-uploads staff photos to Cloudinary CDN for instant avatar generation.",
            "Staff Search & Filter: Search staff by name, staff ID, department, or active/inactive status."
        ],
        subtitle="Managing hospital medical staff and operational rosters"
    )

    add_card(
        s12, Inches(6.8), Inches(1.75), Inches(5.7), Inches(5.1),
        "Diagnostic & Laboratory Operations",
        [
            "Test Request Processing: View doctor lab orders across Pathology, Biochemistry, and Radiology.",
            "Result Entry: Enter exact numeric/text readings with standard medical measurement units.",
            "Reference Range Benchmark: Benchmark readings against standard ranges (e.g. 70 - 100 mg/dL).",
            "Automatic Abnormality Flag: Highlights abnormal values in bright red (`is_abnormal = True`).",
            "Cloud Sync: Completed test reports update instantly in Patient and Doctor portals."
        ],
        subtitle="Accurate testing, staff management, and digital reports"
    )

    # -------------------------------------------------------------
    # SLIDE 13: User 5 - Admin Portal
    # -------------------------------------------------------------
    s13 = prs.slides.add_slide(blank_layout)
    set_slide_background_image(s13, is_dark=False)
    add_header(s13, "User 5: Admin Portal (Hospital Management)", "ADMINISTRATION")

    add_card(
        s13, Inches(0.8), Inches(1.75), Inches(5.6), Inches(5.1),
        "Hospital Infrastructure & Capacity",
        [
            "Live Bed Tracking: Real-time monitor showing Total Beds (350), Occupied Beds (268), and ICU Beds (45).",
            "Emergency Ambulance Fleet: Live availability status of 12 hospital emergency ambulances.",
            "Department Directory: Oversee hospital specialties (Cardiology, Neurology, Pediatrics, Oncology, etc.).",
            "Emergency Hotline Settings: Configure 24/7 hospital emergency numbers (`+91 11 2678 9999 / 108`).",
            "Hospital Profile Management: Update hospital address, accreditation, and administrative credentials."
        ],
        subtitle="High-level visibility over hospital infrastructure"
    )

    add_card(
        s13, Inches(6.8), Inches(1.75), Inches(5.7), Inches(5.1),
        "Operational Analytics & Revenue",
        [
            "Patient Flow Analytics: Visual graphs of daily visits, new vs. returning patients, and monthly volume.",
            "Department Performance: Measure patient count across departments to optimize medical resources.",
            "Revenue & Billing Insights: Track total consultation fees collected and outstanding payment balances.",
            "System Audit & Logs: Monitor user logins, role switches, and database updates.",
            "Hospital Scalability: Add new clinics, branches, and departments as the hospital expands."
        ],
        subtitle="Data-driven management for maximum hospital efficiency"
    )

    # -------------------------------------------------------------
    # SLIDE 14: End-to-End Patient Journey
    # -------------------------------------------------------------
    s14 = prs.slides.add_slide(blank_layout)
    set_slide_background_image(s14, is_dark=False)
    add_header(s14, "End-to-End Workflow Across All 5 Users", "SYSTEM WORKFLOW")

    steps = [
        ("Step 1: Booking (Patient)", "Patient books online via portal or walks in with preferred doctor, visit mode & slot."),
        ("Step 2: Check-In (Receptionist)", "Receptionist registers patient, records vitals (BP/Pulse), and assigns queue token."),
        ("Step 3: Consultation (Doctor)", "Doctor examines patient, reviews medical history, and makes clinical diagnosis."),
        ("Step 4: E-Prescription (Doctor)", "Doctor generates structured e-prescription and orders required diagnostic tests."),
        ("Step 5: Diagnostics (Technician)", "Technician processes lab test, inputs values, and flags abnormal readings."),
        ("Step 6: Oversight (Admin)", "Admin monitors bed occupancy, patient analytics, and hospital performance.")
    ]

    for idx, (s_title, s_desc) in enumerate(steps):
        row = idx // 3
        col = idx % 3
        c_left = Inches(0.8 + col * 3.95)
        c_top = Inches(1.75 + row * 2.5)

        card = s14.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, c_left, c_top, Inches(3.75), Inches(2.25))
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        card.line.color.rgb = PRIMARY_TEAL
        card.line.width = Pt(1.5)

        s_badge = s14.shapes.add_shape(MSO_SHAPE.RECTANGLE, c_left, c_top, Inches(3.75), Inches(0.42))
        s_badge.fill.solid()
        s_badge.fill.fore_color.rgb = PRIMARY_TEAL
        s_badge.line.fill.background()
        tf_sb = s_badge.text_frame
        p_sb = tf_sb.paragraphs[0]
        p_sb.text = s_title.upper()
        p_sb.font.size = Pt(12)
        p_sb.font.bold = True
        p_sb.font.color.rgb = RGBColor(255, 255, 255)
        p_sb.alignment = PP_ALIGN.CENTER

        tb = s14.shapes.add_textbox(c_left + Inches(0.2), c_top + Inches(0.52), Inches(3.35), Inches(1.55))
        tf = tb.text_frame
        tf.word_wrap = True
        p_d = tf.paragraphs[0]
        p_d.text = s_desc
        p_d.font.size = Pt(13)
        p_d.font.color.rgb = TEXT_DARK

    # -------------------------------------------------------------
    # SLIDE 15: Database Schema & REST API Architecture
    # -------------------------------------------------------------
    s15 = prs.slides.add_slide(blank_layout)
    set_slide_background_image(s15, is_dark=False)
    add_header(s15, "Database Schema & RESTful API Architecture", "BACKEND ARCHITECTURE")

    add_card(
        s15, Inches(0.8), Inches(1.75), Inches(5.6), Inches(5.1),
        "Exact PostgreSQL Database Models",
        [
            "UserProfile: User ID, name, mobile, role (admin, tech, doctor, receptionist, patient), medical history.",
            "StaffMember: Staff ID, specialization, qualification, fees, shift timings, avatar, and active status.",
            "Appointment: Booking ref (`KLP-APT-XXXX`), patient/doctor IDs, visit mode, symptoms, status, fee, slot.",
            "Prescription: Rx number (`RX-KLP-XXXX`), patient/doctor IDs, diagnosis, medicines JSON array, diet advice.",
            "LabReport: Report number (`LAB-KLP-XXXX`), test name, results, reference range, units, and abnormal flag.",
            "Hospital: Bed capacity (350), ICU beds (45), ambulances (12), departments, and emergency phone.",
            "OTPVerification: Mobile number, generated 6-digit OTP code, and verification status."
        ],
        subtitle="Relational schema built for medical data integrity"
    )

    add_card(
        s15, Inches(6.8), Inches(1.75), Inches(5.7), Inches(5.1),
        "Exact REST API Endpoints",
        [
            "/api/auth/send-otp/ & verify-otp/ - Passwordless mobile authentication.",
            "/api/appointments/ - Create bookings, update statuses, and view schedules.",
            "/api/prescriptions/ - Add e-prescriptions and retrieve patient medications.",
            "/api/lab-reports/ - Submit diagnostic test results and check abnormality flags.",
            "/api/staff/ - Manage hospital doctors, receptionists, and technicians.",
            "/api/admin/overview/ - Hospital-wide stats, bed occupancy, and revenue overview.",
            "/api/upload-image/ - Auto-uploads image to Cloudinary and returns CDN URL."
        ],
        subtitle="Clean REST endpoints connecting frontend & backend"
    )

    # -------------------------------------------------------------
    # SLIDE 16: Key Benefits & Future Roadmap (Closing Slide)
    # -------------------------------------------------------------
    s16 = prs.slides.add_slide(blank_layout)
    set_slide_background_image(s16, is_dark=True)

    tb_c = s16.shapes.add_textbox(Inches(1.2), Inches(0.7), Inches(11.0), Inches(1.2))
    tf_c = tb_c.text_frame
    tf_c.word_wrap = True
    p_ct = tf_c.paragraphs[0]
    p_ct.text = "Key Benefits & Future Roadmap"
    p_ct.font.size = Pt(32)
    p_ct.font.bold = True
    p_ct.font.color.rgb = RGBColor(255, 255, 255)
    
    p_cs = tf_c.add_paragraph()
    p_cs.text = "Empowering 5 Key Hospital Users through modern digital healthcare software"
    p_cs.font.size = Pt(16)
    p_cs.font.color.rgb = RGBColor(203, 213, 225)
    p_cs.space_before = Pt(4)

    c1 = s16.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(1.2), Inches(2.1), Inches(5.3), Inches(4.7))
    c1.fill.solid()
    c1.fill.fore_color.rgb = NAVY_BLUE
    c1.line.color.rgb = PRIMARY_TEAL
    c1.line.width = Pt(1.5)

    tb1 = s16.shapes.add_textbox(Inches(1.5), Inches(2.3), Inches(4.7), Inches(4.3))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    p1 = tf1.paragraphs[0]
    p1.text = "Key Project Benefits"
    p1.font.size = Pt(20)
    p1.font.bold = True
    p1.font.color.rgb = RGBColor(45, 212, 191)
    
    sum_items = [
        "100% Paperless: All appointments, prescriptions, and lab tests stored in cloud.",
        "Zero Lost Records: Lifetime medical history accessible 24/7 on patient smartphones.",
        "Error-Free Prescriptions: Structured digital Rx eliminates pharmacy dispensing errors.",
        "Fast Hospital Flow: Reduces patient waiting times by over 60% with instant queues.",
        "5-User Synergy: Seamless connection between Admin, Tech, Doctor, Receptionist & Patient."
    ]
    for item in sum_items:
        p = tf1.add_paragraph()
        p.text = f"✔ {item}"
        p.font.size = Pt(13)
        p.font.color.rgb = RGBColor(241, 245, 249)
        p.space_before = Pt(8)

    c2 = s16.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(2.1), Inches(5.3), Inches(4.7))
    c2.fill.solid()
    c2.fill.fore_color.rgb = NAVY_BLUE
    c2.line.color.rgb = CYAN_ACCENT
    c2.line.width = Pt(1.5)

    tb2 = s16.shapes.add_textbox(Inches(7.1), Inches(2.3), Inches(4.7), Inches(4.3))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    p2 = tf2.paragraphs[0]
    p2.text = "Future Roadmap"
    p2.font.size = Pt(20)
    p2.font.bold = True
    p2.font.color.rgb = RGBColor(56, 189, 248)
    
    road_items = [
        "AI Symptom Checker: Automated triage suggesting relevant doctors and health tips.",
        "WebRTC Video Consultations: Direct live video calls inside Doctor & Patient portals.",
        "Smart IoT Vitals Integration: Automatic sync with digital blood pressure and heart rate monitors.",
        "Insurance & Mediclaim Sync: Instant digital claim submission and cashless approvals.",
        "Native Android & iOS Apps: Dedicated mobile app with push notifications for medicine timings."
    ]
    for item in road_items:
        p = tf2.add_paragraph()
        p.text = f"🚀 {item}"
        p.font.size = Pt(13)
        p.font.color.rgb = RGBColor(241, 245, 249)
        p.space_before = Pt(8)

    output_path = os.path.abspath("Healthcare_Project_Presentation.pptx")
    fallback_path = os.path.abspath("Healthcare_Project_Presentation_Updated.pptx")
    try:
        prs.save(output_path)
        print(f"Presentation saved successfully at: {output_path}")
    except PermissionError:
        prs.save(fallback_path)
        print(f"Primary file locked. Saved updated presentation at: {fallback_path}")

if __name__ == "__main__":
    create_presentation()
