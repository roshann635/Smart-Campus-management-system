import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Building2, Calendar, Key } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import DigitalStudentCard from '../components/DigitalStudentCard';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shadow-indigo-200">
            {user.first_name?.[0] || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {user.first_name} {user.last_name}
            </h2>
            <p className="text-xs text-slate-400 capitalize">{user.role} Account Profile</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Registered Email
            </span>
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <Mail className="w-4 h-4 text-indigo-500" />
              <span>{user.email}</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Assigned Role
            </span>
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <Shield className="w-4 h-4 text-indigo-500" />
              <span className="capitalize">{user.role}</span>
            </div>
          </div>

          {user.roll_number && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Student Roll Number
              </span>
              <span className="font-bold text-indigo-600 font-mono text-sm">{user.roll_number}</span>
            </div>
          )}

          {user.employee_code && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Faculty Employee Code
              </span>
              <span className="font-bold text-indigo-600 font-mono text-sm">{user.employee_code}</span>
            </div>
          )}

          {user.department_name && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Academic Department
              </span>
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <Building2 className="w-4 h-4 text-indigo-500" />
                <span>{user.department_name}</span>
              </div>
            </div>
          )}

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Account Status
            </span>
            <StatusBadge status={user.status} />
          </div>
        </div>
      </div>

      {/* Digital Student Identity Card for Students */}
      {user.role === 'student' && (
        <DigitalStudentCard user={user} />
      )}
    </div>
  );
}

