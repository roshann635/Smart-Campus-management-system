import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

// Pages
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import DepartmentsPage from '../pages/DepartmentsPage';
import StudentsPage from '../pages/StudentsPage';
import StudentDetailPage from '../pages/StudentDetailPage';
import FacultyPage from '../pages/FacultyPage';
import CoursesPage from '../pages/CoursesPage';
import EnrollmentsPage from '../pages/EnrollmentsPage';
import AttendancePage from '../pages/AttendancePage';
import ExamsAndResultsPage from '../pages/ExamsAndResultsPage';
import ReportsPage from '../pages/ReportsPage';
import AuditLogsPage from '../pages/AuditLogsPage';
import ProfilePage from '../pages/ProfilePage';
import TimetablePage from '../pages/TimetablePage';
import LeaveManagementPage from '../pages/LeaveManagementPage';
import TranscriptPage from '../pages/TranscriptPage';
import FeesAndPaymentsPage from '../pages/FeesAndPaymentsPage';
import UnauthorizedPage from '../pages/UnauthorizedPage';
import NotFoundPage from '../pages/NotFoundPage';

function AppLayout() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        {isAuthenticated && <Sidebar />}
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Authenticated Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/timetable" element={<TimetablePage />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/leaves" element={<LeaveManagementPage />} />
              <Route path="/exams-results" element={<ExamsAndResultsPage />} />
              <Route path="/transcript" element={<TranscriptPage />} />
              <Route path="/fees" element={<FeesAndPaymentsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Student Dossier & Transcript: All roles permitted at route level; backend enforces isolation */}
            <Route element={<ProtectedRoute allowedRoles={['administrator', 'faculty', 'student']} />}>
              <Route path="/students/:id" element={<StudentDetailPage />} />
              <Route path="/students/:id/transcript" element={<TranscriptPage />} />
            </Route>

            {/* Admin & Faculty Routes */}
            <Route element={<ProtectedRoute allowedRoles={['administrator', 'faculty']} />}>
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>

            {/* Admin Only Routes */}
            <Route element={<ProtectedRoute allowedRoles={['administrator']} />}>
              <Route path="/departments" element={<DepartmentsPage />} />
              <Route path="/faculty" element={<FacultyPage />} />
              <Route path="/enrollments" element={<EnrollmentsPage />} />
              <Route path="/audit-logs" element={<AuditLogsPage />} />
            </Route>

            {/* System Status Pages */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={<AppLayout />} />
    </Routes>
  );
}

