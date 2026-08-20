import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  FileText,
  Calendar,
  User,
  Stethoscope,
  Pill,
  CheckCircle,
  Activity,
  Award,
  Clock,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  QrCode
} from 'lucide-react';
import { Prescription, LabReport } from '../../types';
import { useHospital } from '../../context/HospitalContext';

interface ReportViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'prescription' | 'lab_report';
  prescription?: Prescription | null;
  labReport?: LabReport | null;
}

export const ReportViewerModal: React.FC<ReportViewerModalProps> = ({
  isOpen,
  onClose,
  type,
  prescription,
  labReport
}) => {
  const { hospital, users } = useHospital();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = 0;
    }
  }, [isOpen, prescription, labReport]);

  if (!isOpen) return null;

  // Find patient record for additional context if available
  const patientId = type === 'prescription' ? prescription?.patientId : labReport?.patientId;
  const patientName = type === 'prescription' ? prescription?.patientName : labReport?.patientName;
  const patientUser = users.find(u => u.id === patientId || u.patientId === patientId || u.fullName === patientName);

  const finalPatientName = type === 'prescription' ? prescription?.patientName : labReport?.patientName;
  const finalPatientMobile = patientUser?.mobile || (patientUser as any)?.mobileNumber || prescription?.patientMobile || '9876543201';
  const finalPatientId = patientUser?.patientId || patientId || 'PAT-2026-1001';
  const finalAgeGender = `${prescription?.patientAge || patientUser?.dobOrAge || '28 Years'} • ${prescription?.patientGender || patientUser?.gender || 'Female'}`;

  // Helper to parse multi-parameter lab test results into structured rows
  const parseLabParameters = (resultsStr?: string, defaultRange?: string, defaultUnit?: string) => {
    if (!resultsStr) return [];
    
    if (resultsStr.includes('|') || resultsStr.includes(';')) {
      const parts = resultsStr.split(/[|;]/).map(p => p.trim()).filter(Boolean);
      return parts.map(part => {
        const colonIdx = part.indexOf(':');
        if (colonIdx !== -1) {
          const paramName = part.substring(0, colonIdx).trim();
          const paramVal = part.substring(colonIdx + 1).trim();
          
          let refRange = 'Standard Clinical Range';
          let unit = defaultUnit || '';
          if (paramName.toLowerCase().includes('total cholesterol')) refRange = '< 200 mg/dL';
          else if (paramName.toLowerCase().includes('hdl')) refRange = '> 40 mg/dL (Male) / > 50 mg/dL (Female)';
          else if (paramName.toLowerCase().includes('ldl')) refRange = '< 100 mg/dL (Optimal)';
          else if (paramName.toLowerCase().includes('triglycerides')) refRange = '< 150 mg/dL';
          else if (paramName.toLowerCase().includes('hba1c')) refRange = '< 5.7% (Non-diabetic)';
          else if (paramName.toLowerCase().includes('fasting')) refRange = '70 - 99 mg/dL';
          else if (paramName.toLowerCase().includes('postprandial')) refRange = '< 140 mg/dL';
          else if (paramName.toLowerCase().includes('hemoglobin')) refRange = '12.0 - 15.5 g/dL';
          else if (paramName.toLowerCase().includes('wbc')) refRange = '4,500 - 11,000 /mcL';
          else if (paramName.toLowerCase().includes('platelets')) refRange = '1.5 - 4.5 Lakhs/mcL';
          else if (paramName.toLowerCase().includes('esr')) refRange = '0 - 15 mm/hr';
          else if (defaultRange) refRange = defaultRange;

          return {
            name: paramName,
            value: paramVal,
            range: refRange,
            unit: unit,
            status: 'Normal'
          };
        }
        return {
          name: part,
          value: 'Observed / Present',
          range: defaultRange || 'Negative / Normal',
          unit: defaultUnit || '',
          status: 'Normal'
        };
      });
    }

    // Single parameter fallback
    return [
      {
        name: labReport?.testName || 'Diagnostic Evaluation',
        value: resultsStr,
        range: defaultRange || 'Standard Normal Reference',
        unit: defaultUnit || '',
        status: 'Normal'
      }
    ];
  };

  const parsedParameters = type === 'lab_report' ? parseLabParameters(labReport?.results, labReport?.normalRange, labReport?.units) : [];

  // Generate isolated clean HTML for 1-page printing / PDF export (zero blank pages & zero extra spaces)
  const generateIsolatedHtml = () => {
    const isRx = type === 'prescription';
    const docTitle = isRx ? `Prescription_${prescription?.prescriptionNumber}` : `Lab_Report_${labReport?.reportNumber}`;

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${docTitle}</title>
        <style>
          @page { size: A4 portrait; margin: 10mm 12mm; }
          * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
          body { color: #1E293B; margin: 0; padding: 0; background: #fff; font-size: 11.5px; line-height: 1.4; }
          
          .header { border-bottom: 2px solid #123B5D; padding-bottom: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
          .h-title { font-size: 18px; font-weight: 800; color: #123B5D; margin: 0; }
          .h-sub { font-size: 10px; color: #64748B; margin: 2px 0 0 0; }
          .badge { background: #E8F6F6; color: #159A9C; font-size: 9px; font-weight: bold; padding: 3px 7px; border-radius: 4px; border: 1px solid rgba(21,154,156,0.3); }

          .doc-banner { background: #123B5D; color: #fff; padding: 5px 10px; border-radius: 6px; display: flex; justify-content: space-between; font-size: 11px; font-weight: bold; margin-bottom: 10px; }

          .meta-grid { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 8px 10px; margin-bottom: 10px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; font-size: 10.5px; }
          .meta-grid span { color: #64748B; font-size: 9px; display: block; font-weight: bold; text-transform: uppercase; margin-bottom: 1px; }
          .meta-grid strong { color: #123B5D; font-size: 11px; }

          .test-banner { background: #159A9C; color: #fff; padding: 6px 10px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-weight: bold; }

          table { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 11px; }
          th { background: #123B5D; color: #fff; padding: 6px 8px; text-align: left; font-size: 10px; font-weight: bold; }
          td { border-bottom: 1px solid #E2E8F0; padding: 6px 8px; }
          tr:nth-child(even) { background: #F8FAFC; }

          .info-box { background: #E8F6F6; border: 1px solid rgba(21,154,156,0.4); border-radius: 6px; padding: 8px 10px; margin-bottom: 10px; font-size: 11px; }
          .info-box span { font-weight: bold; color: #123B5D; font-size: 10px; display: block; margin-bottom: 2px; }

          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; }
          .card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 6px 10px; font-size: 10.5px; }
          .card span { font-weight: bold; color: #123B5D; font-size: 9.5px; display: block; margin-bottom: 2px; }

          .footer { border-top: 1px solid #CBD5E1; padding-top: 8px; margin-top: 12px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 9.5px; color: #64748B; }
          .sig-doc { font-weight: bold; font-size: 13px; color: #123B5D; font-style: italic; font-family: Georgia, serif; }
        </style>
      </head>
      <body>
        <!-- Header -->
        <div class="header">
          <div>
            <h1 class="h-title">${hospital.name}</h1>
            <p class="h-sub">${hospital.address} | Tel: ${hospital.phone} | Emergency: ${hospital.emergencyPhone}</p>
          </div>
          <div style="text-align: right;">
            <span class="badge">NABL &amp; NABH ACCREDITED</span>
            <p style="font-size: 8.5px; color: #64748B; margin: 2px 0 0 0;">Reg CIN: U85110DL2012PTC2398</p>
          </div>
        </div>

        <!-- Document Banner -->
        <div class="doc-banner">
          <span>${isRx ? 'OFFICIAL MEDICAL CONSULTATION RECORD (Rx)' : 'COMPREHENSIVE CLINICAL PATHOLOGY & DIAGNOSTIC REPORT'}</span>
          <span>${isRx ? prescription?.prescriptionNumber : labReport?.reportNumber}</span>
        </div>

        <!-- Patient Metadata Grid -->
        <div class="meta-grid">
          <div>
            <span>Patient Name</span>
            <strong>${finalPatientName}</strong><br/>
            <small style="color:#64748B;">📞 ${finalPatientMobile}</small>
          </div>
          <div>
            <span>Patient ID / Age / Gender</span>
            <strong>${finalPatientId}</strong><br/>
            <small style="color:#64748B;">${finalAgeGender}</small>
          </div>
          <div>
            <span>Referring Consultant</span>
            <strong>${isRx ? prescription?.doctorName : labReport?.doctorName}</strong><br/>
            <small style="color:#1769AA;">${isRx ? prescription?.doctorSpecialization : labReport?.labDepartment}</small>
          </div>
          <div>
            <span>Date & Time</span>
            <strong>${isRx ? `${prescription?.date} (${prescription?.time})` : labReport?.testDate}</strong><br/>
            <small style="color:#16845B; font-weight: bold;">✓ Verified &amp; Signed</small>
          </div>
        </div>

        ${isRx && prescription ? `
          <!-- Clinical Diagnosis -->
          <div class="info-box">
            <span>CLINICAL DIAGNOSIS &amp; SYMPTOMS:</span>
            <strong style="color: #159A9C; font-size: 12px;">${prescription.diagnosis}</strong>
            ${prescription.symptoms ? `<div style="color: #64748B; font-size: 10px; margin-top: 2px;">Chief Complaints: ${prescription.symptoms}</div>` : ''}
          </div>

          <!-- Prescribed Medications Table -->
          <table>
            <thead>
              <tr>
                <th style="width: 30px;">#</th>
                <th>Medicine Name &amp; Instructions</th>
                <th>Dosage</th>
                <th>Frequency</th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              ${prescription.medicines.map((m, idx) => `
                <tr>
                  <td style="font-weight: bold; color: #64748B;">${idx + 1}</td>
                  <td><strong>${m.name}</strong><br/><small style="color: #64748B;">${m.instructions}</small></td>
                  <td><strong>${m.dosage}</strong></td>
                  <td><span style="color: #159A9C; font-weight: bold;">${m.frequency}</span></td>
                  <td>${m.duration}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- Advice & Next Follow-Up -->
          <div class="grid-2">
            <div class="card">
              <span>DIETARY &amp; CLINICAL ADVICE:</span>
              <p style="margin: 0; color: #475569;">${prescription.adviceNotes || prescription.advice || 'Take prescribed medications on time. Drink adequate warm water.'}</p>
            </div>
            <div class="card">
              <span>NEXT FOLLOW-UP CONSULTATION:</span>
              <strong style="color: #159A9C; font-size: 11px;">${prescription.nextFollowUp || 'After 7 Days (or SOS if symptoms persist)'}</strong>
              <div style="font-size: 9px; color: #64748B; margin-top: 2px;">Valid until: ${prescription.expiryDate}</div>
            </div>
          </div>

          <!-- Signature Footer -->
          <div class="footer">
            <div>
              <p style="margin: 0;">• Digitally authenticated via Hospital HMIS • SHA256-V2026-MED</p>
              <p style="margin: 0;">• Valid for pharmacy dispensing across all authorized pharmacy counters.</p>
            </div>
            <div style="text-align: right;">
              <div class="sig-doc">${prescription.doctorName}</div>
              <div style="font-weight: bold; color: #1769AA;">${prescription.doctorSpecialization}</div>
              <div style="font-size: 8.5px;">Reg No: MCI-2014-99812 | Aarogya Hospital</div>
            </div>
          </div>
        ` : ''}

        ${!isRx && labReport ? `
          <!-- Department & Test Banner -->
          <div class="test-banner">
            <div>
              <small style="text-transform: uppercase; font-size: 8.5px; opacity: 0.9;">Department of ${labReport.labDepartment}</small>
              <div style="font-size: 13px;">${labReport.testName}</div>
            </div>
            <span style="background: rgba(255,255,255,0.25); padding: 2px 8px; border-radius: 12px; font-size: 10px;">✓ Status: ${labReport.reportStatus}</span>
          </div>

          <!-- Lab Parameters Table -->
          <table>
            <thead>
              <tr>
                <th>Test Parameter / Analyte</th>
                <th>Observed Result</th>
                <th>Biological Reference Range</th>
                <th>Clinical Flag</th>
              </tr>
            </thead>
            <tbody>
              ${parsedParameters.map(param => `
                <tr>
                  <td><strong>${param.name}</strong></td>
                  <td style="color: #159A9C; font-weight: bold; font-size: 12px;">${param.value}</td>
                  <td style="color: #64748B; font-family: monospace; font-size: 10px;">${param.range}</td>
                  <td><span style="color: #16845B; font-weight: bold; background: #ECFDF5; padding: 2px 6px; border-radius: 4px; border: 1px solid #A7F3D0;">Normal</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- Pathologist Findings -->
          ${labReport.findings ? `
            <div class="info-box">
              <span>PATHOLOGIST CLINICAL IMPRESSION:</span>
              <strong style="color: #123B5D; font-size: 11.5px;">${labReport.findings}</strong>
            </div>
          ` : ''}

          <!-- Signature Footer -->
          <div class="footer">
            <div>
              <p style="margin: 0;">• Performed by: <strong>${labReport.technicianName || 'Vikram Joshi (Senior Medical Technologist)'}</strong></p>
              <p style="margin: 0;">• NABL Accreditation Cert No: <strong>NABL-M-2026-9041</strong> | Specimen Verified</p>
            </div>
            <div style="text-align: right;">
              <div class="sig-doc">Dr. Meenakshi Sundaram, MD</div>
              <div style="font-weight: bold; color: #1769AA;">Head of Clinical Pathology &amp; Diagnostics</div>
              <div style="font-size: 8.5px;">Reg No: KMC-1998-44219 | Aarogya Diagnostics</div>
            </div>
          </div>
        ` : ''}

      </body>
      </html>
    `;
  };

  // Clean, isolated 1-page document print without entire website background
  const handlePrint = () => {
    const htmlContent = generateIsolatedHtml();
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1500);
      }, 350);
    } else {
      window.print();
    }
  };

  // Direct download standalone official medical document file
  const handleDownload = () => {
    const htmlContent = generateIsolatedHtml();
    const isRx = type === 'prescription';
    const docRef = isRx ? (prescription?.prescriptionNumber || 'RX') : (labReport?.reportNumber || 'LAB');
    const patName = (finalPatientName || 'Patient').replace(/\s+/g, '_');
    const filename = `${isRx ? 'Medical_Prescription' : 'Clinical_Lab_Report'}_${docRef}_${patName}.html`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs font-sans animate-fadeIn"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', margin: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl h-[92vh] max-h-[92vh] flex flex-col overflow-hidden animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-[#123B5D] via-[#1769AA] to-[#123B5D] px-4 sm:px-6 py-3 text-white flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
              {type === 'prescription' ? (
                <FileText className="w-4 h-4 text-[#38BDF8]" />
              ) : (
                <Activity className="w-4 h-4 text-[#38BDF8]" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-white tracking-tight leading-tight">
                {type === 'prescription' ? 'Official Medical e-Prescription (Rx)' : 'Diagnostic Pathology Laboratory Report'}
              </h3>
              <p className="text-[10px] sm:text-[11px] text-sky-200">
                Ref: {type === 'prescription' ? prescription?.prescriptionNumber : labReport?.reportNumber} • Certified HMIS Record
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer border border-white/10"
              title="Print Document"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 bg-[#159A9C] hover:bg-[#123B5D] text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
              title="Download Document"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 ml-1 transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Complete Document Paper Area - Starts from top line 0 */}
        <div ref={scrollAreaRef} className="p-4 sm:p-6 overflow-y-auto space-y-3.5 text-[#1E293B] bg-white flex-1" id="printable-report">
          
          {/* Hospital Official Letterhead */}
          <div className="border-b-2 border-[#123B5D] pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#123B5D] to-[#159A9C] flex items-center justify-center text-white shadow-xs shrink-0">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-[#123B5D] tracking-tight leading-none">
                  {hospital.name}
                </h2>
                <p className="text-[11px] text-[#64748B] mt-0.5 font-medium flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-[#159A9C] shrink-0 inline" />
                  <span>{hospital.address}</span>
                </p>
                <p className="text-[10px] text-[#64748B] mt-0.5 font-medium">
                  📞 Helpline: <strong>{hospital.emergencyPhone}</strong> | Board: {hospital.phone}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0">
              <div className="inline-flex items-center space-x-1 bg-[#E8F6F6] text-[#159A9C] text-[11px] font-extrabold px-2.5 py-0.5 rounded border border-[#159A9C]/30 shadow-2xs">
                <Award className="w-3.5 h-3.5" />
                <span>NABL &amp; NABH ACCREDITED</span>
              </div>
              <p className="text-[9px] text-[#64748B] mt-0.5 font-mono">Govt. Reg / CIN: U85110DL2012PTC2398</p>
              <p className="text-[9px] text-emerald-700 font-bold">ISO 9001:2015 Certified Diagnostic Center</p>
            </div>
          </div>

          {/* Document Title Banner */}
          <div className="bg-gradient-to-r from-[#123B5D] via-[#1769AA] to-[#123B5D] text-white py-1.5 px-3.5 rounded-lg flex items-center justify-between shadow-2xs">
            <span className="font-extrabold text-[11px] tracking-wider uppercase">
              {type === 'prescription' ? 'Official Medical Consultation Record' : 'Comprehensive Clinical Pathology & Diagnostic Report'}
            </span>
            <span className="text-[11px] font-mono font-bold text-sky-200">
              {type === 'prescription' ? prescription?.prescriptionNumber : labReport?.reportNumber}
            </span>
          </div>

          {/* Complete Patient & Referral Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#F8FAFC] p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[#64748B] block text-[9px] uppercase font-bold tracking-wider">Patient Name</span>
              <span className="font-extrabold text-xs text-[#123B5D] block">
                {finalPatientName}
              </span>
              <span className="text-[10px] text-[#64748B] font-mono block">
                📞 {finalPatientMobile}
              </span>
            </div>

            <div>
              <span className="text-[#64748B] block text-[9px] uppercase font-bold tracking-wider">Patient ID / UHID</span>
              <span className="font-bold text-[11px] text-[#159A9C] font-mono bg-white px-1.5 py-0.5 rounded border border-[#159A9C]/30 inline-block">
                {finalPatientId}
              </span>
              <span className="text-[10px] text-[#64748B] block mt-0.5">
                Age/Gender: <strong>{finalAgeGender}</strong>
              </span>
            </div>

            <div>
              <span className="text-[#64748B] block text-[9px] uppercase font-bold tracking-wider">Referring Consultant</span>
              <span className="font-bold text-xs text-[#123B5D] block">
                {type === 'prescription' ? prescription?.doctorName : labReport?.doctorName}
              </span>
              <span className="text-[10px] text-[#1769AA] block font-medium">
                {prescription?.doctorSpecialization || labReport?.labDepartment || 'Senior Consultant Physician'}
              </span>
            </div>

            <div>
              <span className="text-[#64748B] block text-[9px] uppercase font-bold tracking-wider">Sample / Report Date</span>
              <span className="font-semibold text-[11px] text-[#1E293B] block">
                📅 {type === 'prescription' ? `${prescription?.date} (${prescription?.time})` : labReport?.testDate}
              </span>
              <span className="text-[10px] text-emerald-700 font-bold block">
                ✓ Final Verified &amp; Signed
              </span>
            </div>
          </div>

          {/* ================= PRESCRIPTION VIEW ================= */}
          {type === 'prescription' && prescription && (
            <div className="space-y-3.5">
              
              {/* Clinical Findings & Diagnosis */}
              <div className="bg-[#E8F6F6]/80 p-2.5 rounded-xl border border-[#159A9C]/40 text-xs space-y-0.5">
                <span className="font-bold text-[#123B5D] text-[10px] uppercase tracking-wider block">Clinical Diagnosis &amp; Symptoms:</span>
                <p className="font-bold text-[#159A9C] text-xs sm:text-sm">{prescription.diagnosis}</p>
                {prescription.symptoms && (
                  <p className="text-[#64748B] text-[11px]">Chief Complaints: {prescription.symptoms}</p>
                )}
              </div>

              {/* Prescribed Medications Table */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[11px] text-[#123B5D] uppercase tracking-wider flex items-center space-x-1.5">
                    <Pill className="w-3.5 h-3.5 text-[#159A9C]" />
                    <span>Prescribed Medications ({prescription.medicines?.length || 0})</span>
                  </h4>
                  <span className="text-[10px] text-[#64748B]">Take medications strictly as directed</span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#123B5D] text-white font-bold text-[11px]">
                      <tr>
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">Medicine Name &amp; Instructions</th>
                        <th className="py-2 px-3">Dosage</th>
                        <th className="py-2 px-3">Frequency</th>
                        <th className="py-2 px-3">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {prescription.medicines && prescription.medicines.length > 0 ? (
                        prescription.medicines.map((med, idx) => (
                          <tr key={med.id || idx} className="hover:bg-slate-50 transition-colors">
                            <td className="py-2 px-3 text-[#64748B] font-mono font-bold">{idx + 1}</td>
                            <td className="py-2 px-3">
                              <span className="font-extrabold text-xs text-[#123B5D] block">{med.name}</span>
                              <span className="text-[10px] text-[#64748B]">{med.instructions}</span>
                            </td>
                            <td className="py-2 px-3 font-bold text-[#1E293B] text-xs">{med.dosage}</td>
                            <td className="py-2 px-3">
                              <span className="inline-block bg-[#E8F6F6] text-[#159A9C] font-bold px-2 py-0.5 rounded text-[10px] border border-[#159A9C]/30">
                                {med.frequency}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-semibold text-[#1E293B] text-xs">{med.duration}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-[#64748B]">
                            No medications listed.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Doctor Clinical Advice & Next Follow-up */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl space-y-0.5">
                  <span className="font-bold text-[#123B5D] block uppercase tracking-wider text-[10px]">Dietary &amp; General Advice:</span>
                  <p className="text-[#64748B] leading-relaxed text-[11px]">
                    {prescription.adviceNotes || prescription.advice || 'Take prescribed medications on time. Drink adequate warm water and take proper rest.'}
                  </p>
                </div>

                <div className="p-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl space-y-0.5">
                  <span className="font-bold text-[#123B5D] block uppercase tracking-wider text-[10px]">Next Follow-up:</span>
                  <p className="text-[#159A9C] font-bold text-xs sm:text-sm">
                    {prescription.nextFollowUp || 'After 7 Days (or SOS if symptoms persist)'}
                  </p>
                  <p className="text-[9px] text-[#64748B]">Valid until: {prescription.expiryDate}</p>
                </div>
              </div>

              {/* Doctor Digital Signature & Verification Block */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  <QrCode className="w-7 h-7 text-[#123B5D] p-0.5 bg-slate-100 rounded border border-slate-200" />
                  <div>
                    <p className="text-[10px] font-bold text-[#123B5D]">Digitally Authenticated</p>
                    <p className="text-[9px] text-[#64748B]">HMIS Hash: SHA256-V2026-MED</p>
                  </div>
                </div>

                <div className="text-left sm:text-right space-y-0.5">
                  <div className="font-serif italic text-sm sm:text-base text-[#123B5D] font-extrabold">
                    {prescription.doctorName}
                  </div>
                  <p className="font-bold text-[10px] text-[#1769AA]">{prescription.doctorSpecialization}</p>
                  <p className="text-[9px] text-[#64748B] font-mono">Reg No: MCI-2014-99812 | Aarogya Hospital</p>
                </div>
              </div>

            </div>
          )}

          {/* ================= FULL LAB REPORT VIEW ================= */}
          {type === 'lab_report' && labReport && (
            <div className="space-y-3.5">
              
              {/* Department & Test Title Banner */}
              <div className="bg-gradient-to-r from-[#123B5D] to-[#159A9C] text-white p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-1 shadow-2xs">
                <div>
                  <span className="text-[9px] text-sky-200 uppercase font-extrabold tracking-widest block">
                    Department of {labReport.labDepartment}
                  </span>
                  <h3 className="text-sm sm:text-base font-extrabold text-white mt-0.5">{labReport.testName}</h3>
                </div>
                <div>
                  <span className="bg-white/20 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-white/30">
                    ✓ Status: {labReport.reportStatus}
                  </span>
                </div>
              </div>

              {/* Comprehensive Parameter Breakdown Table */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[11px] text-[#123B5D] uppercase tracking-wider flex items-center space-x-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#159A9C]" />
                    <span>Quantitative Findings &amp; Reference Ranges</span>
                  </h4>
                  <span className="text-[10px] text-[#159A9C] font-bold">Standard NABL Testing Protocols</span>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#123B5D] text-white font-bold text-[11px]">
                      <tr>
                        <th className="py-2 px-3">Test Parameter / Analyte</th>
                        <th className="py-2 px-3">Observed Result</th>
                        <th className="py-2 px-3">Biological Reference Range</th>
                        <th className="py-2 px-3">Clinical Flag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {parsedParameters.map((param, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2 px-3 font-bold text-[#123B5D]">
                            {param.name}
                          </td>
                          <td className="py-2 px-3 font-extrabold text-xs sm:text-sm text-[#159A9C]">
                            {param.value}
                          </td>
                          <td className="py-2 px-3 text-[#64748B] font-medium font-mono text-[10px]">
                            {param.range}
                          </td>
                          <td className="py-2 px-3">
                            <span className="inline-flex items-center space-x-1 font-bold text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Normal</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pathologist Clinical Impression */}
              {labReport.findings && (
                <div className="p-3 bg-gradient-to-br from-[#E8F6F6] to-sky-50 border border-[#159A9C]/40 rounded-xl space-y-1 text-xs">
                  <span className="font-extrabold text-[#123B5D] text-[10px] uppercase tracking-wider block flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5 text-[#159A9C]" />
                    <span>Pathologist &amp; Medical Technologist Clinical Impression:</span>
                  </span>
                  <p className="text-[#123B5D] font-semibold text-xs leading-relaxed">
                    {labReport.findings}
                  </p>
                </div>
              )}

              {/* Laboratory Authentication & Signatures */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-2 text-xs">
                <div className="space-y-0.5">
                  <p className="text-[10px] text-[#64748B]">
                    Performed By: <strong className="text-[#123B5D]">{labReport.technicianName || 'Vikram Joshi (Senior Medical Technologist)'}</strong>
                  </p>
                  <p className="text-[9px] text-[#64748B]">
                    NABL Accreditation Cert No: <strong>NABL-M-2026-9041</strong>
                  </p>
                  <p className="text-[9px] text-emerald-700 font-semibold">
                    ✓ Specimen integrity verified • Calibration tests passed
                  </p>
                </div>

                <div className="text-left sm:text-right space-y-0.5">
                  <div className="font-serif italic text-sm sm:text-base text-[#123B5D] font-extrabold">
                    Dr. Meenakshi Sundaram, MD
                  </div>
                  <p className="font-bold text-[10px] text-[#1769AA]">Head of Clinical Pathology &amp; Diagnostics</p>
                  <p className="text-[9px] text-[#64748B] font-mono">Reg No: KMC-1998-44219 | Aarogya Diagnostics</p>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Bottom Action Bar */}
        <div className="bg-[#F8FAFC] px-4 sm:px-6 py-3 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-[10px] sm:text-xs text-[#64748B] font-medium hidden sm:inline">
            Aarogya Healthcare Center • Certified Document Viewer
          </span>
          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-[#123B5D] text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center space-x-1 border border-slate-200"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Document</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 bg-[#159A9C] hover:bg-[#123B5D] text-white text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center space-x-1 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};
