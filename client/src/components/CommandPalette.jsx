import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Command,
  LayoutDashboard,
  Building2,
  GraduationCap,
  Users,
  BookOpen,
  UserCheck,
  CalendarCheck2,
  FileSpreadsheet,
  FileBarChart,
  ShieldAlert,
  Database,
  Zap,
  ArrowRight,
  CreditCard,
  X,
} from 'lucide-react';

export default function CommandPalette({ isOpen, onClose, onOpenDiagnostics, onOpenPersonaSwitcher }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { user, isStudent, isFaculty, isAdmin } = useAuth();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(false); // toggle handled by parent
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const allActions = [
    // Navigation
    { id: 'nav-dash', category: 'Navigation', title: 'Dashboard', subtitle: 'View KPI analytics and activity stream', icon: LayoutDashboard, role: 'all', action: () => navigate('/dashboard') },
    { id: 'nav-dept', category: 'Navigation', title: 'Departments', subtitle: 'Manage academic departments & codes', icon: Building2, role: 'all', action: () => navigate('/departments') },
    { id: 'nav-courses', category: 'Navigation', title: 'Courses Directory', subtitle: 'Explore course catalog & credits', icon: BookOpen, role: 'all', action: () => navigate('/courses') },
    { id: 'nav-timetable', category: 'Navigation', title: 'Class Timetable', subtitle: 'Weekly clash-free lecture & room schedule', icon: CalendarCheck2, role: 'all', action: () => navigate('/timetable') },
    { id: 'nav-att', category: 'Navigation', title: 'Attendance Portal', subtitle: 'Track or mark daily attendance', icon: CalendarCheck2, role: 'all', action: () => navigate('/attendance') },
    { id: 'nav-leaves', category: 'Navigation', title: 'Leave Requests & Excuses', subtitle: 'Student absence applications & faculty review', icon: FileSpreadsheet, role: 'all', action: () => navigate('/leaves') },
    { id: 'nav-exams', category: 'Navigation', title: 'Exams & Marks', subtitle: 'View grade sheets, max marks & GPA', icon: FileSpreadsheet, role: 'all', action: () => navigate('/exams-results') },
    { id: 'nav-transcript', category: 'Navigation', title: 'Official Academic Transcript', subtitle: 'Credit-weighted SGPA/CGPA card with SHA-256 seal', icon: GraduationCap, role: 'all', action: () => navigate('/transcript') },
    { id: 'nav-fees', category: 'Navigation', title: 'Fees & Invoices Ledger', subtitle: 'Tuition fees, batch billing, installment payments & receipts', icon: CreditCard, role: 'all', action: () => navigate('/fees') },
    { id: 'nav-reports', category: 'Navigation', title: 'Academic Reports & Retention', subtitle: 'Aggregated analytics, at-risk warnings & CSV exports', icon: FileBarChart, role: 'faculty_admin', action: () => navigate('/reports') },
    { id: 'nav-audit', category: 'Navigation', title: 'Audit Trail', subtitle: 'Inspect immutable system event logs', icon: ShieldAlert, role: 'admin', action: () => navigate('/audit-logs') },
    { id: 'nav-students', category: 'Navigation', title: 'Student Dossiers', subtitle: 'Browse enrolled students & roll numbers', icon: GraduationCap, role: 'faculty_admin', action: () => navigate('/students') },
    { id: 'nav-faculty', category: 'Navigation', title: 'Faculty Registry', subtitle: 'Browse instructors & employee codes', icon: Users, role: 'faculty_admin', action: () => navigate('/faculty') },
    { id: 'nav-enroll', category: 'Navigation', title: 'Course Enrollments', subtitle: 'Semester registrations & status', icon: UserCheck, role: 'admin', action: () => navigate('/enrollments') },

    // Special Viva & Diagnostics Tools
    { id: 'tool-db', category: 'System Diagnostics & DBMS', title: 'Database & 3NF Schema Inspector', subtitle: 'Inspect MySQL pool, table record counts, and ACID guarantees', icon: Database, role: 'all', action: () => { onClose(); onOpenDiagnostics?.(); } },
    { id: 'tool-switch', category: 'Viva & Presentation', title: 'Quick Persona Switcher', subtitle: 'Instantly toggle between Admin, Faculty, and Student accounts', icon: Zap, role: 'all', action: () => { onClose(); onOpenPersonaSwitcher?.(); } },
  ];

  const filtered = allActions.filter((item) => {
    if (item.role === 'admin' && !isAdmin) return false;
    if (item.role === 'faculty_admin' && isStudent) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const handleSelect = (item) => {
    onClose();
    item.action();
  };

  const handleKeyNavigation = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      handleSelect(filtered[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-sm transition-all animate-fadeIn">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-slate-200">
          <Search className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-base focus:outline-none"
            placeholder="Type a command, page name, or quick action..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyNavigation}
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No matching commands or pages found for "{query}".
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl cursor-pointer transition ${
                    isSelected ? 'bg-indigo-50 text-indigo-900' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition ${
                        isSelected ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{item.title}</span>
                        <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                    </div>
                  </div>
                  <ArrowRight className={`w-4 h-4 text-indigo-500 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span><kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px]">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px]">↓</kbd> to navigate</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px]">↵</kbd> to select</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[10px]">esc</kbd> to dismiss</span>
          </div>
          <span className="font-medium text-indigo-600">Smart Campus Command Engine</span>
        </div>
      </div>
    </div>
  );
}

