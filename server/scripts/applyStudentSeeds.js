import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parsedStudents } from './generateStudentSeeds.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Generate SQL for database/seed.sql
const defaultBcryptHash = '$2a$10$7R9rR.kL23g9M4cW9z2CquGkR7jR9M3fK8nB1xY0zW4vC3tG2p9aO';

let sqlUsers = [
  `(1, 'admin@campus.edu', '${defaultBcryptHash}', 'administrator', 'active')`,
  `(2, 'faculty1@campus.edu', '${defaultBcryptHash}', 'faculty', 'active')`,
  `(3, 'faculty2@campus.edu', '${defaultBcryptHash}', 'faculty', 'active')`,
];

parsedStudents.forEach(s => {
  sqlUsers.push(`(${s.userId}, '${s.email}', '${defaultBcryptHash}', 'student', 'active')`);
});

let sqlStudents = parsedStudents.map(s => {
  return `(${s.studentId}, ${s.userId}, '${s.rollNumber}', '${s.firstName.replace(/'/g, "''")}', '${s.lastName.replace(/'/g, "''")}', '${s.dob}', '${s.phone}', '${s.address}', ${s.enrollmentYear}, ${s.departmentId})`;
});

let sqlEnrollments = [
  `(1, 1, 1, 4, '2025-2026', 'enrolled')`,
  `(2, 1, 2, 3, '2025-2026', 'completed')`,
  `(3, 2, 1, 4, '2025-2026', 'enrolled')`,
  `(4, 2, 2, 3, '2025-2026', 'completed')`,
  `(5, 3, 1, 4, '2025-2026', 'enrolled')`,
];

for (let i = 4; i <= 50; i++) {
  sqlEnrollments.push(`(${i + 2}, ${i}, 1, 4, '2025-2026', 'enrolled')`);
}
for (let i = 51; i <= 65; i++) {
  sqlEnrollments.push(`(${i + 2}, ${i}, 3, 4, '2025-2026', 'enrolled')`);
}

const seedSqlPath = path.resolve(__dirname, '../../database/seed.sql');
let seedSql = fs.readFileSync(seedSqlPath, 'utf8');

// Replace USERS insert
const usersInsertRegex = /INSERT INTO `users`[^;]+;/s;
const newUsersInsert = `INSERT INTO \`users\` (\`user_id\`, \`email\`, \`password_hash\`, \`role\`, \`status\`) VALUES\n` + sqlUsers.join(',\n') + ';';
seedSql = seedSql.replace(usersInsertRegex, newUsersInsert);

// Replace STUDENTS insert
const studentsInsertRegex = /INSERT INTO `students`[^;]+;/s;
const newStudentsInsert = `INSERT INTO \`students\` (\`student_id\`, \`user_id\`, \`roll_number\`, \`first_name\`, \`last_name\`, \`dob\`, \`phone\`, \`address\`, \`enrollment_year\`, \`department_id\`) VALUES\n` + sqlStudents.join(',\n') + ';';
seedSql = seedSql.replace(studentsInsertRegex, newStudentsInsert);

// Replace ENROLLMENTS insert
const enrollmentsInsertRegex = /INSERT INTO `enrollments`[^;]+;/s;
const newEnrollmentsInsert = `INSERT INTO \`enrollments\` (\`enrollment_id\`, \`student_id\`, \`course_id\`, \`semester\`, \`academic_year\`, \`status\`) VALUES\n` + sqlEnrollments.join(',\n') + ';';
seedSql = seedSql.replace(enrollmentsInsertRegex, newEnrollmentsInsert);

fs.writeFileSync(seedSqlPath, seedSql, 'utf8');
console.log('database/seed.sql updated with 75 students.');

// 2. Generate updated server/tests/helpers/testDbHarness.js
const testDbHarnessPath = path.resolve(__dirname, '../tests/helpers/testDbHarness.js');
let harnessJs = fs.readFileSync(testDbHarnessPath, 'utf8');

// Construct JS arrays
const jsUsers = [
  `{ user_id: 1, email: 'admin@campus.edu', password_hash: defaultHash, role: 'administrator', status: 'active' },`,
  `{ user_id: 2, email: 'faculty1@campus.edu', password_hash: defaultHash, role: 'faculty', status: 'active' },`,
  `{ user_id: 3, email: 'faculty2@campus.edu', password_hash: defaultHash, role: 'faculty', status: 'active' },`,
  ...parsedStudents.map(s => `{ user_id: ${s.userId}, email: '${s.email}', password_hash: defaultHash, role: 'student', status: 'active' },`),
  `{ user_id: 79, email: 'inactive@campus.edu', password_hash: defaultHash, role: 'student', status: 'inactive' },`,
];

const jsStudents = parsedStudents.map(s => {
  return `{ student_id: ${s.studentId}, user_id: ${s.userId}, roll_number: '${s.rollNumber}', first_name: '${s.firstName.replace(/'/g, "\\'")}', last_name: '${s.lastName.replace(/'/g, "\\'")}', dob: '${s.dob}', phone: '${s.phone}', address: '${s.address}', enrollment_year: ${s.enrollmentYear}, department_id: ${s.departmentId} },`;
});

const jsEnrollments = [
  `{ enrollment_id: 1, student_id: 1, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },`,
  `{ enrollment_id: 2, student_id: 1, course_id: 2, semester: 3, academic_year: '2025-2026', status: 'completed' },`,
  `{ enrollment_id: 3, student_id: 2, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },`,
  `{ enrollment_id: 4, student_id: 2, course_id: 2, semester: 3, academic_year: '2025-2026', status: 'completed' },`,
  `{ enrollment_id: 5, student_id: 3, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },`,
];

for (let i = 4; i <= 50; i++) {
  jsEnrollments.push(`{ enrollment_id: ${i + 2}, student_id: ${i}, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },`);
}
for (let i = 51; i <= 65; i++) {
  jsEnrollments.push(`{ enrollment_id: ${i + 2}, student_id: ${i}, course_id: 3, semester: 4, academic_year: '2025-2026', status: 'enrolled' },`);
}

// Replace in harnessJs
const harnessUsersRegex = /users:\s*\[[\s\S]*?\],/m;
harnessJs = harnessJs.replace(harnessUsersRegex, `users: [\n        ${jsUsers.join('\n        ')}\n      ],`);

const harnessStudentsRegex = /students:\s*\[[\s\S]*?\],/m;
harnessJs = harnessJs.replace(harnessStudentsRegex, `students: [\n        ${jsStudents.join('\n        ')}\n      ],`);

const harnessEnrollRegex = /enrollments:\s*\[[\s\S]*?\],/m;
harnessJs = harnessJs.replace(harnessEnrollRegex, `enrollments: [\n        ${jsEnrollments.join('\n        ')}\n      ],`);

// Update autoIncrement
harnessJs = harnessJs.replace(/users:\s*\d+,/, 'users: 80,');
harnessJs = harnessJs.replace(/students:\s*\d+,/, 'students: 76,');
harnessJs = harnessJs.replace(/enrollments:\s*\d+,/, 'enrollments: 75,');

fs.writeFileSync(testDbHarnessPath, harnessJs, 'utf8');
console.log('server/tests/helpers/testDbHarness.js updated with 75 students.');

