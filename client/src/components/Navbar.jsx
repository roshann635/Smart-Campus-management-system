import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LogOut,
  User,
  GraduationCap,
  Shield,
  BookOpen,
  Search,
  Database,
  Zap,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import CommandPalette from './CommandPalette';
import PersonaSwitcherModal from './PersonaSwitcherModal';
import DbDiagnosticsModal from './DbDiagnosticsModal';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [isPersonaOpen, setIsPersonaOpen] = useState(false);
  const [isDbDiagOpen, setIsDbDiagOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'administrator':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
            <Shield className="w-3 h-3" /> Admin
          </span>
        );
      case 'faculty':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
            <BookOpen className="w-3 h-3" /> Faculty
          </span>
        );
      case 'student':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
            <GraduationCap className="w-3 h-3" /> Student
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="px-6 py-3 flex items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-sm shadow-indigo-200">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 leading-tight">Smart Campus</h1>
              <p className="text-[11px] text-slate-400 font-medium">Academic Management System</p>
            </div>
          </div>

          {/* Quick Command Search Pill */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <button
              onClick={() => setIsCommandOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-100 text-slate-500 text-xs border border-slate-200 transition"
            >
              <div className="flex items-center space-x-2">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span>Search pages, commands, records...</span>
              </div>
              <div className="flex items-center space-x-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white text-slate-600 font-mono text-[10px] border border-slate-200 shadow-2xs">Ctrl</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-white text-slate-600 font-mono text-[10px] border border-slate-200 shadow-2xs">K</kbd>
              </div>
            </button>
          </div>

          {user && (
            <div className="flex items-center space-x-2.5 sm:space-x-3">
              {/* DBMS Architecture Diagnostics Pill */}
              <button
                onClick={() => setIsDbDiagOpen(true)}
                className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition border border-slate-200"
                title="Inspect MySQL InnoDB Database & 3NF Normalization"
              >
                <Database className="w-3.5 h-3.5 text-indigo-600" />
                <span>DBMS Diagnostics</span>
              </button>

              {/* Notification Center */}
              <NotificationBell />

              {/* 1-Click Viva Persona Switcher Pill */}
              <button
                onClick={() => setIsPersonaOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold transition border border-amber-200 shadow-2xs"
                title="1-Click Switch between Admin, Faculty, and Student accounts"
              >
                <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                <span className="hidden sm:inline">Quick Persona</span>
              </button>

              <div className="h-5 w-px bg-slate-200 hidden sm:block" />

              {/* User Info & Badge */}
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800">
                  {user.first_name} {user.last_name}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">{user.email}</span>
              </div>

              {getRoleBadge(user.role)}

              <div className="h-5 w-px bg-slate-200" />

              {/* Profile Link */}
              <Link
                to="/profile"
                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition"
                title="View Profile"
              >
                <User className="w-4 h-4" />
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition border border-rose-200"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Modals & Command Palette */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        onOpenDiagnostics={() => setIsDbDiagOpen(true)}
        onOpenPersonaSwitcher={() => setIsPersonaOpen(true)}
      />

      <PersonaSwitcherModal
        isOpen={isPersonaOpen}
        onClose={() => setIsPersonaOpen(false)}
      />

      <DbDiagnosticsModal
        isOpen={isDbDiagOpen}
        onClose={() => setIsDbDiagOpen(false)}
      />
    </>
  );
}
