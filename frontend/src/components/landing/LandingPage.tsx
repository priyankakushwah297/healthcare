import React from 'react';
import {
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  Users,
  Award,
  Calendar,
  PhoneCall,
  Clock,
  MapPin,
  Mail,
  ChevronRight,
  Activity,
  CheckCircle2,
  Ambulance,
  Sparkles,
  ArrowRight,
  User,
  Building
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

export const LandingPage: React.FC = () => {
  const { currentUser, openAuthModal, openBookModal, setActiveTab, staff, hospital } = useHospital();

  const doctorList = staff.filter(s => (s.staffType || s.type) === 'doctor');

  const handleConsultationClick = () => {
    if (!currentUser) {
      openAuthModal();
    } else {
      openBookModal();
    }
  };

  return (
    <div className="space-y-20 sm:space-y-24 animate-fadeIn font-sans bg-[#F7FAFC] text-[#1E293B] pb-12">
      
      {/* HERO SECTION - Premium Serene Light Blue Medical Aesthetic */}
      <section id="home" className="scroll-mt-24 pt-2 pb-2">
        <div className="relative rounded-3xl p-8 sm:p-12 text-[#0C2B4E] shadow-[0_12px_40px_-10px_rgba(2,132,199,0.12)] border border-sky-200/80 bg-gradient-to-br from-[#E0F2FE] via-[#F0F9FF] to-[#E6F4FE] overflow-hidden space-y-8">
          
          {/* Subtle Ambient Light Blue Glow Flares */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Pill Badge */}
          <div className="relative z-10">
            <div className="inline-flex items-center space-x-2 bg-white/90 text-[#0284C7] px-4 py-1.5 rounded-full text-xs font-bold border border-sky-300/80 shadow-2xs backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-[#0284C7]" />
              <span>NABH & JCI Accredited Super-Speciality Medical Care</span>
            </div>
          </div>

          {/* Main Hero Heading & Subtitle */}
          <div className="relative z-10 space-y-4 max-w-3xl">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#0C2B4E] tracking-tight leading-[1.15]">
              Healthcare crafted with{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0284C7] via-[#0D9488] to-[#2563EB]">
                precision &amp; empathy.
              </span>
            </h1>

            <p className="text-sm sm:text-base text-[#334E68] leading-relaxed max-w-2xl font-medium">
              Welcome to {hospital.name || 'Healthcare Center'}. World-class clinical diagnostics, distinguished specialists, and compassionate 24/7 patient support designed seamlessly around your health.
            </p>
          </div>

          {/* 3 Action Buttons */}
          <div className="relative z-10 flex flex-wrap items-center gap-4 pt-2">
            <button
              id="hero-book-appointment-btn"
              onClick={handleConsultationClick}
              className="apple-btn-primary px-6 py-3.5 rounded-xl text-sm font-semibold shadow-md shadow-sky-500/25 flex items-center space-x-2 cursor-pointer active:scale-[0.98]"
            >
              <Calendar className="w-4 h-4 text-[#38BDF8]" />
              <span>Book Appointment</span>
            </button>

            <button
              id="hero-patient-login-btn"
              onClick={() => openAuthModal()}
              className="bg-white hover:bg-sky-50/80 text-[#0C2B4E] border border-sky-200 shadow-2xs hover:shadow-xs px-6 py-3.5 rounded-xl text-sm font-semibold transition-all backdrop-blur-md flex items-center space-x-2 cursor-pointer active:scale-[0.98]"
            >
              <User className="w-4 h-4 text-[#0284C7]" />
              <span>Patient Portal</span>
            </button>

            <a
              href="tel:102"
              className="bg-rose-50 hover:bg-rose-100/80 text-rose-700 border border-rose-200 px-5 py-3.5 rounded-xl text-sm font-semibold transition-all flex items-center space-x-2 cursor-pointer active:scale-[0.98] shadow-2xs"
            >
              <PhoneCall className="w-4 h-4 text-rose-600" />
              <span>24/7 Emergency: +91 98765 43211 / 102</span>
            </a>
          </div>

          {/* Bottom 4 Stat Counters */}
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-sky-200/80">
            <div className="p-4 bg-white/80 hover:bg-white rounded-2xl border border-sky-100 shadow-xs transition-all duration-300 backdrop-blur-md">
              <p className="text-2xl sm:text-3xl font-extrabold text-[#0C2B4E] tracking-tight">350+</p>
              <p className="text-xs text-[#486581] font-semibold mt-1">Smart Inpatient Beds</p>
            </div>
            <div className="p-4 bg-white/80 hover:bg-white rounded-2xl border border-sky-100 shadow-xs transition-all duration-300 backdrop-blur-md">
              <p className="text-2xl sm:text-3xl font-extrabold text-[#0C2B4E] tracking-tight">45+</p>
              <p className="text-xs text-[#486581] font-semibold mt-1">Senior Specialists</p>
            </div>
            <div className="p-4 bg-white/80 hover:bg-white rounded-2xl border border-sky-100 shadow-xs transition-all duration-300 backdrop-blur-md">
              <p className="text-2xl sm:text-3xl font-extrabold text-[#0D9488] tracking-tight">99.4%</p>
              <p className="text-xs text-[#486581] font-semibold mt-1">Clinical Satisfaction</p>
            </div>
            <div className="p-4 bg-white/80 hover:bg-white rounded-2xl border border-sky-100 shadow-xs transition-all duration-300 backdrop-blur-md">
              <p className="text-2xl sm:text-3xl font-extrabold text-[#0284C7] tracking-tight">24/7</p>
              <p className="text-xs text-[#486581] font-semibold mt-1">Trauma &amp; ICU Support</p>
            </div>
          </div>

        </div>
      </section>

      {/* ABOUT US SECTION */}
      <section id="about" className="scroll-mt-24 pt-4 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1769AA] bg-[#E8F6F6] px-3 py-1 rounded-full border border-[#159A9C]/30">
            About {hospital.name || 'Healthcare Center'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#123B5D]">Serving Patients with Compassion &amp; Excellence</h2>
          <p className="text-sm text-[#64748B] max-w-2xl mx-auto">
            Established with a mission to deliver world-class medical treatments, state-of-the-art diagnostic facilities, and seamless digital healthcare experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#E8F6F6] text-[#1769AA] flex items-center justify-center border border-[#159A9C]/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#123B5D]">Certified Quality Care</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Equipped with international quality protocols and board-certified medical specialists across major departments.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#E8F6F6] text-[#1769AA] flex items-center justify-center border border-[#159A9C]/30">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#123B5D]">Experienced Specialists</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Our multidisciplinary team of senior doctors, surgeons, and nurses provide personalized patient care plans.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-[#E8F6F6] text-[#1769AA] flex items-center justify-center border border-[#159A9C]/30">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#123B5D]">Modern Medical Technology</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Advanced pathology lab, automated digital prescriptions, 24/7 ICU support, and telemetry monitoring systems.
            </p>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section id="services" className="scroll-mt-24 pt-4 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1769AA] bg-[#E8F6F6] px-3 py-1 rounded-full border border-[#159A9C]/30">
            Our Medical Services
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#123B5D]">Comprehensive Clinical Specialties</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'General Consultation', desc: 'Routine health checkups, preventative diagnostics, and primary medical care.' },
            { title: 'Specialist Care', desc: 'Expert consultations in Cardiology, Orthopedics, Pediatrics, and Dermatology.' },
            { title: 'Diagnostic Services', desc: 'State-of-the-art pathology testing, lipid profiles, ECG, and digital radiology.' },
            { title: 'Emergency Care', desc: '24/7 trauma response, ambulance support, and critical care ICU unit.' },
            { title: 'Home Healthcare', desc: 'Qualified doctor and nursing visits for seniors and recovering patients.' },
            { title: 'Telemedicine', desc: 'Secure video and telephone medical consultations from the comfort of home.' },
          ].map((svc, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-xs space-y-3 hover:border-[#1769AA] transition-colors">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-base text-[#123B5D]">{svc.title}</h3>
                <CheckCircle2 className="w-4 h-4 text-[#159A9C]" />
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">{svc.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DOCTORS SECTION (DYNAMICALLY SYNCED WITH TECHNICIAN STAFF MANAGEMENT) */}
      <section id="doctors" className="scroll-mt-24 pt-4 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1769AA] bg-[#E8F6F6] px-3 py-1 rounded-full border border-[#159A9C]/30">
            Our Senior Consultants
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#123B5D]">Meet Our Expert Physicians</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(doctorList.length > 0 ? doctorList : [
            { name: 'Dr. Arvind Sharma', specialization: 'Senior Cardiologist', experience: '18 Years', department: 'Cardiology' },
            { name: 'Dr. Priya Varma', specialization: 'Consultant Neurosurgeon', experience: '14 Years', department: 'Neurology' },
            { name: 'Dr. Vivek Menon', specialization: 'Senior Physician', experience: '16 Years', department: 'General Medicine' },
          ]).map((doc: any, idx: number) => {
            const dName = doc.fullName || doc.name || 'Doctor';
            const dPhoto = doc.profilePhoto || doc.avatar || '';
            const dSpec = doc.specialization || doc.roleTitle || 'Specialist';
            const dDept = doc.department || 'General';
            const dExp = doc.experience || 'Experienced';

            return (
              <div key={doc.id || idx} className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-4 hover:border-[#1769AA] hover:shadow-md transition-all">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#123B5D] text-white flex items-center justify-center font-bold text-lg overflow-hidden border-2 border-[#159A9C]/40 shrink-0 shadow-xs">
                    {dPhoto ? (
                      <img src={dPhoto} alt={dName} className="w-full h-full object-cover" />
                    ) : (
                      (dName.charAt(4) || dName.charAt(0) || 'D').toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#123B5D]">{dName}</h3>
                    <p className="text-xs text-[#1769AA] font-semibold">{dSpec}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-[#64748B] pt-1 border-t border-[#E2E8F0]">
                  <span>{dDept}</span>
                  <span className="font-semibold text-[#123B5D]">{dExp}</span>
                </div>
                <button
                  onClick={handleConsultationClick}
                  className="w-full apple-btn-primary py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Appointment</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="scroll-mt-24 pt-4 bg-white rounded-2xl p-8 border border-[#E2E8F0] shadow-xs space-y-6">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1769AA] bg-[#E8F6F6] px-3 py-1 rounded-full border border-[#159A9C]/30">
            Contact Hospital Desk
          </span>
          <h2 className="text-2xl font-bold text-[#123B5D]">Get in Touch with {hospital.name || 'Healthcare Center'}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#1E293B]">
          <div className="p-4 bg-[#F7FAFC] rounded-xl border border-[#E2E8F0] space-y-2">
            <MapPin className="w-5 h-5 text-[#1769AA]" />
            <h4 className="font-bold text-[#123B5D]">Hospital Location</h4>
            <p className="text-[#64748B]">123 Healthcare Blvd, Medical Zone, City</p>
          </div>

          <div className="p-4 bg-[#F7FAFC] rounded-xl border border-[#E2E8F0] space-y-2">
            <PhoneCall className="w-5 h-5 text-[#1769AA]" />
            <h4 className="font-bold text-[#123B5D]">Phone Support</h4>
            <p className="text-[#64748B]">+91 98765 43210 (OPD Desk)</p>
          </div>

          <div className="p-4 bg-[#F7FAFC] rounded-xl border border-[#E2E8F0] space-y-2">
            <Mail className="w-5 h-5 text-[#1769AA]" />
            <h4 className="font-bold text-[#123B5D]">Email Support</h4>
            <p className="text-[#64748B]">support@healthcare.com</p>
          </div>
        </div>
      </section>

    </div>
  );
};
