import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
 
interface SalarySlipProps {
  member: {
    id?: string;
    name?: string;
    role?: string;
    department?: string;
    joinedDate?: string;
  } | null;
  entry: {
    month?: string;
    basePay?: number;
    allowance?: number;
    deduction?: number;
    absentDays?: number;
    payoutStatus?: string;
  };
  onClose: () => void;
}
 
const numberToWords = (num: number): string => {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
 
  const numStr = num.toString();
  if (numStr.length > 9) return 'overflow';
  const n = ('000000000' + numStr).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str += (Number(n[1]) != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
  str += (Number(n[2]) != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
  str += (Number(n[3]) != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
  str += (Number(n[4]) != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
  str += (Number(n[5]) != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
  return str.trim() + ' Only';
};
 
const SalarySlip: React.FC<SalarySlipProps> = ({ member, entry, onClose }) => {
  const money = (n: number) => `₹${n.toLocaleString('en-IN')}`;
  const rawMoney = (n: number) => n.toLocaleString('en-IN');
  const formatDate = (date?: string) => {
    if (!date) return '--/--/----';
    return new Date(date).toLocaleDateString('en-GB');
  };

  const totalEarnings = (entry?.basePay || 0) + (entry?.allowance || 0);
  const totalDeductions = entry?.deduction || 0;
  const netPay = totalEarnings - totalDeductions;
  const workedDays = 30 - (entry?.absentDays || 0);
  const payPeriod = new Date(`${entry?.month || '2026-01'}-01`).toLocaleString('default', { month: 'long', year: 'numeric' });
 
  const handlePrint = () => {
    window.print();
  };
 
  return (
    <div className="salary-slip-root bg-white p-2 md:p-4 w-full max-w-[980px] mx-auto font-sans text-zinc-900 border border-zinc-300 shadow-sm rounded-lg">
      <div id="salary-slip-printable" className="bg-white border border-zinc-300 rounded-lg print:border-0 print:rounded-none">
        <div className="px-4 md:px-6 py-4 border-b border-zinc-300">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Temple Governance System</p>
              <h1 className="text-xl md:text-2xl font-display font-bold leading-tight mt-1">Salary Payslip</h1>
              <p className="text-xs text-zinc-600 mt-0.5">Main Temple St, Spiritual City</p>
            </div>
            <div className="text-left md:text-right text-xs">
              <p className="text-zinc-500">Pay Period</p>
              <p className="font-semibold text-sm">{payPeriod}</p>
              <p className="text-zinc-600 mt-0.5">Employee ID: {member?.id || 'N/A'}</p>
            </div>
          </div>
        </div>

        <div className="px-4 md:px-6 py-4 space-y-4 print:px-0 print:py-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div className="flex justify-between border-b border-zinc-200 py-1"><span className="text-zinc-600">Employee Name</span><span className="font-semibold">{member?.name || 'N/A'}</span></div>
            <div className="flex justify-between border-b border-zinc-200 py-1"><span className="text-zinc-600">Date of Joining</span><span className="font-semibold">{formatDate(member?.joinedDate || '2018-06-23')}</span></div>
            <div className="flex justify-between border-b border-zinc-200 py-1"><span className="text-zinc-600">Designation</span><span className="font-semibold">{member?.role || 'N/A'}</span></div>
            <div className="flex justify-between border-b border-zinc-200 py-1"><span className="text-zinc-600">Department</span><span className="font-semibold">{member?.department || 'N/A'}</span></div>
            <div className="flex justify-between border-b border-zinc-200 py-1"><span className="text-zinc-600">Worked Days</span><span className="font-semibold">{workedDays}</span></div>
            <div className="flex justify-between border-b border-zinc-200 py-1"><span className="text-zinc-600">Payout Status</span><span className="font-semibold">{entry?.payoutStatus || 'Pending'}</span></div>
          </div>

          <div className="border border-zinc-300 rounded-md overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-300 bg-zinc-100">
                  <th className="text-left py-2 px-3 font-semibold border-r border-zinc-300">Earnings</th>
                  <th className="text-right py-2 px-3 font-semibold border-r border-zinc-300">Amount</th>
                  <th className="text-left py-2 px-3 font-semibold border-r border-zinc-300">Deductions</th>
                  <th className="text-right py-2 px-3 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-zinc-200">
                  <td className="py-2 px-3 border-r border-zinc-200">Basic Pay</td>
                  <td className="py-2 px-3 text-right border-r border-zinc-200">{rawMoney(entry?.basePay || 0)}</td>
                  <td className="py-2 px-3 border-r border-zinc-200">Loss of Pay</td>
                  <td className="py-2 px-3 text-right">{rawMoney(totalDeductions)}</td>
                </tr>
                <tr className="border-b border-zinc-200">
                  <td className="py-2 px-3 border-r border-zinc-200">Travel Allowance</td>
                  <td className="py-2 px-3 text-right border-r border-zinc-200">{rawMoney(entry?.allowance || 0)}</td>
                  <td className="py-2 px-3 border-r border-zinc-200 text-zinc-500">Other Deductions</td>
                  <td className="py-2 px-3 text-right text-zinc-500">---</td>
                </tr>
                <tr className="font-semibold bg-zinc-100">
                  <td className="py-2 px-3 border-r border-zinc-300">Total Earnings</td>
                  <td className="py-2 px-3 text-right border-r border-zinc-300">{rawMoney(totalEarnings)}</td>
                  <td className="py-2 px-3 border-r border-zinc-300">Total Deductions</td>
                  <td className="py-2 px-3 text-right">{rawMoney(totalDeductions)}</td>
                </tr>
                <tr className="font-bold">
                  <td className="py-2.5 px-3 border-r border-zinc-300">Net Salary</td>
                  <td className="py-2.5 px-3 text-right border-r border-zinc-300">{rawMoney(netPay)}</td>
                  <td className="py-2.5 px-3 border-r border-zinc-300">In Words</td>
                  <td className="py-2.5 px-3 text-right">{numberToWords(netPay)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-xs text-zinc-600 border-t border-zinc-200 pt-3">
            This is a system-generated payslip.
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mt-4 print:hidden border-t border-zinc-300 pt-4">
        <Button onClick={onClose} variant="ghost" className="flex-1 font-semibold h-10 rounded-md text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 transition-colors">
          Close Preview
        </Button>
        <Button onClick={handlePrint} className="flex-1 font-semibold h-10 rounded-md bg-black hover:bg-zinc-800 text-white">
          <Printer className="w-4 h-4 mr-2" /> Print Payslip
        </Button>
        <Button variant="outline" onClick={handlePrint} className="flex-1 font-semibold h-10 rounded-md border-zinc-400 text-zinc-800 hover:bg-zinc-100 transition-colors">
          <Download className="w-4 h-4 mr-2" /> Save as PDF
        </Button>
      </div>
    </div>
  );
};
 
export default SalarySlip;
 
 