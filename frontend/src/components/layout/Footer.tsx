import React from 'react';
import {
  HeartPulse,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  ChevronRight,
  Ambulance,
  Calendar
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

export const Footer: React.FC = () => {
  const { hospital, setActiveTab, openBookModal } = useHospital();

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setTimeout(() => {
      if (tabId === 'home') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const el = document.getElementById(tabId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, 50);
  };

  return (
    <footer className="bg-gradient-to-br from-[#E0F2FE] via-[#F0F9FF] to-[#E6F4FE] text-[#0C2B4E] border-t border-sky-200/80 selection:bg-[#0284C7] selection:text-white font-sans text-xs">
      {/* Compact Top Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          
          {/* Column 1 — Hospital Center */}
          <div className="space-y-2.5">
            <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => handleNavClick('home')}>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#123B5D] to-[#1769AA] flex items-center justify-center text-white shadow-xs overflow-hidden">
                {hospital.logo ? (
                  <img src={hospital.logo} alt={hospital.name || 'Hospital Logo'} className="w-full h-full object-cover" />
                ) : (
                  <HeartPulse className="w-4 h-4 text-[#38BDF8]" />
                )}
              </div>
              <span className="font-bold text-base tracking-tight text-[#0C2B4E]">
                {hospital.name || 'Healthcare Center'}
              </span>
            </div>
            <p className="text-[11px] text-[#334E68] leading-relaxed max-w-xs">
              {hospital.tagline || 'Trusted, patient-centered clinical care with experienced medical specialists and 24/7 support.'}
            </p>
            <div className="flex items-center space-x-1.5 text-[10px] text-[#0D9488] font-bold pt-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>NABH & JCI Accredited Hospital</span>
            </div>
          </div>

          {/* Column 2 — Quick Navigation */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[#0C2B4E] uppercase tracking-wider border-b border-sky-300/60 pb-1 inline-block">
              Quick Links
            </h3>
            <ul className="space-y-1.5 text-[11px] text-[#334E68]">
              {[
                { id: 'home', label: 'Home' },
                { id: 'about', label: 'About Hospital' },
                { id: 'services', label: 'Services' },
                { id: 'doctors', label: 'Doctors' },
                { id: 'contact', label: 'Contact Us' },
              ].map(link => (
                <li key={link.id}>
                  <button
                    onClick={() => handleNavClick(link.id)}
                    className="hover:text-[#0284C7] transition-colors flex items-center space-x-1 cursor-pointer text-[#334E68]"
                  >
                    <ChevronRight className="w-3 h-3 text-[#0284C7]" />
                    <span>{link.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Medical Services */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[#0C2B4E] uppercase tracking-wider border-b border-sky-300/60 pb-1 inline-block">
              Services
            </h3>
            <ul className="space-y-1.5 text-[11px] text-[#334E68]">
              {[
                'General OPD & Diagnostics',
                'Cardiology & Neurology',
                'Pathology & Radiology',
                '24/7 Critical ICU & Trauma',
                'Telemedicine Consultations'
              ].map((svc, idx) => (
                <li key={idx} className="flex items-center space-x-1 cursor-pointer hover:text-[#0284C7] transition-colors" onClick={() => handleNavClick('services')}>
                  <ChevronRight className="w-3 h-3 text-[#0284C7]" />
                  <span>{svc}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Contact & Emergency */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[#0C2B4E] uppercase tracking-wider border-b border-sky-300/60 pb-1 inline-block">
              Contact & Emergency
            </h3>
            <ul className="space-y-1.5 text-[11px] text-[#334E68]">
              <li className="flex items-start space-x-2">
                <MapPin className="w-3.5 h-3.5 text-[#0284C7] shrink-0 mt-0.5" />
                <span>123 Healthcare Blvd, Medical Zone</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
                <span>+91 98765 43210 (OPD Desk)</span>
              </li>
              <li className="flex items-center space-x-2">
                <Clock className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
                <span>OPD: 08:00 AM - 08:00 PM</span>
              </li>
              <li className="pt-1">
                <div className="bg-white/90 border border-sky-200 rounded-xl p-2 flex items-center space-x-2 shadow-2xs">
                  <Ambulance className="w-4 h-4 text-rose-600 shrink-0" />
                  <div>
                    <p className="text-[9px] uppercase font-bold text-rose-600">24/7 Emergency Line</p>
                    <p className="text-xs font-bold text-[#0C2B4E]">+91 98765 43211 / 102</p>
                  </div>
                </div>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Compact Footer Bottom Strip */}
      <div className="border-t border-sky-200/80 bg-[#D9EEFD]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#486581] gap-2">
          <p>© 2026 Healthcare Center. All rights reserved.</p>
          <div className="flex items-center space-x-4 font-medium">
            <span className="hover:text-[#0C2B4E] transition-colors cursor-pointer" onClick={() => alert("Privacy Policy: Healthcare Center ensures strict HIPAA & patient data security.")}>Privacy</span>
            <span className="hover:text-[#0C2B4E] transition-colors cursor-pointer" onClick={() => alert("Terms: All treatments follow standard hospital clinical guidelines.")}>Terms</span>
            <span className="hover:text-[#0C2B4E] transition-colors cursor-pointer" onClick={() => alert("Accessibility: Designed with universal accessibility standards.")}>Accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
