import React from 'react';
import {
  LayoutDashboard,
  Users,
  Settings,
  Stethoscope
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';

interface DoctorNavTabsProps {
  currentTab: 'dashboard' | 'patient-history' | 'settings';
}

export const DoctorNavTabs: React.FC<DoctorNavTabsProps> = ({ currentTab }) => {
  const { setActiveTab } = useHospital();

  const tabs = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: LayoutDashboard,
      desc: 'Appointments & OPD Queue'
    },
    {
      id: 'patient-history' as const,
      label: 'Patient History',
      icon: Users,
      desc: 'Prescriptions & Lab Reports'
    },
    {
      id: 'settings' as const,
      label: 'Doctor Settings',
      icon: Settings,
      desc: 'Profile & OPD Schedule'
    }
  ];

  return (
    <div className="bg-white rounded-3xl p-2 sm:p-2.5 border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-2 mb-6">
      <div className="hidden lg:flex items-center space-x-2 pl-3 pr-4 border-r border-slate-100 text-[#0A2540]">
        <div className="w-7 h-7 rounded-lg bg-[#F0F9FF] text-[#0071E3] flex items-center justify-center">
          <Stethoscope className="w-4 h-4" />
        </div>
        <span className="text-xs font-bold tracking-wide uppercase">Doctor Consultation Desk</span>
      </div>

      <div className="flex flex-1 items-center space-x-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`doctor-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 active:scale-[0.98] ${
                isActive
                  ? 'bg-[#0A2540] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-[#F8FAFC]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#0071E3]' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
