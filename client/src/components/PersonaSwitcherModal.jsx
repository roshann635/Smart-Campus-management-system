import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, BookOpen, GraduationCap, CheckCircle, ArrowRight, X, AlertTriangle } from 'lucide-react';

export default function PersonaSwitcherModal({ isOpen, onClose }) {
  const { user, login } = useAuth();
  const [loadingEmail, setLoadingEmail] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const personas = [
    {
      category: 'Institutional Authority',
      role: 'administrator',
      name: 'Campus Administrator',
      email: 'admin@campus.edu',
      designation: 'Chief Academic Officer & DBMS Administrator',
      department: 'Central Administration',
      badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
      icon: Shield,
      description: 'Global oversight, Department/Course/Student CRUD, CSV report generation, full system audit trail inspection.',
    },
    {
      category: 'Faculty Instruction',
      role: 'faculty',
      name: 'Prof. Alan Turing',
      email: 'faculty1@campus.edu',
      designation: 'Associate Professor',
      department: 'Computer Science & Engineering',
      badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
      icon: BookOpen,
      description: 'Assigned Course: CS301 Database Systems. Can record daily attendance, schedule exams, enter marks, and view class reports.',
    },
    {
      category: 'Faculty Instruction',
      role: 'faculty',
      name: 'Prof. Ada Lovelace',
      email: 'faculty2@campus.edu',
      designation: 'Professor & Chair',
      department: 'Electronics & Communication',
      badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
      icon: BookOpen,
      description: 'Assigned Course: EC201 Digital Signal Processing. Strictly isolated by backend RBAC from modifying CSE courses.',
    },
    {
      category: 'Student Dossier',
      role: 'student',
      name: 'Adhikari Himesh Sunil',
      email: 'student1@campus.edu',
      designation: 'Roll No: CS2025001',
      department: 'Computer Science (Year 2025)',
      badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      icon: GraduationCap,
      description: 'Roll No. 1: GPA 10.0, Attendance 100%. View personal academic dossier, schedule, and grade transcripts.',
    },
    {
      category: 'Student Dossier',
      role: 'student',
      name: 'Bagul Sanjana Bharat',
      email: 'student2@campus.edu',
      designation: 'Roll No: CS2025002',
      department: 'Computer Science (Year 2025)',
      badgeColor: 'bg-amber-100 text-amber-700 border-amber-200',
      icon: GraduationCap,
      description: 'Roll No. 2: Attendance 66.7% (<75% threshold), GPA 8.0. Triggers academic warning advisory alerts.',
    },
    {
      category: 'Student Dossier',
      role: 'student',
      name: 'Baisane Vaibhav Satyavijay',
      email: 'student3@campus.edu',
      designation: 'Roll No: CS2025003',
      department: 'Computer Science (Year 2025)',
      badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      icon: GraduationCap,
      description: 'Roll No. 3: GPA 9.0, Attendance 100%. Demonstrates student ownership boundary & personal grade sheet isolation.',
    },
    {
      category: 'Student Dossier',
      role: 'student',
      name: 'Patil Sangram Prashant',
      email: 'student75@campus.edu',
      designation: 'Roll No: CS2025075',
      department: 'Mechanical Engineering (Year 2025)',
      badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
      icon: GraduationCap,
      description: 'Roll No. 75: Batch representative. Verified student identity credential with printable digital campus card.',
    },
  ];

  const handleSwitch = async (persona) => {
    try {
      setLoadingEmail(persona.email);
      setError(null);
      await login(persona.email, 'Campus@123');
      onClose();
      // Reload current page to refresh data for new role
      window.location.reload();
    } catch (err) {
      setError(err.message || 'Failed to switch persona.');
    } finally {
      setLoadingEmail(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse"></span>
              <h2 className="text-lg font-bold text-slate-800">1-Click Evaluator Persona Switcher</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Instantly authenticate as any role for live grading, defense demonstrations, and RBAC boundary verification.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Persona Cards Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {personas.map((p) => {
            const Icon = p.icon;
            const isCurrent = user?.email === p.email;
            const isLoading = loadingEmail === p.email;

            return (
              <div
                key={p.email}
                onClick={() => !isCurrent && !isLoading && handleSwitch(p)}
                className={`relative p-4 rounded-xl border text-left transition-all ${
                  isCurrent
                    ? 'border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-indigo-300 hover:shadow-md cursor-pointer bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0">
                      <Icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-800">{p.name}</h4>
                        {isCurrent && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded">
                            <CheckCircle className="w-3 h-3" /> Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">{p.designation}</p>
                      <p className="text-[11px] text-slate-400">{p.department}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${p.badgeColor} uppercase tracking-wider`}>
                    {p.role}
                  </span>
                </div>

                <p className="text-xs text-slate-600 mt-3 pt-3 border-t border-slate-100 line-clamp-2">
                  {p.description}
                </p>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] text-slate-400">{p.email}</span>
                  {!isCurrent && (
                    <button
                      disabled={isLoading}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      {isLoading ? 'Switching...' : 'Switch Persona'}
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>All accounts use shared evaluation credentials: <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-indigo-600">Campus@123</code></span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

