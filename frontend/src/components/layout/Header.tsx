import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  HeartPulse,
  Calendar,
  User,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronDown,
  Phone,
  Clock,
  ShieldCheck,
  ChevronRight,
  LayoutDashboard,
  Building2,
  Stethoscope,
  Users,
  CheckCheck
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { PortalSidebar } from './PortalSidebar';

export const Header: React.FC = () => {
  const {
    currentUser,
    currentRole,
    staff,
    users,
    activeTab,
    setActiveTab,
    openAuthModal,
    openBookModal,
    logout,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    hospital
  } = useHospital();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobilePortalMenuOpen, setMobilePortalMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const isManualScrollRef = useRef(false);

  // Close mobile drawer on tab or user change
  useEffect(() => {
    setMobilePortalMenuOpen(false);
    setMobileMenuOpen(false);
  }, [activeTab, currentUser]);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Active Scroll-Spy for Guest Landing Page Sections (60fps smooth scroll detection)
  useEffect(() => {
    if (currentUser) return;

    let ticking = false;
    const handleScrollSpy = () => {
      if (isManualScrollRef.current) return;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 10);
          const sections = ['contact', 'doctors', 'services', 'about', 'home'];
          const scrollPosition = window.scrollY + 140;

          for (const sectionId of sections) {
            const el = document.getElementById(sectionId);
            if (el) {
              const top = el.offsetTop;
              if (scrollPosition >= top) {
                setActiveTab(sectionId);
                break;
              }
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, [currentUser, setActiveTab]);

  const unreadNotifs = notifications.filter(n => !n.isRead);

  const publicNavLinks = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'about', label: 'About Hospital', icon: Building2 },
    { id: 'services', label: 'Services', icon: Stethoscope },
    { id: 'doctors', label: 'Doctors', icon: Users },
    { id: 'contact', label: 'Contact Us', icon: Phone },
  ];

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    setMobilePortalMenuOpen(false);
    isManualScrollRef.current = true;

    if (tabId === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(tabId);
      if (element) {
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }

    setTimeout(() => {
      isManualScrollRef.current = false;
    }, 850);
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'admin': return 'Hospital Director / Admin';
      case 'technician': return 'Systems Technician';
      case 'doctor': return 'Doctor / Specialist';
      case 'receptionist': return 'Receptionist';
      case 'patient': return 'Registered Patient';
      default: return 'Healthcare User';
    }
  };

  // Dynamically resolve freshest profile photo from staff or users list
  const staffMember = staff.find(s => 
    (currentUser?.staffId && (s.staffId === currentUser.staffId || s.id === currentUser.staffId)) ||
    (currentUser?.id && (s.id === currentUser.id || s.staffId === currentUser.id)) ||
    (currentUser?.fullName && (s.fullName === currentUser.fullName || s.name === currentUser.fullName)) ||
    (currentRole === 'technician' && (s.type === 'technician' || s.staffType === 'technician'))
  );

  const matchedUser = users.find(u => 
    (currentUser?.id && u.id === currentUser.id) ||
    (currentUser?.mobile && u.mobile === currentUser.mobile) ||
    (currentUser?.fullName && u.fullName === currentUser.fullName) ||
    (currentRole === 'technician' && u.role === 'technician')
  );

  const userPhoto = staffMember?.profilePhoto || matchedUser?.profilePhoto || matchedUser?.avatar || currentUser?.profilePhoto || (currentUser as any)?.avatar || '';

  return (
    <header className="fixed top-0 left-0 right-0 z-40 w-full transition-all duration-300 backdrop-blur-md backdrop-saturate-150 bg-white/90 border-b border-slate-200/80 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
      <div className="w-full max-w-[1920px] mx-auto px-3 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        
        {/* LEFT: Hospital Branding */}
        <div 
          onClick={() => currentUser ? setActiveTab('dashboard') : handleNavClick('home')}
          className="flex items-center space-x-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#123B5D] to-[#1769AA] text-white flex items-center justify-center shadow-md shadow-[#1769AA]/20 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
            {hospital.logo ? (
              <img src={hospital.logo} alt={hospital.name || 'Hospital Logo'} className="w-full h-full object-cover" />
            ) : (
              <HeartPulse className="w-5 h-5 text-[#38BDF8]" />
            )}
          </div>
          <div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#123B5D] group-hover:text-[#1769AA] transition-colors">
              {hospital.name || 'Healthcare Center'}
            </span>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest hidden sm:block">
              Multispeciality Medical Portal
            </p>
          </div>
        </div>

        {/* CENTER: Navigation Links (Only for Unauthenticated Public Guests on Desktop) */}
        {!currentUser && (
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {publicNavLinks.map((link) => (
              <button
                key={link.id}
                id={`nav-${link.id}`}
                onClick={() => handleNavClick(link.id)}
                className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  activeTab === link.id
                    ? 'text-[#1769AA] bg-sky-50 shadow-2xs font-bold border border-sky-100'
                    : 'text-slate-600 hover:text-[#123B5D] hover:bg-slate-100/60'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>
        )}

        {/* RIGHT: Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">

          {/* Notifications Dropdown (When Authenticated) */}
          {currentUser && (
            <div className="relative" ref={notifRef}>
              <button
                id="notif-toggle-btn"
                onClick={() => {
                  setNotifDropdownOpen(!notifDropdownOpen);
                  setUserDropdownOpen(false);
                }}
                className="relative p-2.5 text-[#123B5D] hover:text-[#1769AA] hover:bg-slate-100 rounded-xl transition-colors border border-slate-200 cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifs.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E11D48] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {notifDropdownOpen && (
                <div className="fixed inset-x-3 top-18 sm:top-auto sm:inset-auto sm:absolute sm:right-0 sm:mt-2 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 animate-fadeIn max-h-[85vh] flex flex-col">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-[#1769AA]" />
                      <h4 className="font-bold text-xs sm:text-sm text-[#123B5D]">Notifications</h4>
                      {unreadNotifs.length > 0 && (
                        <span className="text-[10px] font-bold text-[#1769AA] bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                          {unreadNotifs.length} New
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {unreadNotifs.length > 0 && (
                        <button
                          id="mark-all-read-btn"
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAllNotificationsAsRead();
                          }}
                          className="text-[11px] font-bold text-[#1769AA] hover:text-[#123B5D] hover:bg-sky-50 px-2 py-1 rounded-lg border border-sky-200/80 flex items-center space-x-1 cursor-pointer transition-colors"
                          title="Mark all notifications as read"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Mark Read</span>
                        </button>
                      )}
                      <button
                        id="notif-close-btn"
                        type="button"
                        onClick={() => setNotifDropdownOpen(false)}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                        title="Close Notifications"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-72 sm:max-h-80 overflow-y-auto divide-y divide-slate-100 py-1 text-xs">
                    {notifications.length === 0 ? (
                      <p className="text-slate-500 py-6 text-center">No notifications right now.</p>
                    ) : (
                      notifications.slice(0, 6).map(notif => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markNotificationAsRead(notif.id);
                            if (notif.link) setActiveTab(notif.link);
                            setNotifDropdownOpen(false);
                          }}
                          className={`py-2.5 px-2.5 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors ${
                            !notif.isRead ? 'bg-sky-50/60' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <p className="font-bold text-[#123B5D]">{notif.title}</p>
                            <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                              {new Date(notif.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-0.5 line-clamp-2">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile Pill & Secure Dropdown - Desktop Only (Hidden on Mobile) */}
          {currentUser && (
            <div className="hidden lg:block relative" ref={userMenuRef}>
              <button
                id="user-menu-btn"
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setNotifDropdownOpen(false);
                }}
                className="flex items-center space-x-2.5 bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200/80 p-1.5 pr-3 rounded-xl transition-all duration-200 cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#123B5D] text-white flex items-center justify-center font-bold text-xs shrink-0 border border-slate-300">
                  {userPhoto ? (
                    <img src={userPhoto} alt={currentUser.fullName} className="w-full h-full object-cover" />
                  ) : (
                    (currentUser.fullName.charAt(0) || 'U').toUpperCase()
                  )}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-xs font-bold text-[#123B5D] line-clamp-1 max-w-[130px]">
                    {currentUser.fullName}
                  </p>
                  <p className="text-[10px] text-[#64748B] font-mono">
                    {currentUser.doctorId || currentUser.patientId || currentUser.staffId || currentUser.role}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-fadeIn text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center space-x-3 mb-2">
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#123B5D] text-white flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200">
                      {userPhoto ? (
                        <img src={userPhoto} alt={currentUser.fullName} className="w-full h-full object-cover" />
                      ) : (
                        (currentUser.fullName.charAt(0) || 'U').toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-[#123B5D] truncate">{currentUser.fullName}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.mobile || currentUser.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200">
                        {getRoleDisplayName(currentUser.role)}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 mt-1">
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center space-x-2 cursor-pointer transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out of Portal</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Guest Action: Login / Sign In Button - Desktop Only (Hidden on Mobile where Hamburger is used) */}
          {!currentUser && (
            <button
              id="header-login-btn"
              onClick={() => openAuthModal()}
              className="hidden md:flex items-center space-x-1.5 apple-btn-primary px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-xs"
            >
              <User className="w-4 h-4" />
              <span>Login / Sign In</span>
            </button>
          )}

          {/* Mobile Hamburger Button for Logged-In Portal Users */}
          {currentUser && (
            <button
              id="mobile-portal-sidebar-btn"
              onClick={() => setMobilePortalMenuOpen(!mobilePortalMenuOpen)}
              className="lg:hidden p-2 text-[#123B5D] hover:bg-slate-100 rounded-xl border border-slate-200 cursor-pointer flex items-center justify-center transition-colors shadow-2xs"
              title="Open Portal Side Menu"
            >
              {mobilePortalMenuOpen ? <X className="w-5 h-5 text-rose-600" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          {/* Mobile Menu Hamburger (Only for Unauthenticated Guests on Mobile) */}
          {!currentUser && (
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#123B5D] hover:bg-slate-100 rounded-xl border border-slate-200 cursor-pointer"
              title="Open Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Guest Mobile Right-Side Sidebar Drawer (Identical Look & Feel to Logged-in Portal Sidebar) */}
      {mobileMenuOpen && !currentUser && createPortal(
        <div className="md:hidden fixed inset-0 z-[9999] flex justify-end">
          {/* Dark Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fadeIn"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Right-Side Drawer Container */}
          <div className="relative w-[85%] max-w-xs h-full bg-white shadow-2xl overflow-y-auto border-l border-slate-200 animate-slideInRight z-10 flex flex-col justify-between p-4">
            {/* Top Section */}
            <div className="space-y-4">
              {/* Workspace Title & Close button */}
              <div className="pb-3 border-b border-slate-100/90 flex items-center justify-between">
                <div className="min-w-0">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#123B5D] truncate">
                    {hospital.name || 'Healthcare Center'}
                  </h2>
                  <p className="text-[10px] text-slate-400 truncate">
                    Public Portal & Services
                  </p>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Close Menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Guest Profile Card */}
              <div className="flex items-center space-x-3 rounded-2xl bg-[#F8FAFC]/90 border border-slate-100 p-2.5 shadow-2xs">
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-br from-[#123B5D] to-[#1769AA] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs border border-white/20">
                  <User className="w-5 h-5 text-[#38BDF8]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#123B5D] truncate">Guest Visitor</p>
                  <p className="text-[10px] text-slate-400 font-mono truncate">
                    Public Access
                  </p>
                </div>
              </div>

              {/* Navigation Menu Options */}
              <nav className="space-y-1.5 pt-1">
                {publicNavLinks.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`sidebar-item-${item.id}`}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer group active:scale-[0.97] justify-between ${
                        isActive
                          ? 'bg-gradient-to-r from-[#123B5D] to-[#1769AA] text-white shadow-md shadow-[#1769AA]/20 -translate-r-0.5'
                          : 'text-slate-600 hover:text-[#123B5D] hover:bg-slate-100/70 hover:translate-x-0.5'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-[#38BDF8]' : 'text-slate-400 group-hover:text-[#1769AA]'
                        }`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Login Action */}
            <div className="p-1 border-t border-slate-100/90 mt-4">
              <button
                id="sidebar-guest-login-btn"
                onClick={() => {
                  setMobileMenuOpen(false);
                  openAuthModal();
                }}
                className="w-full apple-btn-primary py-2.5 px-3.5 rounded-2xl text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer shadow-md active:scale-[0.97]"
              >
                <User className="w-4 h-4 shrink-0" />
                <span>Login / Sign In</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Mobile Right-Side Portal Sidebar Drawer (Mounted to document.body via createPortal) */}
      {mobilePortalMenuOpen && currentUser && createPortal(
        <div className="lg:hidden fixed inset-0 z-[9999] flex justify-end">
          {/* Dark Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fadeIn"
            onClick={() => setMobilePortalMenuOpen(false)}
          />

          {/* Right-Side Drawer Container */}
          <div className="relative w-[85%] max-w-xs h-full bg-white shadow-2xl overflow-y-auto border-l border-slate-200 animate-slideInRight z-10 flex flex-col justify-between p-4">
            <PortalSidebar
              currentSubTab={activeTab}
              onSelectSubTab={(tabId) => setActiveTab(tabId)}
              onClose={() => setMobilePortalMenuOpen(false)}
              isMobileDrawer={true}
            />
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};
