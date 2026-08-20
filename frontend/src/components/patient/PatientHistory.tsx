import React, { useState } from 'react';
import {
  FileText,
  Pill,
  Calendar,
  Activity,
  Download,
  Eye,
  Search,
  CheckCircle2,
  Clock,
  Building,
  PhoneCall,
  Home,
  ShieldCheck,
  AlertCircle,
  Stethoscope,
  Filter,
  Printer,
  Heart,
  Plus
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { ReportViewerModal } from '../common/ReportViewerModal';
import { Prescription, LabReport, Appointment } from '../../types';
import { PatientNavTabs } from './PatientNavTabs';

export const PatientHistory: React.FC<{ hideTabs?: boolean }> = ({ hideTabs }) => {
  const {
    currentUser,
    prescriptions,
    labReports,
    appointments,
    medicalHistory
  } = useHospital();

  const [activeSubTab, setActiveSubTab] = useState<'prescriptions' | 'lab_reports' | 'appointments' | 'medical_records'>('prescriptions');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Report Modal
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  const [selectedLabReport, setSelectedLabReport] = useState<LabReport | null>(null);
  const [modalType, setModalType] = useState<'prescription' | 'lab_report'>('prescription');
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const cleanUserMob = (currentUser?.mobile || (currentUser as any)?.mobileNumber || '').replace(/[^0-9]/g, '');

  // Filter for current patient with flexible ID, name, or phone matching
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

  const myLabReports = labReports.filter(l => {
    if (!currentUser) return false;
    return (
      l.patientId === currentUser.id ||
      (currentUser.patientId && l.patientId === currentUser.patientId) ||
      (l.patientName && currentUser.fullName && l.patientName.trim().toLowerCase() === currentUser.fullName.trim().toLowerCase())
    );
  });

  const myAppointments = appointments.filter(
    a => a.patientId === currentUser?.id || a.patientMobile === currentUser?.mobile
  );

  const myMedicalRecords = medicalHistory.filter(
    m => m.patientId === currentUser?.id || m.patientId === 'usr-patient-1'
  );

  const handleOpenPrescription = (rx: Prescription) => {
    setSelectedPrescription(rx);
    setModalType('prescription');
    setIsViewerOpen(true);
  };

  const handleOpenLabReport = (lr: LabReport) => {
    setSelectedLabReport(lr);
    setModalType('lab_report');
    setIsViewerOpen(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn text-[#1E293B] font-sans">
      {!hideTabs && <PatientNavTabs currentTab="history" />}

      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-[#159A9C] uppercase tracking-wider">
            Patient Medical Records Archive
          </span>
          <h2 className="text-xl font-bold text-[#123B5D] mt-0.5">
            Complete Medical & Clinical History
          </h2>
          <p className="text-xs text-[#64748B]">
            Patient: <strong className="text-[#1E293B]">{currentUser?.fullName}</strong> ({currentUser?.patientId || 'PAT-2026-1001'})
          </p>
        </div>

        {/* Search Filter */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search medicines, doctors, reports..."
            className="w-full pl-9 pr-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] focus:border-[#1769AA] rounded-xl text-xs text-[#1E293B] outline-hidden"
          />
        </div>
      </div>

      {/* Sub Tabs: Prescription History | Lab Report History | Appointment History | Medical History */}
      <div className="flex border-b border-[#E2E8F0] space-x-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveSubTab('prescriptions')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center space-x-2 transition-colors cursor-pointer shrink-0 ${
            activeSubTab === 'prescriptions'
              ? 'bg-[#1769AA] text-white shadow-xs'
              : 'bg-white text-[#123B5D] hover:bg-[#E8F6F6] border border-[#E2E8F0]'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Prescription History ({myPrescriptions.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('lab_reports')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center space-x-2 transition-colors cursor-pointer shrink-0 ${
            activeSubTab === 'lab_reports'
              ? 'bg-[#1769AA] text-white shadow-xs'
              : 'bg-white text-[#123B5D] hover:bg-[#E8F6F6] border border-[#E2E8F0]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Lab Report History ({myLabReports.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('appointments')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center space-x-2 transition-colors cursor-pointer shrink-0 ${
            activeSubTab === 'appointments'
              ? 'bg-[#1769AA] text-white shadow-xs'
              : 'bg-white text-[#123B5D] hover:bg-[#E8F6F6] border border-[#E2E8F0]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Appointment History ({myAppointments.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('medical_records')}
          className={`px-4 py-2.5 text-xs font-bold rounded-xl flex items-center space-x-2 transition-colors cursor-pointer shrink-0 ${
            activeSubTab === 'medical_records'
              ? 'bg-[#1769AA] text-white shadow-xs'
              : 'bg-white text-[#123B5D] hover:bg-[#E8F6F6] border border-[#E2E8F0]'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Medical Diagnoses & Vitals ({myMedicalRecords.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: PRESCRIPTION HISTORY */}
      {/* ========================================================================= */}
      {activeSubTab === 'prescriptions' && (
        <div className="space-y-4 animate-fadeIn">
          {myPrescriptions.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#E2E8F0]">
              <Pill className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-[#1E293B]">No prescriptions found in clinical archive</p>
            </div>
          ) : (
            myPrescriptions
              .filter(p => !searchTerm || p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) || p.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) || p.medicines.some(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())))
              .map((rx) => (
                <div
                  key={rx.id}
                  className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs space-y-4 hover:border-[#159A9C] transition-colors"
                >
                  {/* Rx Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E2E8F0] gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-[#159A9C] bg-[#E8F6F6] px-2.5 py-0.5 rounded-full">
                          {rx.prescriptionNumber}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          rx.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {rx.status === 'active' ? 'Active Regimen' : 'Completed Course'}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[#123B5D] mt-1">
                        Diagnosis: {rx.diagnosis}
                      </h3>
                      <p className="text-xs text-[#64748B]">
                        Issued by <strong>{rx.doctorName}</strong> ({rx.department || 'General Medicine'})
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 text-right">
                      <div className="text-xs text-[#64748B] hidden sm:block">
                        <p>Date: <strong className="text-[#1E293B]">{rx.date}</strong></p>
                        <p>Valid Till: <strong className="text-[#1E293B]">{rx.expiryDate}</strong></p>
                      </div>
                      <button
                        onClick={() => handleOpenPrescription(rx)}
                        className="px-3.5 py-2 bg-[#1769AA] hover:bg-[#123B5D] text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download / View Slip</span>
                      </button>
                    </div>
                  </div>

                  {/* Medicines Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F7FAFC] text-[#64748B] uppercase text-[10px] font-bold border-b border-[#E2E8F0]">
                        <tr>
                          <th className="py-2.5 px-3">Medicine Name</th>
                          <th className="py-2.5 px-3">Dosage</th>
                          <th className="py-2.5 px-3">Frequency</th>
                          <th className="py-2.5 px-3">Duration</th>
                          <th className="py-2.5 px-3">Special Instructions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {rx.medicines.map((med, idx) => (
                          <tr key={idx} className="hover:bg-[#F7FAFC]">
                            <td className="py-2.5 px-3 font-bold text-[#123B5D]">{med.name}</td>
                            <td className="py-2.5 px-3 font-semibold text-[#159A9C]">{med.dosage}</td>
                            <td className="py-2.5 px-3 text-[#1E293B]">{med.frequency}</td>
                            <td className="py-2.5 px-3 text-[#64748B]">{med.duration}</td>
                            <td className="py-2.5 px-3 text-[#64748B] italic">{med.instructions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {rx.advice && (
                    <div className="p-3 bg-[#E8F6F6]/40 rounded-xl border border-[#159A9C]/20 text-xs text-[#123B5D]">
                      <strong className="text-[#159A9C]">Doctor's Clinical Advice: </strong>
                      {rx.advice}
                    </div>
                  )}
                </div>
              ))
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: LAB REPORT HISTORY */}
      {/* ========================================================================= */}
      {activeSubTab === 'lab_reports' && (
        <div className="space-y-4 animate-fadeIn">
          {myLabReports.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#E2E8F0]">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-[#1E293B]">No diagnostic lab reports found</p>
            </div>
          ) : (
            myLabReports
              .filter(l => !searchTerm || l.testName.toLowerCase().includes(searchTerm.toLowerCase()) || l.labDepartment.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((lr) => (
                <div
                  key={lr.id}
                  className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs space-y-4 hover:border-emerald-400 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E2E8F0] gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                          {lr.reportNumber}
                        </span>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full uppercase">
                          {lr.reportStatus}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[#123B5D] mt-1">
                        {lr.testName}
                      </h3>
                      <p className="text-xs text-[#64748B]">
                        Department: <strong>{lr.labDepartment}</strong> • Referring Doctor: {lr.referringDoctor || 'Dr. Arvind Sharma'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-[#64748B] hidden sm:block">
                        Test Date: <strong className="text-[#1E293B]">{lr.testDate}</strong>
                      </span>
                      <button
                        onClick={() => handleOpenLabReport(lr)}
                        className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Lab Report</span>
                      </button>
                    </div>
                  </div>

                  {/* Lab Test Results Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F7FAFC] text-[#64748B] uppercase text-[10px] font-bold border-b border-[#E2E8F0]">
                        <tr>
                          <th className="py-2.5 px-3">Parameter Tested</th>
                          <th className="py-2.5 px-3">Observed Result</th>
                          <th className="py-2.5 px-3">Unit</th>
                          <th className="py-2.5 px-3">Biological Reference Interval</th>
                          <th className="py-2.5 px-3">Flag / Interpretation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {lr.results.map((res, idx) => (
                          <tr key={idx} className="hover:bg-[#F7FAFC]">
                            <td className="py-2.5 px-3 font-semibold text-[#1E293B]">{res.parameter}</td>
                            <td className="py-2.5 px-3 font-bold text-[#123B5D]">{res.result}</td>
                            <td className="py-2.5 px-3 text-[#64748B]">{res.unit}</td>
                            <td className="py-2.5 px-3 text-[#64748B]">{res.normalRange}</td>
                            <td className="py-2.5 px-3">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                res.flag === 'Normal' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {res.flag || 'Normal'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {lr.pathologistImpression && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-[#1E293B]">
                      <strong className="text-[#123B5D]">Pathologist Impression & Notes: </strong>
                      {lr.pathologistImpression}
                    </div>
                  )}
                </div>
              ))
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: APPOINTMENT HISTORY */}
      {/* ========================================================================= */}
      {activeSubTab === 'appointments' && (
        <div className="space-y-4 animate-fadeIn">
          {myAppointments.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-[#E2E8F0]">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-[#1E293B]">No appointment records found</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F7FAFC] text-[#64748B] uppercase text-[10px] font-bold border-b border-[#E2E8F0]">
                    <tr>
                      <th className="py-3 px-4">Booking Ref</th>
                      <th className="py-3 px-4">Doctor & Department</th>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Visit Mode</th>
                      <th className="py-3 px-4">Symptoms / Reason</th>
                      <th className="py-3 px-4">Fee / Payment</th>
                      <th className="py-3 px-4">Appointment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myAppointments.map((apt) => (
                      <tr key={apt.id} className="hover:bg-[#F7FAFC]">
                        <td className="py-3.5 px-4 font-mono font-bold text-[#159A9C]">
                          {apt.bookingRef}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-[#123B5D]">{apt.doctorName}</p>
                          <p className="text-[11px] text-[#64748B]">{apt.department}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-[#1E293B]">{apt.date}</p>
                          <p className="text-[11px] text-[#159A9C] font-semibold">{apt.timeSlot}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-1">
                            {apt.visitMode === 'Clinic' && <Building className="w-3.5 h-3.5 text-[#159A9C]" />}
                            {apt.visitMode === 'Telephone' && <PhoneCall className="w-3.5 h-3.5 text-[#1769AA]" />}
                            {apt.visitMode === 'Homecare' && <Home className="w-3.5 h-3.5 text-purple-600" />}
                            <span className="font-medium text-[#1E293B]">{apt.visitMode}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[#64748B] max-w-xs truncate">
                          {apt.symptoms || 'General OPD Consult'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                            ₹{apt.amount} (Paid)
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                            apt.status === 'completed' ? 'bg-slate-100 text-slate-700' :
                            apt.status === 'today' ? 'bg-amber-100 text-amber-800' :
                            apt.status === 'upcoming' ? 'bg-[#E8F6F6] text-[#159A9C]' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {apt.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: MEDICAL HISTORY & VITALS */}
      {/* ========================================================================= */}
      {activeSubTab === 'medical_records' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Vitals Summary Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs">
              <span className="text-[11px] text-[#64748B] font-medium">Blood Pressure</span>
              <h4 className="text-xl font-bold text-[#123B5D] mt-1">120 / 80</h4>
              <span className="text-[10px] text-emerald-600 font-semibold">Optimal mmHg</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs">
              <span className="text-[11px] text-[#64748B] font-medium">Heart Rate</span>
              <h4 className="text-xl font-bold text-[#123B5D] mt-1">72 bpm</h4>
              <span className="text-[10px] text-emerald-600 font-semibold">Normal Sinus</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs">
              <span className="text-[11px] text-[#64748B] font-medium">SpO2 Oxygen</span>
              <h4 className="text-xl font-bold text-[#123B5D] mt-1">99%</h4>
              <span className="text-[10px] text-emerald-600 font-semibold">Room Air</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs">
              <span className="text-[11px] text-[#64748B] font-medium">Body Mass Index (BMI)</span>
              <h4 className="text-xl font-bold text-[#123B5D] mt-1">22.4</h4>
              <span className="text-[10px] text-emerald-600 font-semibold">Healthy Weight</span>
            </div>
          </div>

          {/* Clinical Diagnoses List */}
          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-[#1769AA]" />
                <h3 className="font-bold text-sm text-[#1E293B]">Clinical Diagnoses & Past Medical Conditions</h3>
              </div>
              <span className="text-xs text-[#64748B]">EMR Verified</span>
            </div>

            <div className="space-y-3">
              {myMedicalRecords.map((rec) => (
                <div key={rec.id} className="p-4 bg-[#F7FAFC] rounded-xl border border-[#E2E8F0] space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-[#123B5D]">{rec.condition}</h4>
                      <p className="text-[11px] text-[#64748B]">Diagnosed on {rec.diagnosedDate} by {rec.diagnosingDoctor}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      rec.status === 'Active' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {rec.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#1E293B]"><strong className="text-[#64748B]">Treatment:</strong> {rec.treatment}</p>
                  <p className="text-xs text-[#64748B]"><strong className="text-[#64748B]">Clinical Notes:</strong> {rec.notes}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Report Modal Viewer */}
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
