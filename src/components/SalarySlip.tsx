import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Download, Flower2, ShieldCheck, MapPin, Phone } from 'lucide-react';

interface SalarySlipProps {
  member: any;
  entry: any;
  onClose: () => void;
}

const SalarySlip: React.FC<SalarySlipProps> = ({ member, entry, onClose }) => {
  const money = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white p-0 md:p-4 max-w-2xl mx-auto">
      <div id="salary-slip-printable" className="border-4 border-double border-slate-200 p-8 bg-white relative overflow-hidden print:border-none print:p-0">
        {/* Temple Watermark Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <Flower2 className="w-96 h-96 text-slate-900" />
        </div>

        {/* Header */}
        <div className="relative z-10 text-center border-b-2 border-slate-100 pb-6 mb-6">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-[#293088] rounded-2xl flex items-center justify-center shadow-lg">
              <Flower2 className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-display font-bold text-[#1e246a] uppercase tracking-wider">Temple Governance</h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Trust Management & Religious Services</p>
          <div className="flex justify-center gap-4 mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Main Temple St, Spiritual City</span>
            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> +91 98765 43210</span>
          </div>
        </div>

        {/* Slip Title */}
        <div className="relative z-10 flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Monthly Salary Statement</h2>
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mt-0.5">For the month of {entry.month}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Slip ID</p>
            <p className="text-sm font-mono font-bold text-slate-700">{entry.id}</p>
          </div>
        </div>

        {/* Employee Details Grid */}
        <div className="relative z-10 grid grid-cols-2 gap-y-4 gap-x-8 mb-8 p-5 bg-slate-50 rounded-2xl border border-slate-100">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Employee Name</p>
            <p className="text-base font-bold text-slate-800">{member?.name}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Employee ID</p>
            <p className="text-base font-mono font-bold text-slate-800">{member?.id}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Designation</p>
            <p className="text-sm font-bold text-slate-700">{member?.role} - {member?.department}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">Contact</p>
            <p className="text-sm font-bold text-slate-700">{member?.phone}</p>
          </div>
        </div>

        {/* Earnings & Deductions Table */}
        <div className="relative z-10 flex flex-col md:flex-row gap-8 mb-8">
          {/* Earnings */}
          <div className="flex-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">Earnings Breakdown</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-1 border-b border-dashed border-slate-100">
                <span className="text-sm font-semibold text-slate-600">Basic Salary</span>
                <span className="text-sm font-bold text-slate-800">{money(entry.basePay)}</span>
              </div>
              <div className="flex justify-between items-center pb-1 border-b border-dashed border-slate-100">
                <span className="text-sm font-semibold text-slate-600">Standard Allowance</span>
                <span className="text-sm font-bold text-emerald-600">+{money(entry.allowance)}</span>
              </div>
              <div className="flex justify-between items-center pt-2 font-bold">
                <span className="text-sm text-slate-700">Gross Earnings</span>
                <span className="text-base text-slate-900">{money(entry.basePay + entry.allowance)}</span>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="flex-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 mb-3">Deductions / Adjustments</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-1 border-b border-dashed border-slate-100">
                <span className="text-sm font-semibold text-slate-600">Loss of Pay ({entry.absentDays || 0} Absences)</span>
                <span className="text-sm font-bold text-rose-600">-{money(entry.deduction)}</span>
              </div>
              <div className="flex justify-between items-center pb-1 border-b border-dashed border-slate-100">
                <span className="text-sm font-semibold text-slate-600">TDS / PF (Statutory)</span>
                <span className="text-[10px] font-bold text-slate-400 italic">Not Applicable</span>
              </div>
              <div className="flex justify-between items-center pt-2 font-bold">
                <span className="text-sm text-slate-700">Total Deductions</span>
                <span className="text-base text-rose-800">{money(entry.deduction)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Pay Highlight */}
        <div className="relative z-10 bg-[#f8faff] rounded-2xl p-6 border-2 border-indigo-50 flex items-center justify-between mb-8">
          <div>
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1">Total Net Payable</p>
            <p className="text-3xl font-display font-bold text-[#1e246a] tracking-tight">{money(entry.netPay)}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">Payment Status</p>
            <div className={`px-4 py-1.5 rounded-full text-xs font-bold ${entry.payoutStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-amber-100 text-amber-800 border-amber-200'} border shadow-sm inline-block`}>
              {entry.payoutStatus}
            </div>
          </div>
        </div>

        {/* Footer & Signatures */}
        <div className="relative z-10 grid grid-cols-2 gap-8 mt-12 mb-4">
          <div className="text-center pt-8 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Employee Signature</p>
            <p className="text-sm font-display font-bold text-slate-400 opacity-20 italic">Signature Not Required for Digital Slip</p>
          </div>
          <div className="text-center pt-8 border-t border-slate-100 relative">
            <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 opacity-60">
              <ShieldCheck className="w-12 h-12 text-indigo-800 opacity-20" />
            </div>
            <p className="text-[10px] font-bold text-[#293088] uppercase tracking-widest mb-1">Trustee / Authorized Signatory</p>
            <p className="font-display text-indigo-900 font-bold tracking-tight opacity-40">Digitally Verified Document</p>
          </div>
        </div>

        {/* Print Date */}
        <div className="relative z-10 text-center mt-8 pt-4 border-t border-slate-50 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
          Generated via Temple Governance on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Buttons (Hidden on Print) */}
      <div className="flex gap-4 mt-8 print:hidden">
        <Button onClick={onClose} variant="ghost" className="flex-1 font-bold h-12 rounded-xl text-slate-500">Close Preview</Button>
        <Button onClick={handlePrint} className="flex-1 font-bold h-12 rounded-xl bg-slate-800 hover:bg-slate-900 text-white shadow-lg shadow-slate-200">
          <Printer className="w-4 h-4 mr-2" /> Print Statement
        </Button>
        <Button variant="outline" className="flex-1 font-bold h-12 rounded-xl border-slate-200">
          <Download className="w-4 h-4 mr-2" /> Save PDF
        </Button>
      </div>
    </div>
  );
};

export default SalarySlip;
