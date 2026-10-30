import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ToastNotification from '../components/ToastNotification';
import { Award, Plus, Save, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/formatters';

export default function ExamsAndResultsPage() {
  const { user, isStudent, isFaculty, isAdmin } = useAuth();

  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedExam, setSelectedExam] = useState(null);
  const [roster, setRoster] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [saving, setSaving] = useState(false);

  // Student specific
  const [studentResults, setStudentResults] = useState([]);
  const [loadingStudent, setLoadingStudent] = useState(false);

  // Create exam modal
  const [modalOpen, setModalOpen] = useState(false);
  const [examFormData, setExamFormData] = useState({
    course_id: '',
    exam_name: '',
    exam_type: 'Midterm',
    exam_date: new Date().toISOString().split('T')[0],
    max_marks: 50,
  });
  const [formError, setFormError] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (isStudent) {
      fetchStudentResults();
    } else {
      fetchCoursesAndExams();
    }
  }, [isStudent]);

  useEffect(() => {
    if (selectedExamId && !isStudent) {
      fetchExamRoster(selectedExamId);
    }
  }, [selectedExamId]);

  const fetchStudentResults = async () => {
    try {
      setLoadingStudent(true);
      const res = await api.get(`/results/student/${user.student_id}`);
      if (res.data?.success) setStudentResults(res.data.data);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to load results.' });
    } finally {
      setLoadingStudent(false);
    }
  };

  const fetchCoursesAndExams = async () => {
    try {
      const [crsRes, exRes] = await Promise.all([
        api.get('/courses'),
        api.get('/exams'),
      ]);
      if (crsRes.data?.success) {
        let availableCourses = crsRes.data.data;
        if (isFaculty) {
          availableCourses = availableCourses.filter(
            (c) => Number(c.faculty_id) === Number(user.faculty_id)
          );
        }
        setCourses(availableCourses);
      }
      if (exRes.data?.success) {
        let availableExams = exRes.data.data;
        if (isFaculty) {
          const facultyCourseIds = courses.map((c) => c.course_id);
          availableExams = availableExams.filter((e) => facultyCourseIds.includes(e.course_id));
        }
        setExams(availableExams);
        if (availableExams.length > 0) {
          setSelectedExamId(availableExams[0].exam_id);
        }
      }
    } catch {}
  };

  const fetchExamRoster = async (examId) => {
    try {
      setLoadingRoster(true);
      const res = await api.get(`/results/exam/${examId}`);
      if (res.data?.success) {
        setSelectedExam(res.data.data.exam);
        const maxMarks = parseFloat(res.data.data.exam.max_marks);
        const processed = res.data.data.roster.map((r) => {
          const marks = r.marks_obtained !== null ? parseFloat(r.marks_obtained) : '';
          return {
            ...r,
            marks_obtained: marks,
            liveGrade: marks !== '' ? computeGrade(marks, maxMarks) : '—',
          };
        });
        setRoster(processed);
      }
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to load exam grading sheet.' });
    } finally {
      setLoadingRoster(false);
    }
  };

  const computeGrade = (marks, maxMarks) => {
    const m = parseFloat(marks);
    const max = parseFloat(maxMarks);
    if (isNaN(m) || isNaN(max) || max <= 0) return '—';
    const pct = (m / max) * 100;
    if (pct >= 90) return 'O';
    if (pct >= 80) return 'A+';
    if (pct >= 70) return 'A';
    if (pct >= 60) return 'B+';
    if (pct >= 50) return 'B';
    if (pct >= 40) return 'C';
    return 'F';
  };

  const handleMarksChange = (enrollmentId, val) => {
    const maxMarks = selectedExam ? parseFloat(selectedExam.max_marks) : 100;
    setRoster((prev) =>
      prev.map((r) => {
        if (r.enrollment_id === enrollmentId) {
          const liveGrade = val !== '' ? computeGrade(val, maxMarks) : '—';
          return { ...r, marks_obtained: val, liveGrade };
        }
        return r;
      })
    );
  };

  const handleSaveMarks = async () => {
    setSaving(true);
    try {
      // Filter out empty rows
      const validResults = roster
        .filter((r) => r.marks_obtained !== '' && !isNaN(parseFloat(r.marks_obtained)))
        .map((r) => ({
          enrollment_id: r.enrollment_id,
          marks_obtained: parseFloat(r.marks_obtained),
        }));

      if (validResults.length === 0) {
        setToast({ type: 'error', message: 'Please enter marks for at least one student.' });
        setSaving(false);
        return;
      }

      await api.post('/results/bulk', {
        exam_id: Number(selectedExamId),
        results: validResults,
      });

      setToast({ type: 'success', message: 'Exam results graded and saved successfully.' });
      fetchExamRoster(selectedExamId);
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Failed to save results.' });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      await api.post('/exams', {
        ...examFormData,
        course_id: Number(examFormData.course_id),
        max_marks: parseFloat(examFormData.max_marks),
      });
      setToast({ type: 'success', message: 'Exam schedule created successfully.' });
      setModalOpen(false);
      fetchCoursesAndExams();
    } catch (err) {
      setFormError(err.message || 'Failed to schedule exam.');
    }
  };

  // Student Columns
  const studentColumns = [
    {
      header: 'Course',
      accessor: 'course_code',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-800">{row.course_code}</span>
          <span className="text-xs text-slate-500 ml-2">{row.course_name}</span>
        </div>
      ),
    },
    {
      header: 'Exam Title',
      accessor: 'exam_name',
      className: 'font-semibold text-slate-800',
    },
    {
      header: 'Exam Type',
      accessor: 'exam_type',
      className: 'text-xs text-slate-500',
    },
    {
      header: 'Date',
      accessor: 'exam_date',
      render: (row) => formatDate(row.exam_date),
      className: 'text-xs',
    },
    {
      header: 'Marks Obtained',
      accessor: 'marks_obtained',
      className: 'text-center font-mono font-medium',
      render: (row) => `${row.marks_obtained} / ${row.max_marks}`,
    },
    {
      header: 'Grade Awarded',
      accessor: 'grade',
      className: 'text-center',
      render: (row) => <StatusBadge status={row.grade} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-600" />
            Exams & Grading Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isStudent
              ? 'Academic evaluation scores, standardized grades, and examination records'
              : 'Create examination assessments, enter marks, and compute letter grades'}
          </p>
        </div>

        {!isStudent && (
          <button
            onClick={() => {
              setFormError(null);
              setModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Exam</span>
          </button>
        )}
      </div>

      {isStudent ? (
        <DataTable
          columns={studentColumns}
          data={studentResults}
          loading={loadingStudent}
          emptyMessage="No graded examination records available for your profile."
        />
      ) : (
        /* FACULTY & ADMIN GRADING SHEET */
        <div className="space-y-6">
          {/* Exam Selector */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex-1 max-w-lg">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Select Examination to Grade
              </label>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="w-full py-2 px-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                {exams.length === 0 ? (
                  <option value="">No Scheduled Exams</option>
                ) : (
                  exams.map((ex) => (
                    <option key={ex.exam_id} value={ex.exam_id}>
                      {ex.course_code}: {ex.exam_name} ({ex.exam_type}, Max: {ex.max_marks})
                    </option>
                  ))
                )}
              </select>
            </div>

            {selectedExam && (
              <div className="text-xs text-slate-500 bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-200/80">
                <span className="font-semibold text-slate-700">Exam Details: </span>
                {selectedExam.exam_type} • Date: {formatDate(selectedExam.exam_date)} • Maximum Marks:{' '}
                <span className="font-bold text-slate-800">{selectedExam.max_marks}</span>
              </div>
            )}
          </div>

          {/* Grading Sheet */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {loadingRoster ? (
              <LoadingSpinner size="md" text="Loading examination roster..." />
            ) : roster.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No students enrolled in this course to grade.</p>
              </div>
            ) : (
              <div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                      <tr>
                        <th className="px-6 py-3.5">Roll Number</th>
                        <th className="px-6 py-3.5">Student Name</th>
                        <th className="px-6 py-3.5 text-center">Marks Obtained (Max: {selectedExam?.max_marks})</th>
                        <th className="px-6 py-3.5 text-center">Live Grade Preview</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {roster.map((row) => (
                        <tr key={row.enrollment_id} className="hover:bg-slate-50/70 transition">
                          <td className="px-6 py-4 font-bold text-indigo-600 text-xs">{row.roll_number}</td>
                          <td className="px-6 py-4 font-semibold text-slate-800 text-xs">{row.student_name}</td>
                          <td className="px-6 py-4 text-center">
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max={selectedExam?.max_marks}
                              value={row.marks_obtained}
                              onChange={(e) => handleMarksChange(row.enrollment_id, e.target.value)}
                              placeholder="0.0"
                              className="w-24 text-center px-2 py-1.5 text-xs font-mono font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                          </td>
                          <td className="px-6 py-4 text-center">
                            <StatusBadge status={row.liveGrade} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    Standardized Grading Scale: O (≥90%), A+ (≥80%), A (≥70%), B+ (≥60%), B (≥50%), C (≥40%), F (&lt;40%)
                  </span>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleSaveMarks}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition shadow-sm disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Submitting Marks...' : 'Save & Record Grades'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Schedule Exam Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Schedule Examination" maxWidth="max-w-md">
        {formError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {formError}
          </div>
        )}
        <form onSubmit={handleCreateExam} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Select Course
            </label>
            <select
              required
              value={examFormData.course_id}
              onChange={(e) => setExamFormData({ ...examFormData, course_id: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="">Select Course</option>
              {courses.map((c) => (
                <option key={c.course_id} value={c.course_id}>
                  {c.course_code} - {c.course_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Examination Name
            </label>
            <input
              type="text"
              required
              value={examFormData.exam_name}
              onChange={(e) => setExamFormData({ ...examFormData, exam_name: e.target.value })}
              placeholder="e.g. Midterm Examination"
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Exam Type
              </label>
              <select
                required
                value={examFormData.exam_type}
                onChange={(e) => setExamFormData({ ...examFormData, exam_type: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="Midterm">Midterm</option>
                <option value="Final">Final</option>
                <option value="Quiz">Quiz</option>
                <option value="Practical">Practical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Max Marks
              </label>
              <input
                type="number"
                min="1"
                required
                value={examFormData.max_marks}
                onChange={(e) => setExamFormData({ ...examFormData, max_marks: e.target.value })}
                className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Exam Date
            </label>
            <input
              type="date"
              required
              value={examFormData.exam_date}
              onChange={(e) => setExamFormData({ ...examFormData, exam_date: e.target.value })}
              className="w-full px-3.5 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
            >
              Confirm Schedule
            </button>
          </div>
        </form>
      </Modal>

      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

