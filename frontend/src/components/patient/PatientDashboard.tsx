import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Pill,
  Bell,
  Clock,
  User,
  PlusCircle,
  FileText,
  CheckCircle2,
  PhoneCall,
  Home,
  Building,
  ArrowRight,
  ShieldCheck,
  Download,
  AlertCircle,
  CalendarPlus,
  RefreshCw,
  XCircle,
  Stethoscope,
  ChevronRight,
  HeartPulse,
  Award,
  Activity,
  AlertTriangle,
  ClipboardList,
  Printer,
  MapPin
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { ReportViewerModal } from '../common/ReportViewerModal';
import { PrescriptionPDFModal } from '../doctor/PrescriptionPDFModal';
import { Prescription, LabReport, Appointment } from '../../types';
import { PortalSidebar } from '../layout/PortalSidebar';
import { PatientBookAppointment } from './PatientBookAppointment';
import { PatientHistory } from './PatientHistory';
import { PatientSettings } from './PatientSettings';

export const PatientDashboard: React.FC = () => {
  const {
    currentUser,
    appointments,
    prescriptions,
    labReports,
    notifications,
    openBookModal,
    activeTab,
    setActiveTab,
    markNotificationAsRead,
    updateAppointmentStatus,
    hospital
  } = useHospital();

  const [selectedSubTab, setSelectedSubTab] = useState<string>(() => {
    return (activeTab && ['dashboard', 'book', 'history', 'medical-history', 'settings'].includes(activeTab)) ? activeTab : 'dashboard';
  });

  useEffect(() => {
    if (activeTab && ['dashboard', 'book', 'history', 'medical-history', 'settings'].includes(activeTab)) {
      setSelectedSubTab(activeTab);
    }
  }, [activeTab]);

  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [selectedLabReport, setSelectedLabReport] = useState<LabReport | null>(null);
  const [modalType, setModalType] = useState<'prescription' | 'lab_report'>('prescription');
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfRx, setPdfRx] = useState<Prescription | null>(null);
  const [aptHistorySearchTerm, setAptHistorySearchTerm] = useState('');
  const [aptHistoryStatusFilter, setAptHistoryStatusFilter] = useState('all');

  const currentView = selectedSubTab;

  // Filter patient's data
  const myAppointments = appointments.filter(
    a => a.patientId === currentUser?.id || a.patientMobile === currentUser?.mobile || a.patientName === currentUser?.fullName
  );

  const upcomingAndTodayAppointments = myAppointments.filter(
    a => a.status === 'upcoming' || a.status === 'today' || a.status === 'pending' || a.status === 'scheduled' || a.status === 'Scheduled'
  );

  const cleanUserMob = (currentUser?.mobile || (currentUser as any)?.mobileNumber || '').replace(/[^0-9]/g, '');

  const myPrescriptions = prescriptions.filter(p => {
    if (!currentUser) return false;
    const cleanRxMob = (p.patientMobile || '').replace(/[^0-9]/g, '');
    return (
      p.patientId === currentUser.id ||
      (currentUser.patientId && p.patientId === currentUser.patientId) ||
      (p.patientName && currentUser.fullName && p.patientName.trim().toLowerCase() === currentUser.fullName.trim().toLowerCase()) ||
      (cleanUserMob && cleanRxMob && cleanUserMob === cleanRxMob)
    );
  });

  const activePrescriptions = myPrescriptions.filter(p => p.status === 'active' || p.status === 'Active');

  const myLabReports = labReports.filter(l => {
    if (!currentUser) return false;
    return (
      l.patientId === currentUser.id ||
      (currentUser.patientId && l.patientId === currentUser.patientId) ||
      (l.patientName && currentUser.fullName && l.patientName.trim().toLowerCase() === currentUser.fullName.trim().toLowerCase())
    );
  });

  const myNotifications = notifications.filter(
    n => n.userId === currentUser?.id || n.userId === 'all'
  );

  const handleOpenPdfModal = (rx: Prescription) => {
    setPdfRx(rx);
    setIsPdfModalOpen(true);
  };

  const handleViewPrescription = (rx: Prescription) => {
    setSelectedPrescription(rx);
    setModalType('prescription');
    setIsViewerOpen(true);
  };

  const handleViewLabReport = (lr: LabReport) => {
    setSelectedLabReport(lr);
    setModalType('lab_report');
    setIsViewerOpen(true);
  };

  const handleCancelAppointment = (aptId: string) => {
    if (confirm('Are you sure you want to cancel this scheduled appointment?')) {
      updateAppointmentStatus(aptId, 'cancelled');
    }
  };

  // Patient Health Tracker Info
  const treatmentDept = currentUser?.currentTreatmentDepartment || 'Cardiology';
  const treatmentType = currentUser?.treatmentType || 'Cardiovascular Care & Pharmacotherapy';
  const diagnosis = currentUser?.currentDiagnosis || 'Primary Essential Hypertension';
  const treatmentStatus = currentUser?.treatmentStatus || 'Active';
  const startDate = currentUser?.treatmentStartDate || '10 Jan 2026';
  const overallCondition = currentUser?.overallHealthCondition || 'Stable with regular blood pressure tracking and prescribed medications.';
  const pastSurgeriesList = currentUser?.pastSurgeries || ['Appendectomy (Laparoscopic, 2019)', 'Right Knee Meniscus Repair (2022)'];
  const previousDiseasesList = currentUser?.previousDiseases || ['Acute Viral Bronchitis (2021)', 'Enteric Fever (2017)'];
  const chronicConditionsList = currentUser?.chronicConditions || ['Stage 1 Systemic Hypertension', 'Borderline Dyslipidemia'];
  const allergiesList = currentUser?.allergies || ['Penicillin G', 'Sulfa Antibiotics'];

  return (
    <div className="flex flex-col lg:flex-row items-start gap-6 animate-fadeIn font-sans text-[#1E293B]">
      {/* LEFT: Unified Role Sidebar (Hidden on mobile, Drawer opened from top-right Hamburger) */}
      <div className="hidden lg:block lg:w-72 shrink-0 lg:sticky lg:top-20 self-start z-20">
        <PortalSidebar
          currentSubTab={currentView}
          onSelectSubTab={(tabId) => {
            setSelectedSubTab(tabId);
            setActiveTab(tabId);
          }}
        />
      </div>

      {/* RIGHT: Dynamic Portal Sub-View */}
      <div className="flex-1 w-full min-w-0 space-y-6">
        
        {/* SUB-VIEW 1: BOOK APPOINTMENT */}
        {currentView === 'book' && (
          <PatientBookAppointment hideTabs={true} />
        )}

        {/* SUB-VIEW 2: PRESCRIPTIONS & REPORTS */}
        {currentView === 'history' && (
          <PatientHistory hideTabs={true} />
        )}

        {/* SUB-VIEW 3: PROFILE SETTINGS */}
        {currentView === 'settings' && (
          <PatientSettings hideTabs={true} />
        )}

        {/* SUB-VIEW 4: PAST MEDICAL HISTORY & SURGERIES */}
        {currentView === 'medical-history' && (
          <div className="space-y-6">

            {/* Medical History Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Past Surgeries & Procedures */}
              <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-3">
                <h3 className="font-bold text-sm text-[#123B5D] flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-purple-600" />
                  <span>Past Surgeries &amp; Hospital Procedures</span>
                </h3>
                <div className="space-y-2">
                  {pastSurgeriesList.map((surg, idx) => (
                    <div key={idx} className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 flex items-center justify-between text-xs">
                      <span className="font-semibold text-purple-900">{surg}</span>
                      <span className="text-[10px] bg-purple-200/60 text-purple-800 px-2 py-0.5 rounded font-bold">Documented</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Previous Diseases */}
              <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-3">
                <h3 className="font-bold text-sm text-[#123B5D] flex items-center space-x-2">
                  <HeartPulse className="w-4 h-4 text-[#C0392B]" />
                  <span>Previous Diseases &amp; Recovered Illnesses</span>
                </h3>
                <div className="space-y-2">
                  {previousDiseasesList.map((dis, idx) => (
                    <div key={idx} className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 flex items-center justify-between text-xs">
                      <span className="font-semibold text-rose-900">{dis}</span>
                      <span className="text-[10px] bg-rose-200/60 text-rose-800 px-2 py-0.5 rounded font-bold">Resolved</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chronic Conditions */}
              <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-3">
                <h3 className="font-bold text-sm text-[#123B5D] flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  <span>Chronic Conditions Under Management</span>
                </h3>
                <div className="space-y-2">
                  {chronicConditionsList.map((cond, idx) => (
                    <div key={idx} className="p-3 bg-sky-50/50 rounded-xl border border-sky-100 flex items-center justify-between text-xs">
                      <span className="font-semibold text-sky-900">{cond}</span>
                      <span className="text-[10px] bg-sky-200/60 text-sky-800 px-2 py-0.5 rounded font-bold">Monitoring</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Known Allergies */}
              <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-3">
                <h3 className="font-bold text-sm text-[#123B5D] flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Known Drug &amp; Environmental Allergies</span>
                </h3>
                <div className="space-y-2">
                  {allergiesList.map((allg, idx) => (
                    <div key={idx} className="p-3 bg-amber-50/50 rounded-xl border border-amber-100 flex items-center justify-between text-xs">
                      <span className="font-semibold text-amber-900">{allg}</span>
                      <span className="text-[10px] bg-amber-200/60 text-amber-800 px-2 py-0.5 rounded font-bold">High Alert</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Total Appointment History */}
            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
                <h3 className="font-bold text-sm text-[#123B5D]">
                  Complete Hospital Appointment Logs ({myAppointments.length} Visits Total)
                </h3>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-60">
                    <input
                      type="text"
                      placeholder="Search doctor, department, notes..."
                      value={aptHistorySearchTerm}
                      onChange={(e) => setAptHistorySearchTerm(e.target.value)}
                      className="w-full px-3 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs"
                    />
                  </div>
                  <select
                    value={aptHistoryStatusFilter}
                    onChange={(e) => setAptHistoryStatusFilter(e.target.value)}
                    className="px-2.5 py-1.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#1E293B]"
                  >
                    <option value="all">All Status</option>
                    <option value="today">Today</option>
                    <option value="completed">Completed</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] border-b border-slate-200 text-[#64748B] font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Consulting Doctor</th>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Symptoms / Reason</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myAppointments.filter(a => {
                      const matchesSearch = !aptHistorySearchTerm ||
                        a.doctorName.toLowerCase().includes(aptHistorySearchTerm.toLowerCase()) ||
                        a.department.toLowerCase().includes(aptHistorySearchTerm.toLowerCase()) ||
                        (a.symptoms && a.symptoms.toLowerCase().includes(aptHistorySearchTerm.toLowerCase()));
                      const matchesStatus = aptHistoryStatusFilter === 'all' || a.status === aptHistoryStatusFilter;
                      return matchesSearch && matchesStatus;
                    }).map((a) => (
                      <tr key={a.id}>
                        <td className="py-2.5 px-3 font-semibold text-[#123B5D]">{a.date}</td>
                        <td className="py-2.5 px-3 font-bold text-[#1E293B]">{a.doctorName}</td>
                        <td className="py-2.5 px-3 text-[#64748B]">{a.department}</td>
                        <td className="py-2.5 px-3">{a.visitMode}</td>
                        <td className="py-2.5 px-3 text-[#64748B] max-w-xs truncate">{a.symptoms}</td>
                        <td className="py-2.5 px-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                            a.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                            a.status === 'today' ? 'bg-sky-100 text-sky-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SUB-VIEW 5: HEALTH & ACTIVE TREATMENT DASHBOARD (DEFAULT) */}
        {currentView === 'dashboard' && (
          <div className="space-y-6">
            {/* Scheduled Appointments Section */}
            <div className="apple-card p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-sm text-[#123B5D] flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-[#1769AA]" />
                  <span>Scheduled &amp; Upcoming Appointments ({upcomingAndTodayAppointments.length})</span>
                </h3>
                <button
                  onClick={() => setSelectedSubTab('book')}
                  className="apple-btn-primary px-4 py-2 text-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Book New</span>
                </button>
              </div>

              {upcomingAndTodayAppointments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcomingAndTodayAppointments.map((apt) => (
                    <div key={apt.id} className="p-5 rounded-2xl border border-slate-200/80 bg-[#F8FAFC]/80 hover:bg-white hover:shadow-md transition-all duration-300 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-mono font-bold bg-[#E8F6F6] text-[#1769AA] px-2.5 py-0.5 rounded-full">
                            {apt.bookingRef}
                          </span>
                          <h4 className="font-bold text-sm text-[#123B5D] mt-1.5">{apt.doctorName}</h4>
                          <p className="text-xs text-[#1769AA] font-semibold">{apt.department} • {apt.doctorSpecialization || 'Consultant'}</p>
                        </div>
                        <span className="text-[10px] font-bold bg-emerald-100/80 text-emerald-800 px-3 py-1 rounded-full uppercase tracking-wider">
                          {apt.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-[#64748B]">
                        <div className="flex items-center space-x-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#1769AA]" />
                          <span className="font-semibold text-[#1E293B]">{apt.timeSlot}</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#1769AA]" />
                          <span className="font-semibold text-[#1E293B]">{apt.date}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
                        <span className="text-[#64748B]">Mode: <strong className="text-[#1E293B]">{apt.visitMode}</strong></span>
                        <button
                          onClick={() => handleCancelAppointment(apt.id)}
                          className="text-rose-600 hover:text-rose-800 font-semibold cursor-pointer transition-colors"
                        >
                          Cancel Booking
                        </button>
                      </div>

                      {apt.visitMode === 'Homecare' && (apt.homeLocation || apt.notes) && (
                        <div className="p-2 bg-[#E8F6F6] rounded-xl border border-[#159A9C]/30 text-[11px] text-[#123B5D] flex items-start space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#159A9C] shrink-0 mt-0.5" />
                          <span className="truncate"><strong>Address:</strong> {apt.homeLocation || apt.notes?.replace('Home Visit Address: ', '')}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50/80 rounded-2xl border border-dashed border-slate-200">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-[#123B5D]">No Upcoming Appointments Scheduled</p>
                  <p className="text-[11px] text-[#64748B] mt-0.5">Click "Book New" above to schedule a consultation with any hospital specialist.</p>
                </div>
              )}
            </div>

            {/* Active Prescriptions & Official PDF Downloads */}
            <div className="apple-card p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-sm text-[#123B5D] flex items-center space-x-2">
                  <Pill className="w-4 h-4 text-[#1769AA]" />
                  <span>Current Active Prescriptions &amp; Official Medical Slips</span>
                </h3>
                <span className="text-xs text-[#1769AA] font-bold bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
                  {myPrescriptions.length} Prescriptions On File
                </span>
              </div>

              {myPrescriptions.length > 0 ? (
                <div className="space-y-3">
                  {myPrescriptions.map((rx) => (
                    <div key={rx.id} className="p-5 rounded-2xl border border-slate-200/80 bg-[#F8FAFC]/80 hover:bg-white hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-[#1769AA]">{rx.prescriptionNumber}</span>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                            {rx.status || 'Active'}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-[#123B5D]">{rx.diagnosis}</h4>
                        <p className="text-xs text-[#64748B]">
                          Prescribed by <strong className="text-[#1E293B]">{rx.doctorName}</strong> ({rx.doctorSpecialization}) • Date: {rx.date}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {rx.medicines?.map(m => m.name).join(', ')}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          onClick={() => handleOpenPdfModal(rx)}
                          className="apple-btn-primary px-4 py-2 text-xs flex items-center space-x-1.5 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>View Official PDF Slip</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center bg-slate-50/80 rounded-2xl text-xs text-[#64748B] border border-dashed border-slate-200">
                  No active prescriptions found.
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Official Prescription PDF Viewer & Print Modal */}
      <PrescriptionPDFModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        prescription={pdfRx}
        hospital={hospital}
      />

      {/* Standard Viewer Modal */}
      <ReportViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        type={modalType}
        prescription={selectedPrescription}
        labReport={selectedLabReport}
      />
    </div>
  );
};
