import { describe, it, expect } from 'vitest';
import { calculateGrade, calculateAttendanceMetrics, GRADING_TIERS } from '../../src/utils/grading.js';

describe('Academic Grading Engine Unit Tests', () => {
  it('correctly assigns Grade O (Outstanding, 10 pts) for percentage >= 90', () => {
    const result1 = calculateGrade(95, 100);
    expect(result1.grade).toBe('O');
    expect(result1.points).toBe(10);
    expect(result1.percentage).toBe(95);

    const boundary = calculateGrade(90, 100);
    expect(boundary.grade).toBe('O');
    expect(boundary.points).toBe(10);
  });

  it('correctly assigns Grade A+ (Excellent, 9 pts) for 80% <= score < 90%', () => {
    const result = calculateGrade(42, 50); // 84%
    expect(result.grade).toBe('A+');
    expect(result.points).toBe(9);
    expect(result.percentage).toBe(84);
  });

  it('correctly assigns Grade A (Very Good, 8 pts) for 70% <= score < 80%', () => {
    const result = calculateGrade(38, 50); // 76%
    expect(result.grade).toBe('A');
    expect(result.points).toBe(8);
  });

  it('correctly assigns Grade B+ (Good, 7 pts) for 60% <= score < 70%', () => {
    const result = calculateGrade(65, 100);
    expect(result.grade).toBe('B+');
    expect(result.points).toBe(7);
  });

  it('correctly assigns Grade B (Above Average, 6 pts) for 50% <= score < 60%', () => {
    const result = calculateGrade(55, 100);
    expect(result.grade).toBe('B');
    expect(result.points).toBe(6);
  });

  it('correctly assigns Grade C (Pass, 5 pts) for 40% <= score < 50%', () => {
    const result = calculateGrade(40, 100);
    expect(result.grade).toBe('C');
    expect(result.points).toBe(5);
  });

  it('correctly assigns Grade F (Fail, 0 pts) for score < 40%', () => {
    const result = calculateGrade(39.9, 100);
    expect(result.grade).toBe('F');
    expect(result.points).toBe(0);
  });

  it('throws an error if marks obtained exceeds max_marks', () => {
    expect(() => calculateGrade(105, 100)).toThrow(/cannot exceed maximum marks/);
  });

  it('throws an error if marks obtained is negative', () => {
    expect(() => calculateGrade(-5, 100)).toThrow(/cannot be negative/);
  });

  it('throws an error if maximum marks is non-positive or invalid', () => {
    expect(() => calculateGrade(50, 0)).toThrow(/Invalid marks/);
    expect(() => calculateGrade(50, -10)).toThrow(/Invalid marks/);
  });
});

describe('Attendance Percentage Formula Unit Tests', () => {
  it('correctly calculates 100% attendance when all sessions are Present or Late', () => {
    const records = [
      { status: 'Present' },
      { status: 'Present' },
      { status: 'Late' },
    ];
    const metrics = calculateAttendanceMetrics(records);
    expect(metrics.total).toBe(3);
    expect(metrics.attended).toBe(3);
    expect(metrics.percentage).toBe(100.0);
  });

  it('correctly calculates fractional percentage (Present + Late counted, Absent excluded)', () => {
    // 3 Present, 1 Late, 1 Absent out of 5 total = 4/5 = 80.00%
    const records = [
      { status: 'Present' },
      { status: 'Present' },
      { status: 'Present' },
      { status: 'Late' },
      { status: 'Absent' },
    ];
    const metrics = calculateAttendanceMetrics(records);
    expect(metrics.total).toBe(5);
    expect(metrics.present).toBe(3);
    expect(metrics.late).toBe(1);
    expect(metrics.absent).toBe(1);
    expect(metrics.attended).toBe(4);
    expect(metrics.percentage).toBe(80.0);
  });

  it('returns 0% for empty record set', () => {
    const metrics = calculateAttendanceMetrics([]);
    expect(metrics.total).toBe(0);
    expect(metrics.percentage).toBe(0.0);
  });
});

