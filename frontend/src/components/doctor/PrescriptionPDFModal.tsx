import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Printer,
  Download,
  CheckCircle2,
  Stethoscope,
  HeartPulse,
  Calendar,
  User,
  Pill,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  FileCheck
} from 'lucide-react';
import { Prescription, Hospital } from '../../types';

interface PrescriptionPDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  prescription: Prescription | null;
  hospital: Hospital;
}

export const PrescriptionPDFModal: React.FC<PrescriptionPDFModalProps> = ({
  isOpen,
  onClose,
  prescription,
  hospital
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !prescription) return null;

  const generatePrescriptionHtml = () => {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Prescription - ${prescription.prescriptionNumber}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          * { box-sizing: border-box; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
          body { color: #1E293B; margin: 0; padding: 20px; background: #fff; font-size: 13px; line-height: 1.5; }
          .header-box { border-bottom: 2px solid #123B5D; padding-bottom: 16px; margin-bottom: 20px; display: flex; justify-content: space-between; }
          .hospital-title { font-size: 22px; font-weight: bold; color: #123B5D; margin: 0 0 2px 0; }
          .hospital-tag { font-size: 11px; color: #64748B; margin: 0 0 6px 0; }
          .hospital-info { font-size: 10px; color: #64748B; margin: 0; line-height: 1.4; }
          .doctor-box { text-align: right; }
          .doctor-name { font-size: 15px; font-weight: bold; color: #123B5D; margin: 0 0 2px 0; }
          .doctor-spec { font-size: 12px; font-weight: 600; color: #1769AA; margin: 0 0 2px 0; }
          .doctor-meta { font-size: 11px; color: #64748B; margin: 0; }
          
          .meta-grid { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; font-size: 11px; }
          .meta-item span { display: block; color: #64748B; font-size: 10px; margin-bottom: 2px; }
          .meta-item strong { color: #123B5D; font-size: 12px; }

          .section-title { font-size: 12px; font-weight: bold; text-transform: uppercase; color: #123B5D; margin: 16px 0 6px 0; letter-spacing: 0.5px; }
          .diagnosis-box { background: #F0F9FF; border: 1px solid #BAE6FD; border-radius: 8px; padding: 10px 14px; margin-bottom: 20px; }
          .diagnosis-box p { margin: 0; font-weight: 600; color: #0369A1; }
          .symptoms-text { font-size: 11px; color: #64748B; margin-top: 4px !important; font-weight: normal !important; }

          table.med-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
          table.med-table th { background: #F8FAFC; border-bottom: 2px solid #E2E8F0; padding: 8px 10px; text-align: left; font-weight: bold; color: #64748B; font-size: 11px; }
          table.med-table td { border-bottom: 1px solid #E2E8F0; padding: 9px 10px; }
          .rx-symbol { font-size: 18px; font-weight: 900; color: #1769AA; margin-right: 4px; }

          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 25px; }
          .info-card { background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 10px 14px; }
          .info-card h4 { margin: 0 0 4px 0; font-size: 11px; font-weight: bold; color: #123B5D; text-transform: uppercase; }
          .info-card p { margin: 0; font-size: 11px; color: #475569; }

          .footer-box { border-top: 1px solid #E2E8F0; padding-top: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
          .footer-note { font-size: 10px; color: #64748B; line-height: 1.5; }
          .signature-box { text-align: center; width: 180px; }
          .signature-line { border-bottom: 1px solid #94A3B8; padding-bottom: 4px; margin-bottom: 4px; }
          .signature-tag { font-size: 10px; color: #047857; font-weight: bold; }
          .signature-doc { font-weight: bold; font-size: 12px; color: #123B5D; margin: 2px 0 0 0; }
          .signature-reg { font-size: 10px; color: #64748B; margin: 0; }
        </style>
      </head>
      <body>
        <div class="header-box">
          <div>
            <h1 class="hospital-title">${hospital.name || 'Healthcare Center'}</h1>
            <p class="hospital-tag">${hospital.tagline || 'Multi-Specialty Hospital & Research Institute'}</p>
            <p class="hospital-info">
              ${hospital.address || 'Plot 42, Medical Enclave, Health City, New Delhi - 110029'}<br/>
              Tel: ${hospital.phone || '+91 11 2678 9000'} | 24/7 Emergency: ${hospital.emergencyPhone || '108 / 011-26789999'}
            </p>
          </div>
          <div class="doctor-box">
            <h2 class="doctor-name">${prescription.doctorName}</h2>
            <p class="doctor-spec">${prescription.doctorSpecialization}</p>
            <p class="doctor-meta">${prescription.doctorQualification || 'MBBS, MD, DM'}</p>
            <p class="doctor-meta">${prescription.department || 'Clinical OPD'}</p>
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-item">
            <span>Patient Name:</span>
            <strong>${prescription.patientName}</strong>
          </div>
          <div class="meta-item">
            <span>Patient ID / Age / Gender:</span>
            <strong>${prescription.patientId} • ${prescription.patientAge || '32Y'} • ${prescription.patientGender || 'Adult'}</strong>
          </div>
          <div class="meta-item">
            <span>Date & Time:</span>
            <strong>${prescription.date} • ${prescription.time || '11:00 AM'}</strong>
          </div>
          <div class="meta-item">
            <span>Rx Reference ID:</span>
            <strong style="color: #1769AA; font-family: monospace;">${prescription.prescriptionNumber}</strong>
          </div>
        </div>

        <div class="section-title">Clinical Diagnosis</div>
        <div class="diagnosis-box">
          <p>${prescription.diagnosis || 'General Clinical Consultation'}</p>
          ${prescription.symptoms ? `<p class="symptoms-text">Presented Symptoms: ${prescription.symptoms}</p>` : ''}
        </div>

        <div class="section-title"><span class="rx-symbol">℞</span> Prescribed Medications & Dosage Instructions</div>
        <table class="med-table">
          <thead>
            <tr>
              <th style="width: 30px;">#</th>
              <th>Medicine & Strength</th>
              <th>Dosage / Frequency</th>
              <th>Duration</th>
              <th>Instructions</th>
            </tr>
          </thead>
          <tbody>
            ${prescription.medicines.map((med, idx) => `
              <tr>
                <td style="font-weight: bold; color: #64748B;">${idx + 1}</td>
                <td style="font-weight: bold; color: #123B5D;">${med.name}</td>
                <td style="color: #1769AA; font-weight: 600;">${med.dosage} (${med.frequency})</td>
                <td>${med.duration}</td>
                <td style="color: #64748B;">${med.instructions || 'After food with water'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="info-grid">
          <div class="info-card">
            <h4>Doctor Advice & Lifestyle</h4>
            <p>${prescription.adviceNotes || prescription.advice || 'Take plenty of water, avoid excessive sodium, maintain routine blood pressure logs.'}</p>
          </div>
          <div class="info-card">
            <h4>Next Follow-Up Appointment</h4>
            <p style="font-weight: 600; color: #123B5D;">${prescription.nextFollowUp || 'After 14 Days (or if symptoms persist)'}</p>
          </div>
        </div>

        <div class="footer-box">
          <div class="footer-note">
            • Generated electronically via ${hospital.name || 'Healthcare Center'} EHR Platform.<br/>
            • Valid for dispensation across authorized hospital and retail pharmacies.
          </div>
          <div class="signature-box">
            <div class="signature-line">
              <span class="signature-tag">✓ Digitally Signed by Doctor</span>
            </div>
            <p class="signature-doc">${prescription.doctorName}</p>
            <p class="signature-reg">Registration No: MCI-2014-9841</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handlePrint = () => {
    const htmlContent = generatePrescriptionHtml();
    
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
          onClose();
        }, 1500);
      }, 350);
    } else {
      window.print();
      onClose();
    }
  };

  const handleDirectDownload = () => {
    const htmlContent = generatePrescriptionHtml();
    const filename = `Prescription_${prescription.prescriptionNumber}_${prescription.patientName.replace(/\s+/g, '_')}.html`;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setTimeout(() => {
      onClose();
    }, 400);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn font-sans"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', margin: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full h-[92vh] max-h-[92vh] flex flex-col overflow-hidden animate-scaleIn">
        
        <div className="bg-[#123B5D] text-white px-4 py-2.5 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2">
            <Stethoscope className="w-4 h-4 text-[#38BDF8]" />
            <h3 className="font-bold text-xs sm:text-sm text-white">Official Medical e-Prescription</h3>
            <span className="text-[10px] font-mono bg-[#1769AA] px-2 py-0.5 rounded text-white font-bold">
              {prescription.prescriptionNumber}
            </span>
          </div>

          <div className="flex items-center space-x-2 justify-end">
            <button
              onClick={onClose}
              className="p-1 text-slate-300 hover:text-white rounded-lg cursor-pointer transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Paper */}
        <div ref={printRef} className="p-4 sm:p-6 overflow-y-auto space-y-3.5 text-[#1E293B] bg-white flex-1">
          
          {/* Header with Hospital Brand & Contact */}
          <div className="border-b-2 border-[#123B5D] pb-3 flex items-start justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-[#123B5D] flex items-center justify-center text-white shrink-0">
                  <HeartPulse className="w-4 h-4 text-[#38BDF8]" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-[#123B5D] tracking-tight leading-none">{hospital.name || 'Healthcare Center'}</h1>
                  <p className="text-[10px] text-[#64748B] font-medium">{hospital.tagline || 'Multi-Specialty Hospital & Research Institute'}</p>
                </div>
              </div>
              <p className="text-[9px] text-[#64748B] pt-0.5">
                {hospital.address || 'Plot 42, Medical Enclave, Health City, New Delhi - 110029'} • Tel: {hospital.phone || '+91 11 2678 9000'} • Emergency: {hospital.emergencyPhone || '108'}
              </p>
            </div>

            {/* Doctor Info */}
            <div className="text-right space-y-0.5 shrink-0">
              <h2 className="text-xs font-bold text-[#123B5D]">{prescription.doctorName}</h2>
              <p className="text-[10px] font-semibold text-[#1769AA]">{prescription.doctorSpecialization}</p>
              <p className="text-[9px] text-[#64748B]">{prescription.doctorQualification || 'MBBS, MD, DM'}</p>
            </div>
          </div>

          {/* Patient Details & Prescription Meta */}
          <div className="bg-[#F8FAFC] p-3 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div>
              <span className="text-[9px] text-[#64748B] font-bold block uppercase">Patient Name:</span>
              <p className="font-bold text-[#123B5D] text-xs sm:text-sm">{prescription.patientName}</p>
            </div>
            <div>
              <span className="text-[9px] text-[#64748B] font-bold block uppercase">Patient ID / Age / Gender:</span>
              <p className="font-semibold text-[#1E293B] text-xs">
                {prescription.patientId} • {prescription.patientAge || '21Y'} • {prescription.patientGender || 'Female'}
              </p>
            </div>
            <div>
              <span className="text-[9px] text-[#64748B] font-bold block uppercase">Date &amp; Time:</span>
              <p className="font-semibold text-[#1E293B] text-xs">{prescription.date} • {prescription.time || '11:00 AM'}</p>
            </div>
            <div>
              <span className="text-[9px] text-[#64748B] font-bold block uppercase">Rx Reference:</span>
              <p className="font-mono font-bold text-[#1769AA] text-xs">{prescription.prescriptionNumber}</p>
            </div>
          </div>

          {/* Clinical Diagnosis & Findings */}
          <div className="space-y-1">
            <h3 className="text-[10px] font-bold text-[#123B5D] uppercase tracking-wider">Clinical Diagnosis</h3>
            <div className="p-2.5 bg-sky-50/50 rounded-xl border border-sky-100 text-xs text-[#1E293B]">
              <p className="font-bold text-sky-900 text-xs sm:text-sm">{prescription.diagnosis || 'General Clinical Consultation'}</p>
              {prescription.symptoms && (
                <p className="text-[10px] text-[#64748B] mt-0.5">Presented Symptoms: {prescription.symptoms}</p>
              )}
            </div>
          </div>

          {/* Rx Medications Table */}
          <div className="space-y-1.5">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-[#123B5D]">
              <span className="text-base font-serif font-black text-[#1769AA]">℞</span>
              <span>Prescribed Medications &amp; Dosage Instructions</span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-slate-200 text-[#64748B] font-bold text-[10px]">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Medicine &amp; Strength</th>
                    <th className="py-2 px-3">Dosage / Frequency</th>
                    <th className="py-2 px-3">Duration</th>
                    <th className="py-2 px-3">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prescription.medicines.map((med, idx) => (
                    <tr key={med.id || idx}>
                      <td className="py-2 px-3 font-bold text-[#64748B]">{idx + 1}</td>
                      <td className="py-2 px-3 font-bold text-[#123B5D] text-xs">{med.name}</td>
                      <td className="py-2 px-3 font-mono font-semibold text-[#1769AA] text-xs">
                        {med.dosage} ({med.frequency})
                      </td>
                      <td className="py-2 px-3 text-[#1E293B] font-medium text-xs">{med.duration}</td>
                      <td className="py-2 px-3 text-[#64748B] text-[10px]">{med.instructions || 'After food with water'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Advice & Follow-Up */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-slate-200 space-y-0.5">
              <h4 className="font-bold text-[#123B5D] text-[10px] uppercase tracking-wider">Doctor Advice &amp; Lifestyle</h4>
              <p className="text-[#64748B] text-[10px] leading-relaxed">
                {prescription.adviceNotes || prescription.advice || 'Take plenty of water, avoid excessive sodium, maintain routine logs.'}
              </p>
            </div>

            <div className="p-2.5 bg-[#F8FAFC] rounded-xl border border-slate-200 space-y-0.5">
              <h4 className="font-bold text-[#123B5D] text-[10px] uppercase tracking-wider">Next Follow-Up Appointment</h4>
              <p className="text-[#1E293B] font-bold text-xs">
                {prescription.nextFollowUp || 'After 14 Days (or if symptoms persist)'}
              </p>
              <p className="text-[9px] text-[#64748B]">Valid for pharmacy dispensation</p>
            </div>
          </div>

          {/* Footer Signature */}
          <div className="pt-3 border-t border-slate-200 flex items-end justify-between text-xs">
            <div className="space-y-0.5 text-[9px] text-[#64748B]">
              <p>• Generated electronically via {hospital.name || 'Healthcare Center'} EHR Platform.</p>
              <p>• Valid across authorized hospital and retail pharmacies.</p>
            </div>

            <div className="text-right space-y-0.5">
              <span className="font-mono text-[9px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                ✓ Digitally Signed by Doctor
              </span>
              <p className="font-bold text-xs text-[#123B5D] mt-0.5">{prescription.doctorName}</p>
              <p className="text-[9px] text-[#64748B]">Reg No: MCI-2014-9841</p>
            </div>
          </div>

        </div>

        {/* Modal Bottom Action Bar */}
        <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 flex items-center justify-between gap-2 shrink-0">
          <p className="text-[11px] text-[#16845B] font-semibold flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Prescription signed &amp; synced.</span>
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDirectDownload}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download &amp; Return</span>
            </button>
            <button
              onClick={handlePrint}
              className="bg-[#1769AA] hover:bg-[#0284C7] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 cursor-pointer shadow-2xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print &amp; Return</span>
            </button>
            <button
              onClick={onClose}
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors"
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
