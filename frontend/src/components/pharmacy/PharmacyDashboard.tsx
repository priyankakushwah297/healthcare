import React, { useState } from 'react';
import {
  Pill,
  Search,
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  FileText,
  CreditCard,
  Plus,
  ArrowRight
} from 'lucide-react';
import { useHospital } from '../../context/HospitalContext';
import { Prescription } from '../../types';

import { PortalSidebar } from '../layout/PortalSidebar';

export const PharmacyDashboard: React.FC = () => {
  const { prescriptions, hospital } = useHospital();

  const [activeSubTab, setActiveSubTab] = useState<string>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [dispensedList, setDispensedList] = useState<string[]>([]);
  const [successMsg, setSuccessMsg] = useState('');

  // Mock Pharmacy Inventory
  const [inventory, setInventory] = useState([
    { id: '1', name: 'Tab Telmisartan 40mg', stock: 450, unitPrice: 8.5, category: 'Cardiac', reorderLevel: 100 },
    { id: '2', name: 'Tab Metformin 500mg', stock: 620, unitPrice: 4.0, category: 'Diabetes', reorderLevel: 150 },
    { id: '3', name: 'Tab Rosuvastatin 10mg', stock: 80, unitPrice: 14.0, category: 'Lipid', reorderLevel: 100 },
    { id: '4', name: 'Cap Amoxicillin 500mg', stock: 240, unitPrice: 12.0, category: 'Antibiotic', reorderLevel: 80 },
    { id: '5', name: 'Tab Paracetamol 650mg', stock: 1200, unitPrice: 2.5, category: 'Analgesic', reorderLevel: 200 },
    { id: '6', name: 'Tab Pantoprazole 40mg', stock: 380, unitPrice: 9.0, category: 'Antacid', reorderLevel: 100 }
  ]);

  const handleDispense = (rxId: string) => {
    setDispensedList(prev => [...prev, rxId]);
    setSuccessMsg(`Prescription ${selectedRx?.prescriptionNumber} dispensed & inventory automatically adjusted!`);
    setTimeout(() => setSuccessMsg(''), 4000);
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
                Pharmacy &amp; Dispensing Counter
              </span>
              <span className="text-xs text-slate-300">
                License: DL-2024-PH-991
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Hospital Pharmacy Dispensation
            </h2>
            <p className="text-xs text-slate-200">
              {hospital.name} • Live e-Prescription Fulfillment &amp; Inventory Management
            </p>
          </div>
        </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-[#16845B]" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prescription Queue */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <h3 className="font-bold text-sm text-[#123B5D]">e-Prescriptions Queue</h3>
            <span className="text-xs text-[#159A9C] font-semibold">{prescriptions.length} Issued</span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {prescriptions.map((rx) => {
              const isDispensed = dispensedList.includes(rx.id);
              return (
                <div
                  key={rx.id}
                  onClick={() => setSelectedRx(rx)}
                  className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                    selectedRx?.id === rx.id ? 'bg-[#E8F6F6] border-[#159A9C]' : 'bg-[#F7FAFC] border-[#E2E8F0] hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#159A9C]">{rx.prescriptionNumber}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isDispensed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {isDispensed ? 'DISPENSED' : 'PENDING'}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-[#123B5D] mt-1">{rx.patientName}</h4>
                  <p className="text-[11px] text-[#64748B]">Dr. {rx.doctorName} • {rx.date}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Prescription Dispense & Bill Area */}
        <div className="lg:col-span-2 space-y-6">
          {selectedRx ? (
            <div className="bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div>
                  <span className="text-xs font-bold text-[#159A9C]">{selectedRx.prescriptionNumber}</span>
                  <h3 className="font-bold text-base text-[#123B5D]">{selectedRx.patientName}</h3>
                  <p className="text-xs text-[#64748B]">Diagnosis: {selectedRx.diagnosis}</p>
                </div>

                <div className="text-right text-xs">
                  <p className="font-semibold text-[#1E293B]">Prescribed by {selectedRx.doctorName}</p>
                  <p className="text-[#64748B]">{selectedRx.date}</p>
                </div>
              </div>

              {/* Medicines Table */}
              <div className="border border-[#E2E8F0] rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#123B5D] text-white">
                    <tr>
                      <th className="py-2 px-3">Medicine</th>
                      <th className="py-2 px-3">Dosage</th>
                      <th className="py-2 px-3">Frequency</th>
                      <th className="py-2 px-3">Duration</th>
                      <th className="py-2 px-3">Instructions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedRx.medicines.map((m, i) => (
                      <tr key={i} className="hover:bg-[#F7FAFC]">
                        <td className="py-2.5 px-3 font-bold text-[#123B5D]">{m.name}</td>
                        <td className="py-2.5 px-3">{m.dosage}</td>
                        <td className="py-2.5 px-3 text-[#159A9C] font-semibold">{m.frequency}</td>
                        <td className="py-2.5 px-3">{m.duration}</td>
                        <td className="py-2.5 px-3 text-[#64748B]">{m.instructions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  onClick={() => handleDispense(selectedRx.id)}
                  disabled={dispensedList.includes(selectedRx.id)}
                  className="bg-[#16845B] hover:bg-emerald-800 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md flex items-center space-x-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{dispensedList.includes(selectedRx.id) ? 'Dispensed' : 'Dispense Medications & Print Bill'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-[#E2E8F0]">
              <Pill className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-[#1E293B]">Select a prescription from the queue</p>
              <p className="text-[11px] text-[#64748B]">Click any patient prescription on the left to review medicines & dispense.</p>
            </div>
          )}

          {/* Pharmacy Stock Table */}
          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-[#123B5D] flex items-center space-x-2">
              <Pill className="w-4 h-4 text-[#1769AA]" />
              <span>Real-time Medication Inventory & Stock Levels</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7FAFC] border-b border-[#E2E8F0] text-[#64748B]">
                  <tr>
                    <th className="py-2 px-3">Item Name</th>
                    <th className="py-2 px-3">Category</th>
                    <th className="py-2 px-3">In Stock</th>
                    <th className="py-2 px-3">Unit Price</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inventory.map((item) => (
                    <tr key={item.id}>
                      <td className="py-2.5 px-3 font-semibold text-[#1E293B]">{item.name}</td>
                      <td className="py-2.5 px-3 text-[#64748B]">{item.category}</td>
                      <td className="py-2.5 px-3 font-bold text-[#123B5D]">{item.stock} Units</td>
                      <td className="py-2.5 px-3 font-mono">₹{item.unitPrice.toFixed(2)}</td>
                      <td className="py-2.5 px-3">
                        {item.stock <= item.reorderLevel ? (
                          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                            Reorder Alert
                          </span>
                        ) : (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded">
                            Adequate
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};
