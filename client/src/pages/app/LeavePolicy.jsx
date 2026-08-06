import React, { useState } from 'react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import { FileText, Plus, CheckCircle2, ShieldAlert } from 'lucide-react';

const LeavePolicy = () => {
  const [policies, setPolicies] = useState([
    { id: 1, type: 'Casual Leave (CL)', entitlement: '12 Days / Year', carryForward: 'Max 3 Days', paid: true },
    { id: 2, type: 'Medical / Sick Leave (SL)', entitlement: '10 Days / Year', carryForward: 'No Carry Forward', paid: true },
    { id: 3, type: 'Annual Paid Leave (PL)', entitlement: '15 Days / Year', carryForward: 'Max 10 Days', paid: true },
    { id: 4, type: 'Maternity / Paternity Leave', entitlement: '90 Days / Special', carryForward: 'N/A', paid: true },
    { id: 5, type: 'Unpaid Leave (LWP)', entitlement: 'Unlimited (Approval Req.)', carryForward: 'N/A', paid: false },
  ]);

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      <AppPageHeader title="Leave Policy Configuration" subtitle="Define leave categories, entitlement quotas, and carry-over limits" />

      <div className="flex items-center justify-between bg-white dark:bg-[#1E293B] p-4 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Active Policies ({policies.length})</h3>
          <p className="text-xs text-slate-400">Rules applied automatically when staff submit leave requests</p>
        </div>
        <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl flex items-center gap-2 cursor-pointer transition-all">
          <Plus className="w-4 h-4" />
          <span>New Policy Rule</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {policies.map((p) => (
          <div key={p.id} className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  p.paid ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                }`}>
                  {p.paid ? 'PAID LEAVE' : 'UNPAID'}
                </span>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-1.5">{p.type}</h4>
              </div>
              <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <FileText className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-2 text-xs pt-2">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Annual Quota:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">{p.entitlement}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Carry Forward Limit:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{p.carryForward}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Enforced System-wide</span>
              <button className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer">
                Edit Policy
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeavePolicy;
