import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Filter,
  Printer,
  AlertCircle,
  GraduationCap,
  Building,
  User,
} from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00'
];

export default function TimetablePage() {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [semesterFilter, setSemesterFilter] = useState('All');
  const [myScheduleOnly, setMyScheduleOnly] = useState(user.role === 'faculty');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [formData, setFormData] = useState({
    course_id: '',
    day_of_week: 'Monday',
    start_time: '09:00:00',
    end_time: '10:00:00',
    room_number: 'Room 101',
    semester: 4,
    academic_year: '2025-2026',
  });

  useEffect(() => {
    fetchTimetable();
    if (user.role === 'administrator') {
      fetchCourses();
    }
  }, [semesterFilter]);

  const fetchTimetable = async () => {
    try {
      setLoading(true);
      const params = {};
      if (semesterFilter !== 'All') params.semester = semesterFilter;
      const res = await api.get('/timetable', { params });
      if (res.data?.success) {
        setSlots(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch timetable slots:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      if (res.data?.success) {
        setCourses(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
    }
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    setModalError(null);
    setModalLoading(true);

    try {
      await api.post('/timetable', {
        ...formData,
        course_id: Number(formData.course_id),
        semester: Number(formData.semester),
      });
      setIsModalOpen(false);
      fetchTimetable();
      setFormData({
        course_id: courses[0]?.course_id || '',
        day_of_week: 'Monday',
        start_time: '09:00:00',
        end_time: '10:00:00',
        room_number: 'Room 101',
        semester: 4,
        academic_year: '2025-2026',
      });
    } catch (err) {
      setModalError(err.message || 'Failed to schedule class.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to remove this scheduled lecture slot?')) return;
    try {
      await api.delete(`/timetable/${slotId}`);
      setSlots(slots.filter((s) => s.slot_id !== slotId));
    } catch (err) {
      alert(err.message || 'Failed to delete slot.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter slots for faculty/student personalization
  const displaySlots = slots.filter((slot) => {
    if (myScheduleOnly && user.role === 'faculty') {
      return Number(slot.faculty_id) === Number(user.faculty_id);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600" />
            Class Timetable & Room Allocation
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Clash-free relational academic scheduling with room & instructor conflict prevention.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {user.role === 'faculty' && (
            <button
              onClick={() => setMyScheduleOnly(!myScheduleOnly)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
                myScheduleOnly
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {myScheduleOnly ? '✓ My Assigned Lectures' : 'Show All Lectures'}
            </button>
          )}

          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-600">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Semester:</span>
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="bg-transparent font-semibold focus:outline-none text-slate-800"
            >
              <option value="All">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={s}>Semester {s}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Schedule
          </button>

          {user.role === 'administrator' && (
            <button
              onClick={() => {
                if (courses.length > 0 && !formData.course_id) {
                  setFormData((prev) => ({ ...prev, course_id: courses[0].course_id }));
                }
                setModalError(null);
                setIsModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              Schedule Class
            </button>
          )}
        </div>
      </div>

      {/* Timetable Grid View */}
      {loading ? (
        <LoadingSpinner size="lg" text="Loading timetable slots..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <th className="py-3 px-4 w-28 border-r border-slate-200">Day</th>
                  <th className="py-3 px-4">Scheduled Lectures & Room Allocations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {DAYS.map((day) => {
                  const daySlots = displaySlots.filter((s) => s.day_of_week === day);
                  return (
                    <tr key={day} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-4 font-bold text-slate-800 bg-slate-50/30 border-r border-slate-200 align-top">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700">
                          {day}
                        </span>
                        <div className="text-[10px] text-slate-400 font-normal mt-1">
                          {daySlots.length} lecture{daySlots.length === 1 ? '' : 's'}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {daySlots.length === 0 ? (
                          <span className="text-slate-400 italic">No scheduled lectures for this day.</span>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {daySlots
                              .sort((a, b) => a.start_time.localeCompare(b.start_time))
                              .map((slot) => {
                                const isMyClass =
                                  user.role === 'faculty' &&
                                  Number(slot.faculty_id) === Number(user.faculty_id);

                                return (
                                  <div
                                    key={slot.slot_id}
                                    className={`p-3.5 rounded-xl border relative group transition-all ${
                                      isMyClass
                                        ? 'bg-indigo-50/70 border-indigo-200 shadow-xs'
                                        : 'bg-white border-slate-200 hover:border-slate-300'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-bold text-xs text-indigo-600 bg-indigo-100/70 px-1.5 py-0.5 rounded">
                                            {slot.course_code}
                                          </span>
                                          <span className="text-[10px] font-semibold text-slate-500">
                                            Sem {slot.semester}
                                          </span>
                                        </div>
                                        <h4 className="font-bold text-slate-800 text-xs mt-1 leading-snug line-clamp-1">
                                          {slot.course_name}
                                        </h4>
                                      </div>

                                      {user.role === 'administrator' && (
                                        <button
                                          onClick={() => handleDeleteSlot(slot.slot_id)}
                                          className="text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition p-1"
                                          title="Delete slot"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>

                                    <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-600 gap-y-1">
                                      <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3 text-slate-400" />
                                        <span className="font-mono font-medium">
                                          {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1 font-semibold text-slate-700">
                                        <MapPin className="w-3 h-3 text-amber-500" />
                                        <span>{slot.room_number}</span>
                                      </div>
                                    </div>

                                    <div className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-500 truncate">
                                      <User className="w-3 h-3 text-slate-400 shrink-0" />
                                      <span className="truncate">
                                        Prof. {slot.faculty_first_name} {slot.faculty_last_name}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Schedule New Slot */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in duration-200">
            <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Schedule New Class
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Allocate a clash-free room and instructor slot.
            </p>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSlot} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course</label>
                <select
                  required
                  value={formData.course_id}
                  onChange={(e) => {
                    const c = courses.find((crs) => crs.course_id === Number(e.target.value));
                    setFormData({
                      ...formData,
                      course_id: e.target.value,
                      semester: c ? c.semester : formData.semester,
                    });
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">Select course...</option>
                  {courses.map((c) => (
                    <option key={c.course_id} value={c.course_id}>
                      {c.course_code} - {c.course_name} (Sem {c.semester})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Day of Week</label>
                  <select
                    value={formData.day_of_week}
                    onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Room Number</label>
                  <input
                    type="text"
                    required
                    value={formData.room_number}
                    onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                    placeholder="e.g. Room 101, Lab 2"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={formData.start_time.slice(0, 5)}
                    onChange={(e) => setFormData({ ...formData, start_time: `${e.target.value}:00` })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={formData.end_time.slice(0, 5)}
                    onChange={(e) => setFormData({ ...formData, end_time: `${e.target.value}:00` })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Semester</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    required
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Academic Year</label>
                  <input
                    type="text"
                    required
                    value={formData.academic_year}
                    onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold disabled:opacity-50"
                >
                  {modalLoading ? 'Validating Clashes...' : 'Confirm Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

