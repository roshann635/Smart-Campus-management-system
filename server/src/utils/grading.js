/**
 * Deterministic Academic Formulas & Grading Engine
 */

export const GRADING_TIERS = [
  { minPercent: 90.0, grade: 'O',  points: 10, description: 'Outstanding' },
  { minPercent: 80.0, grade: 'A+', points: 9,  description: 'Excellent' },
  { minPercent: 70.0, grade: 'A',  points: 8,  description: 'Very Good' },
  { minPercent: 60.0, grade: 'B+', points: 7,  description: 'Good' },
  { minPercent: 50.0, grade: 'B',  points: 6,  description: 'Above Average' },
  { minPercent: 40.0, grade: 'C',  points: 5,  description: 'Pass' },
  { minPercent: 0.0,  grade: 'F',  points: 0,  description: 'Fail' },
];

/**
 * Calculates standardized letter grade and grade points from marks obtained and maximum marks.
 * @param {number} marksObtained 
 * @param {number} maxMarks 
 * @returns {{ percentage: number, grade: string, points: number, description: string }}
 */
export function calculateGrade(marksObtained, maxMarks) {
  const marks = parseFloat(marksObtained);
  const max = parseFloat(maxMarks);

  if (isNaN(marks) || isNaN(max) || max <= 0) {
    throw new Error('Invalid marks or maximum marks parameters.');
  }

  if (marks < 0) {
    throw new Error('Marks obtained cannot be negative.');
  }

  if (marks > max) {
    throw new Error(`Marks obtained (${marks}) cannot exceed maximum marks (${max}).`);
  }

  const rawPercentage = (marks / max) * 100;
  const percentage = Math.round(rawPercentage * 100) / 100; // Round to 2 decimals

  for (const tier of GRADING_TIERS) {
    if (percentage >= tier.minPercent) {
      return {
        percentage,
        grade: tier.grade,
        points: tier.points,
        description: tier.description,
      };
    }
  }

  return { percentage, grade: 'F', points: 0, description: 'Fail' };
}

/**
 * Computes attendance percentage compliant with the university policy:
 * Present + Late counts towards attendance.
 * Attendance % = ((Present + Late) / Total Classes) * 100
 * @param {Array<{ status: 'Present' | 'Absent' | 'Late' }>} records 
 * @returns {{ total: number, present: number, late: number, absent: number, attended: number, percentage: number }}
 */
export function calculateAttendanceMetrics(records = []) {
  if (!Array.isArray(records) || records.length === 0) {
    return { total: 0, present: 0, late: 0, absent: 0, attended: 0, percentage: 0.0 };
  }

  let present = 0;
  let late = 0;
  let absent = 0;

  for (const rec of records) {
    const s = String(rec.status).toLowerCase();
    if (s === 'present') present++;
    else if (s === 'late') late++;
    else if (s === 'absent') absent++;
  }

  const total = records.length;
  const attended = present + late;
  const percentage = Math.round(((attended / total) * 100) * 100) / 100;

  return {
    total,
    present,
    late,
    absent,
    attended,
    percentage,
  };
}

