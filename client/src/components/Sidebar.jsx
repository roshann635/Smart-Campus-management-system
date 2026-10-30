import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  UserCheck,
  CalendarCheck2,
  Award,
  FileBarChart,
  ShieldCheck,
  User,
  Calendar,
  FileText,
  FileCheck2,
  CreditCard,
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();

  const navItems = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, roles: ['administrator', 'faculty', 'student'] },
    { label: 'Departments', to: '/departments', icon: Building2, roles: ['administrator'] },
    { label: 'Students', to: '/students', icon: GraduationCap, roles: ['administrator', 'faculty'] },
    { label: 'Faculty', to: '/faculty', icon: Users, roles: ['administrator'] },
    { label: 'Courses', to: '/courses', icon: BookOpen, roles: ['administrator', 'faculty', 'student'] },
    { label: 'Timetable', to: '/timetable', icon: Calendar, roles: ['administrator', 'faculty', 'student'] },
    { label: 'Enrollments', to: '/enrollments', icon: UserCheck, roles: ['administrator'] },
    { label: 'Attendance', to: '/attendance', icon: CalendarCheck2, roles: ['administrator', 'faculty', 'student'] },
    { label: 'Leave Requests', to: '/leaves', icon: FileText, roles: ['administrator', 'faculty', 'student'] },
    { label: 'Exams & Results', to: '/exams-results', icon: Award, roles: ['administrator', 'faculty', 'student'] },
    { label: 'Official Transcript', to: '/transcript', icon: FileCheck2, roles: ['administrator', 'faculty', 'student'] },
    { label: 'Fees & Invoices', to: '/fees', icon: CreditCard, roles: ['administrator', 'student'] },
    { label: 'Reports', to: '/reports', icon: FileBarChart, roles: ['administrator', 'faculty'] },
    { label: 'Audit Logs', to: '/audit-logs', icon: ShieldCheck, roles: ['administrator'] },
    { label: 'My Profile', to: '/profile', icon: User, roles: ['administrator', 'faculty', 'student'] },
  ];

  const visibleItems = navItems.filter((item) => item.roles.includes(user?.role));

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-65px)] flex flex-col justify-between py-5 px-3 shrink-0">
      <nav className="space-y-1">
        <p className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Navigation</p>
        {visibleItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="px-3 pt-4 border-t border-slate-100">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/60">
          <p className="text-[11px] font-semibold text-slate-600">Smart Campus v1.0.0</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Relational DBMS Project</p>
        </div>
      </div>
    </aside>
  );
}

