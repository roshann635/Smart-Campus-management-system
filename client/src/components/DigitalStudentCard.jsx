import React from 'react';
import { GraduationCap, ShieldCheck, Printer, Calendar, BookOpen, User, Hash } from 'lucide-react';

export default function DigitalStudentCard({ student, user }) {
  if (!student && !user) return null;

  const firstName = student?.first_name || user?.first_name || 'Campus';
  const lastName = student?.last_name || user?.last_name || 'Student';
  const rollNumber = student?.roll_number || user?.roll_number || 'CS2023001';
  const departmentName = student?.department_name || user?.department_name || 'Computer Science & Engineering';
  const email = student?.email || user?.email || 'student@campus.edu';
  const enrollmentYear = student?.enrollment_year || 2023;
  const validUntil = Number(enrollmentYear) + 4;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-600" />
            Digital Campus Student Identity Card
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically verified student credential for campus access & library services
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition border border-indigo-200"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Card</span>
        </button>
      </div>

      {/* Realistic ID Badge Card */}
      <div className="max-w-md mx-auto bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-indigo-500/30">
        {/* Background Watermark Pattern */}
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <GraduationCap className="w-64 h-64 text-white" />
        </div>

        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-indigo-400/30 pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold tracking-wider uppercase">Smart Campus University</h4>
              <p className="text-[9px] text-indigo-200 uppercase tracking-widest font-semibold">Official Student Identity Card</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> ACTIVE
          </span>
        </div>

        {/* Card Body */}
        <div className="flex items-center space-x-4 mb-4">
          {/* Avatar Photo Frame */}
          <div className="w-20 h-24 rounded-xl bg-slate-800 border-2 border-indigo-300/40 flex flex-col items-center justify-center text-indigo-200 shadow-inner flex-shrink-0 relative overflow-hidden">
            <User className="w-10 h-10 text-indigo-300/60" />
            <span className="text-[8px] uppercase tracking-wider text-indigo-300 mt-1 font-bold">Photo</span>
          </div>

          <div className="min-w-0 space-y-1">
            <h3 className="text-base font-extrabold text-white truncate">
              {firstName} {lastName}
            </h3>
            <div className="text-[11px] text-indigo-200 flex items-center gap-1">
              <Hash className="w-3 h-3 text-indigo-300 flex-shrink-0" />
              <span className="font-mono font-bold text-white tracking-wider">{rollNumber}</span>
            </div>
            <p className="text-[11px] text-indigo-200 font-medium truncate">
              {departmentName}
            </p>
            <p className="text-[10px] text-indigo-300/80 font-mono truncate">
              {email}
            </p>
          </div>
        </div>

        {/* Card Footer Details */}
        <div className="grid grid-cols-2 gap-2 text-[10px] pt-3 border-t border-indigo-400/20 text-indigo-200">
          <div>
            <span className="text-indigo-400 block text-[9px] uppercase tracking-wider font-semibold">Enrollment Year</span>
            <span className="font-semibold text-white">{enrollmentYear}</span>
          </div>
          <div className="text-right">
            <span className="text-indigo-400 block text-[9px] uppercase tracking-wider font-semibold">Valid Through</span>
            <span className="font-semibold text-white">June {validUntil}</span>
          </div>
        </div>

        {/* Barcode Simulator */}
        <div className="mt-4 pt-3 border-t border-indigo-400/20 flex flex-col items-center">
          <div className="h-7 w-full flex items-center justify-center space-x-1 opacity-80">
            {Array.from({ length: 32 }).map((_, i) => (
              <div
                key={i}
                className="bg-white h-full"
                style={{ width: `${(i % 3 === 0 ? 3 : i % 2 === 0 ? 1.5 : 2)}px` }}
              />
            ))}
          </div>
          <span className="text-[8px] font-mono tracking-widest text-indigo-300 mt-1">
            SCMS-{rollNumber}-{enrollmentYear}
          </span>
        </div>
      </div>
    </div>
  );
}

