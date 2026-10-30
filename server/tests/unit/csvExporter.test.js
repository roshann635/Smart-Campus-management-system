import { describe, it, expect } from 'vitest';
import { convertToCSV } from '../../src/utils/csvExporter.js';

describe('CSV Exporter Unit Tests', () => {
  it('converts objects to RFC-4180 compliant CSV', () => {
    const data = [
      { id: 1, name: 'Alice Smith', department: 'CSE' },
      { id: 2, name: 'Bob Johnson', department: 'ECE' },
    ];
    const csv = convertToCSV(data);
    expect(csv).toContain('"id","name","department"');
    expect(csv).toContain('"1","Alice Smith","CSE"');
    expect(csv).toContain('"2","Bob Johnson","ECE"');
  });

  it('escapes quotes and handles special characters properly', () => {
    const data = [
      { id: 1, note: 'Special "quotes" and, commas' },
    ];
    const csv = convertToCSV(data);
    expect(csv).toContain('"Special ""quotes"" and, commas"');
  });

  it('returns empty string or headers for empty dataset', () => {
    expect(convertToCSV([])).toBe('');
    expect(convertToCSV([], ['col1', 'col2'])).toBe('"col1","col2"\r\n');
  });
});

