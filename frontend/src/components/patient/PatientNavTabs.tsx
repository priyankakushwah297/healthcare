import React from 'react';
import {
  LayoutDashboard,
  CalendarPlus,
  History,
  Settings,
  User,
  ShieldCheck
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

interface PatientNavTabsProps {
  currentTab: 'dashboard' | 'book-appointment' | 'history' | 'settings';
}

export const PatientNavTabs: React.FC<PatientNavTabsProps> = ({ currentTab }) => {
  const { setActiveTab, currentUser } = useHospital();

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & Appointments'
    },
    {
      id: 'book-appointment',
      label: 'Book Appointment',
      icon: CalendarPlus,
      description: 'New OPD & Homecare'
    },
    {
      id: 'history',
      label: 'History',
      icon: History,
      description: 'Prescriptions & Reports'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      description: 'Profile & Security'
    }
  ];

  return (
    <div className="bg-white rounded-3xl p-2.5 sm:p-3 border border-slate-200/80 shadow-xs mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-slate-100 px-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#F0F9FF] text-[#0071E3] flex items-center justify-center font-bold">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-[#0A2540] uppercase tracking-wider">
                Patient Portal
              </span>
              <span className="text-[10px] bg-[#F0F9FF] text-[#0071E3] font-semibold px-2 py-0.5 rounded-full border border-sky-100">
                {currentUser?.patientId || 'PAT-2026-1001'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-normal">
              {currentUser?.fullName || 'Priyanka Kushwah'} • {currentUser?.gender || 'Female'}, {currentUser?.dobOrAge || '28 Yrs'}
            </p>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 hidden md:block">
          Hospital Support: <strong className="text-slate-800">+91 11 2678 9999</strong>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              id={`patient-nav-tab-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-2.5 p-2.5 sm:p-3 rounded-2xl transition-all duration-200 text-left cursor-pointer active:scale-[0.98] ${
                isActive
                  ? 'bg-[#0A2540] text-white shadow-sm'
                  : 'bg-[#F8FAFC] hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                isActive ? 'bg-[#0071E3] text-white' : 'bg-white text-slate-500 shadow-2xs'
              }`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <p className="font-bold text-xs truncate leading-tight">{item.label}</p>
                <p className={`text-[10px] truncate leading-tight mt-0.5 ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                  {item.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
