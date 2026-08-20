import React from 'react';
import {
  LayoutDashboard,
  Calendar,
  Users,
  FileText,
  Settings,
  ShieldCheck,
  UserPlus,
  Receipt,
  Activity,
  User,
  Stethoscope,
  LogOut,
  CalendarPlus,
  ClipboardList,
  Building2,
  Clock,
  Sparkles,
  X
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { UserRole } from '../../types';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface PortalSidebarProps {
  currentSubTab?: string;
  onSelectSubTab?: (tabId: string) => void;
  onClose?: () => void;
  isMobileDrawer?: boolean;
}

export const PortalSidebar: React.FC<PortalSidebarProps> = ({
  currentSubTab,
  onSelectSubTab,
  onClose,
  isMobileDrawer = false
}) => {
  const {
    currentUser,
    currentRole,
    staff,
    users,
    activeTab,
    setActiveTab,
    logout
  } = useHospital();

  // Generate Clean Menu Items for the 5 Dedicated Roles (No Badges / Numbers)
  const getMenuItems = (): SidebarItem[] => {
    switch (currentRole) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'patients', label: 'Patient Directory', icon: User },
          { id: 'doctors', label: 'Doctors', icon: Stethoscope },
          { id: 'receptionists', label: 'Receptionists', icon: Users },
          { id: 'technicians', label: 'Technicians', icon: ShieldCheck }
        ];

      case 'technician':
        return [
          { id: 'doctors', label: 'Doctor Roster & Profiles', icon: Stethoscope },
          { id: 'receptionists', label: 'Receptionist Roster', icon: Users },
          { id: 'overview', label: 'Operations & Staff Stats', icon: LayoutDashboard }
        ];

      case 'doctor':
        return [
          { id: 'dashboard', label: 'Consultation Desk', icon: Stethoscope },
          { id: 'patient-history', label: 'Patient Directory & Records', icon: FileText },
          { id: 'write-rx', label: 'Write Rx & Generate PDF', icon: ClipboardList },
          { id: 'visit-logs', label: 'Patient Visit Logs', icon: Clock },
          { id: 'settings', label: 'Doctor Profile Settings', icon: Settings }
        ];

      case 'receptionist':
        return [
          { id: 'overview', label: 'Reception Overview', icon: LayoutDashboard },
          { id: 'register-patient', label: 'Register Walk-in Patient', icon: UserPlus },
          { id: 'appointments', label: "Today's OPD Queue", icon: Calendar },
          { id: 'patient-records', label: 'Patient Records & Rx Slips', icon: FileText },
          { id: 'billing', label: 'OPD Billing & Invoices', icon: Receipt }
        ];

      case 'patient':
        return [
          { id: 'dashboard', label: 'Health & Active Treatment', icon: Activity },
          { id: 'book', label: 'Book Appointment', icon: CalendarPlus },
          { id: 'history', label: 'Prescriptions & Reports', icon: FileText },
          { id: 'medical-history', label: 'Past Surgeries & History', icon: ClipboardList },
          { id: 'settings', label: 'My Patient Profile', icon: User }
        ];

      default:
        return [
          { id: 'dashboard', label: 'Overview', icon: LayoutDashboard }
        ];
    }
  };

  const handleLogout = () => {
    logout();
    if (onClose) {
      onClose();
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

  const menuItems = getMenuItems();
  const currentActive = currentSubTab || activeTab;

  const handleTabClick = (itemId: string) => {
    if (onSelectSubTab) {
      onSelectSubTab(itemId);
    }
    setActiveTab(itemId);
    if (onClose) {
      onClose();
    }
  };

  const handleLogoutClick = () => {
    logout();
    if (onClose) {
      onClose();
    }
  };

  const getRoleHeaderTitle = () => {
    switch (currentRole) {
      case 'admin': return { title: 'Admin Master Hub', subtitle: 'Hospital & System Governance' };
      case 'technician': return { title: 'Technician Hub', subtitle: 'Staff Roster & Operations' };
      case 'doctor': return { title: 'Doctor Console', subtitle: 'Clinical & Consultation' };
      case 'receptionist': return { title: 'Reception Desk', subtitle: 'Patient Intake & Queue' };
      case 'patient': return { title: 'Patient Portal', subtitle: 'Personal Health Records' };
      default: return { title: 'Portal Workspace', subtitle: 'EHR Workspace' };
    }
  };

  const roleInfo = getRoleHeaderTitle();

  return (
    <aside className={`w-full bg-white/95 backdrop-blur-md flex flex-col justify-between select-none shrink-0 overflow-y-auto transition-all duration-300 ${
      isMobileDrawer
        ? 'h-full border-none shadow-none rounded-none'
        : 'lg:w-72 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04),0_8px_24px_-6px_rgba(18,59,93,0.06)] lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] self-start'
    }`}>
      {/* Top Section */}
      <div className="p-3.5 sm:p-4 space-y-4">
        
        {/* Workspace Title */}
        <div className="pb-3 border-b border-slate-100/90 flex items-center justify-between">
          <div className="min-w-0">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#123B5D] truncate">
              {roleInfo.title}
            </h2>
            <p className="text-[10px] text-slate-400 truncate">
              {roleInfo.subtitle}
            </p>
          </div>
          {isMobileDrawer && onClose && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Close Menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* User Mini Profile Card */}
        <div className="flex items-center space-x-3 rounded-2xl bg-[#F8FAFC]/90 border border-slate-100 p-2.5 shadow-2xs">
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-gradient-to-br from-[#123B5D] to-[#1769AA] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs border border-white/20">
            {userPhoto ? (
              <img src={userPhoto} alt={currentUser?.fullName || 'User'} className="w-full h-full object-cover" />
            ) : (
              (currentUser?.fullName?.charAt(0) || 'U').toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#123B5D] truncate">{currentUser?.fullName}</p>
            <p className="text-[10px] text-slate-400 font-mono truncate">
              {currentUser?.doctorId || currentUser?.patientId || currentUser?.staffId || currentUser?.id}
            </p>
          </div>
        </div>

        {/* Navigation Menu Options (Clean, No Badges) */}
        <nav className="space-y-1.5 pt-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentActive === item.id || (item.id === 'dashboard' && (currentActive === 'home' || currentActive === 'overview'));

            return (
              <button
                key={item.id}
                id={`sidebar-item-${item.id}`}
                onClick={() => handleTabClick(item.id)}
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

      {/* Bottom Log Out Section */}
      <div className="p-3.5 sm:p-4 border-t border-slate-100/90">
        <button
          id="sidebar-logout-btn"
          onClick={handleLogoutClick}
          className="w-full flex items-center px-3.5 py-2.5 space-x-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-100/80 transition-all duration-200 cursor-pointer active:scale-[0.97] shadow-2xs hover:shadow-xs"
          title="Log Out of Portal"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Log Out of Portal</span>
        </button>
      </div>
    </aside>
  );
};
