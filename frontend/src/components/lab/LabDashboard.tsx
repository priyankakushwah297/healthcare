import React, { useState } from 'react';
import {
  FileText,
  Search,
  CheckCircle2,
  PlusCircle,
  Activity,
  Download,
  Send,
  AlertCircle
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { LabReport } from '../../types';
import { ReportViewerModal } from '../common/ReportViewerModal';
import { PortalSidebar } from '../layout/PortalSidebar';

export const LabDashboard: React.FC = () => {
  const { labReports, users, addLabReport, hospital } = useHospital();

  const [activeSubTab, setActiveSubTab] = useState<string>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState<LabReport | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [showAddReport, setShowAddReport] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Dynamic Unified Patients List
  const patients = React.useMemo(() => {
    const list: UserProfile[] = [];
    const seenIds = new Set<string>();
    const seenMobiles = new Set<string>();

    users.filter(u => u.role === 'patient').forEach(u => {
      const cleanMob = (u.mobile || (u as any).mobileNumber || '').replace(/[^0-9]/g, '');
      seenIds.add(u.id);
      if (u.patientId) seenIds.add(u.patientId);
      if (cleanMob) seenMobiles.add(cleanMob);
      list.push(u);
    });

    appointments.forEach(apt => {
      const cleanMob = (apt.patientMobile || '').replace(/[^0-9]/g, '');
      const hasId = apt.patientId && seenIds.has(apt.patientId);
      const hasMobile = cleanMob && seenMobiles.has(cleanMob);

      if (!hasId && !hasMobile && apt.patientName) {
        const id = apt.patientId || `pat-${cleanMob || Date.now()}`;
        seenIds.add(id);
        if (cleanMob) seenMobiles.add(cleanMob);

        list.push({
          id,
          role: 'patient',
          fullName: apt.patientName,
          mobile: apt.patientMobile || '9876543201',
          patientId: apt.patientId || `PAT-${apt.bookingRef}`,
          gender: (apt.patientGender as any) || 'Female',
          dobOrAge: apt.patientAge || '28 Years',
          bloodGroup: 'O+',
          address: apt.homeLocation || 'Local Residence',
          createdAt: apt.createdAt || new Date().toISOString().split('T')[0]
        });
      }
    });

    return list;
  }, [users, appointments]);

  const doctors = users.filter(u => u.role === 'doctor');

  const [patientId, setPatientId] = useState(patients[0]?.id || '');
  const [doctorId, setDoctorId] = useState(doctors[0]?.id || '');
  const [testName, setTestName] = useState('Lipid Profile Comprehensive');
  const [labDepartment, setLabDepartment] = useState('Biochemistry');
  const [results, setResults] = useState('Cholesterol: 185 mg/dL, HDL: 48 mg/dL, LDL: 110 mg/dL');
  const [normalRange, setNormalRange] = useState('Total Cholesterol < 200 mg/dL');
  const [findings, setFindings] = useState('All lipid fractions within normal clinical biological limits.');

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    const pat = patients.find(u => u.id === patientId) || users.find(u => u.id === patientId);
    const doc = doctors.find(u => u.id === doctorId) || users.find(u => u.id === doctorId);

    if (!pat || !doc) return;

    addLabReport({
      patientId: pat.id,
      patientName: pat.fullName,
      doctorId: doc.id,
      doctorName: doc.fullName,
      testName,
      labDepartment,
      testDate: new Date().toISOString().split('T')[0],
      reportStatus: 'Completed',
      results,
      normalRange,
      findings,
      technicianName: 'Vikram Joshi (Senior Medical Technologist)'
    });

    setSuccessMsg(`Lab Report created and signed for ${pat.fullName}! Patient notified.`);
    setShowAddReport(false);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleViewReport = (lr: LabReport) => {
    setSelectedReport(lr);
    setIsViewerOpen(true);
  };

  return (
    <div className="flex flex-col lg:flex-row items-start gap-6 animate-fadeIn font-sans text-[#1E293B]">
      {/* LEFT: Unified Role Sidebar (Hidden on mobile, Drawer opened from top-right Hamburger) */}
      <div className="hidden lg:block lg:w-68 shrink-0 lg:sticky lg:top-20 self-start z-20">
        <PortalSidebar
          currentSubTab={activeSubTab}
          onSelectSubTab={(tabId) => setActiveSubTab(tabId)}
        />
      </div>

      {/* RIGHT: Dynamic Sub-View */}
      <div className="flex-1 w-full min-w-0 space-y-6">
        {/* Banner */}
        <div className="bg-[#123B5D] rounded-2xl p-6 text-white shadow-md border border-[#1769AA]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold bg-[#1769AA] px-3 py-0.5 rounded-full text-white uppercase">
                Diagnostics &amp; Pathology Lab
              </span>
              <span className="text-xs text-slate-300">
                NABL Accredited Lab: M-0941
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Clinical Laboratory Management
            </h2>
            <p className="text-xs text-slate-200">
              {hospital.name} • Sample Tracking, Report Verification &amp; Patient Sync
            </p>
          </div>

        <button
          onClick={() => setShowAddReport(true)}
          className="bg-white hover:bg-[#E8F6F6] text-[#1769AA] px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md flex items-center space-x-2 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-[#159A9C]" />
          <span>+ Upload / Authorize New Report</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-[#16845B]" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Reports Table */}
      <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
          <div>
            <h3 className="font-bold text-base text-[#123B5D]">Diagnostic Test Reports Queue</h3>
            <p className="text-xs text-[#64748B]">Total: {labReports.length} reports logged</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by test, patient..."
              className="w-full pl-9 pr-3 py-2 bg-[#F7FAFC] border border-[#E2E8F0] focus:border-[#1769AA] rounded-xl text-xs text-[#1E293B] outline-hidden"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#123B5D] text-white">
              <tr>
                <th className="py-3 px-3">Report Ref</th>
                <th className="py-3 px-3">Test Name & Dept</th>
                <th className="py-3 px-3">Patient</th>
                <th className="py-3 px-3">Referred By</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {labReports
                .filter(l => !searchTerm || l.testName.toLowerCase().includes(searchTerm.toLowerCase()) || l.patientName.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((lr) => (
                  <tr key={lr.id} className="hover:bg-[#F7FAFC]">
                    <td className="py-3.5 px-3 font-mono font-bold text-[#159A9C]">{lr.reportNumber}</td>
                    <td className="py-3.5 px-3">
                      <p className="font-bold text-[#123B5D]">{lr.testName}</p>
                      <p className="text-[11px] text-[#64748B]">{lr.labDepartment}</p>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-[#1E293B]">{lr.patientName}</td>
                    <td className="py-3.5 px-3 text-[#64748B]">{lr.doctorName}</td>
                    <td className="py-3.5 px-3 font-medium text-[#1E293B]">{lr.testDate}</td>
                    <td className="py-3.5 px-3">
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                        {lr.reportStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => handleViewReport(lr)}
                        className="px-3 py-1.5 bg-[#1769AA] hover:bg-[#123B5D] text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 ml-auto transition-colors cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>View / Print</span>
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload/Add Report Modal */}
      {showAddReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs font-sans animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden animate-scaleIn">
            <div className="bg-[#123B5D] px-5 sm:px-6 py-3.5 text-white flex justify-between items-center shrink-0 shadow-xs">
              <h3 className="font-bold text-sm">Upload & Authorize Diagnostic Report</h3>
              <button onClick={() => setShowAddReport(false)} className="text-slate-300 hover:text-white p-1 rounded-lg cursor-pointer">✕</button>
            </div>

            <form onSubmit={handleCreateReport} className="p-4 sm:p-6 overflow-y-auto space-y-3.5 text-xs flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Patient</label>
                  <select
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    required
                    className="w-full p-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg"
                  >
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.fullName} ({p.mobile})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Referring Doctor</label>
                  <select
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    required
                    className="w-full p-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg"
                  >
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>{d.fullName}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Test Name</label>
                  <input
                    type="text"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    required
                    className="w-full p-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Lab Department</label>
                  <input
                    type="text"
                    value={labDepartment}
                    onChange={(e) => setLabDepartment(e.target.value)}
                    required
                    className="w-full p-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Observed Results Parameter Values</label>
                <textarea
                  value={results}
                  onChange={(e) => setResults(e.target.value)}
                  rows={2}
                  required
                  className="w-full p-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Biological Reference Range</label>
                <input
                  type="text"
                  value={normalRange}
                  onChange={(e) => setNormalRange(e.target.value)}
                  className="w-full p-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Clinical Impression / Findings</label>
                <textarea
                  value={findings}
                  onChange={(e) => setFindings(e.target.value)}
                  rows={2}
                  className="w-full p-2 bg-[#F7FAFC] border border-[#E2E8F0] rounded-lg"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddReport(false)}
                  className="px-4 py-2 bg-slate-100 rounded-lg font-semibold text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#16845B] hover:bg-emerald-800 text-white rounded-lg font-semibold shadow-xs flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Authorize & Publish Report</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      <ReportViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        type="lab_report"
        labReport={selectedReport}
      />
      </div>
    </div>
  );
};
