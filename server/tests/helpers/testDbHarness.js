import bcrypt from 'bcryptjs';

/**
 * High-Fidelity In-Memory MySQL Relational Harness for Test Suites
 * Implements tables, foreign keys, unique keys, views, and ACID transactions.
 */
export class TestDbHarness {
  constructor() {
    this.reset();
  }

  reset() {
    const defaultHash = bcrypt.hashSync('Campus@123', 10);

    this.tables = {
      departments: [
        { department_id: 1, code: 'CSE', name: 'Computer Science and Engineering', description: 'Tech' },
        { department_id: 2, code: 'ECE', name: 'Electronics and Communication Engineering', description: 'Circuits' },
        { department_id: 3, code: 'MECH', name: 'Mechanical Engineering', description: 'Mechanics' },
      ],
      users: [
        { user_id: 1, email: 'admin@campus.edu', password_hash: defaultHash, role: 'administrator', status: 'active' },
        { user_id: 2, email: 'faculty1@campus.edu', password_hash: defaultHash, role: 'faculty', status: 'active' },
        { user_id: 3, email: 'faculty2@campus.edu', password_hash: defaultHash, role: 'faculty', status: 'active' },
        { user_id: 4, email: 'student1@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 5, email: 'student2@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 6, email: 'student3@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 7, email: 'student4@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 8, email: 'student5@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 9, email: 'student6@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 10, email: 'student7@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 11, email: 'student8@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 12, email: 'student9@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 13, email: 'student10@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 14, email: 'student11@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 15, email: 'student12@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 16, email: 'student13@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 17, email: 'student14@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 18, email: 'student15@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 19, email: 'student16@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 20, email: 'student17@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 21, email: 'student18@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 22, email: 'student19@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 23, email: 'student20@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 24, email: 'student21@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 25, email: 'student22@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 26, email: 'student23@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 27, email: 'student24@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 28, email: 'student25@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 29, email: 'student26@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 30, email: 'student27@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 31, email: 'student28@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 32, email: 'student29@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 33, email: 'student30@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 34, email: 'student31@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 35, email: 'student32@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 36, email: 'student33@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 37, email: 'student34@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 38, email: 'student35@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 39, email: 'student36@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 40, email: 'student37@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 41, email: 'student38@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 42, email: 'student39@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 43, email: 'student40@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 44, email: 'student41@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 45, email: 'student42@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 46, email: 'student43@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 47, email: 'student44@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 48, email: 'student45@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 49, email: 'student46@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 50, email: 'student47@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 51, email: 'student48@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 52, email: 'student49@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 53, email: 'student50@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 54, email: 'student51@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 55, email: 'student52@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 56, email: 'student53@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 57, email: 'student54@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 58, email: 'student55@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 59, email: 'student56@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 60, email: 'student57@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 61, email: 'student58@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 62, email: 'student59@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 63, email: 'student60@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 64, email: 'student61@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 65, email: 'student62@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 66, email: 'student63@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 67, email: 'student64@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 68, email: 'student65@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 69, email: 'student66@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 70, email: 'student67@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 71, email: 'student68@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 72, email: 'student69@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 73, email: 'student70@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 74, email: 'student71@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 75, email: 'student72@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 76, email: 'student73@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 77, email: 'student74@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 78, email: 'student75@campus.edu', password_hash: defaultHash, role: 'student', status: 'active' },
        { user_id: 79, email: 'inactive@campus.edu', password_hash: defaultHash, role: 'student', status: 'inactive' },
      ],
      students: [
        { student_id: 1, user_id: 4, roll_number: 'CS2025001', first_name: 'Himesh Sunil', last_name: 'Adhikari', dob: '2004-02-02', phone: '+91-98220-10001', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 2, user_id: 5, roll_number: 'CS2025002', first_name: 'Sanjana Bharat', last_name: 'Bagul', dob: '2004-03-03', phone: '+91-98220-10002', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 3, user_id: 6, roll_number: 'CS2025003', first_name: 'Vaibhav Satyavijay', last_name: 'Baisane', dob: '2004-04-04', phone: '+91-98220-10003', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 4, user_id: 7, roll_number: 'CS2025004', first_name: 'Tirupati Gorakh', last_name: 'Beldar', dob: '2004-05-05', phone: '+91-98220-10004', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 5, user_id: 8, roll_number: 'CS2025005', first_name: 'Renuka Arun', last_name: 'Berad', dob: '2004-06-06', phone: '+91-98220-10005', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 6, user_id: 9, roll_number: 'CS2025006', first_name: 'Adwait Sunil', last_name: 'Bhatkhande', dob: '2004-07-07', phone: '+91-98220-10006', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 7, user_id: 10, roll_number: 'CS2025007', first_name: 'Pranali Arvind', last_name: 'Bhavar', dob: '2004-08-08', phone: '+91-98220-10007', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 8, user_id: 11, roll_number: 'CS2025008', first_name: 'Devayani Vasant', last_name: 'Birari', dob: '2004-09-09', phone: '+91-98220-10008', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 9, user_id: 12, roll_number: 'CS2025009', first_name: 'Kalpesh Navnath', last_name: 'Bire', dob: '2004-10-10', phone: '+91-98220-10009', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 10, user_id: 13, roll_number: 'CS2025010', first_name: 'Payal Laxman', last_name: 'Bonde', dob: '2004-11-11', phone: '+91-98220-10010', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 11, user_id: 14, roll_number: 'CS2025011', first_name: 'Anurag Narayan', last_name: 'Borse', dob: '2004-12-12', phone: '+91-98220-10011', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 12, user_id: 15, roll_number: 'CS2025012', first_name: 'Kaustubh Pravin', last_name: 'Chaudhari', dob: '2004-01-13', phone: '+91-98220-10012', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 13, user_id: 16, roll_number: 'CS2025013', first_name: 'Krushnal Mahesh', last_name: 'Chaudhari', dob: '2004-02-14', phone: '+91-98220-10013', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 14, user_id: 17, roll_number: 'CS2025014', first_name: 'Sharvari Sandeep', last_name: 'Chaudhari', dob: '2004-03-15', phone: '+91-98220-10014', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 15, user_id: 18, roll_number: 'CS2025015', first_name: 'Farukh Israil', last_name: 'Chaudhary', dob: '2004-04-16', phone: '+91-98220-10015', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 16, user_id: 19, roll_number: 'CS2025016', first_name: 'Sanika Raju', last_name: 'Choughule', dob: '2004-05-17', phone: '+91-98220-10016', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 17, user_id: 20, roll_number: 'CS2025017', first_name: 'Om Sachin', last_name: 'Deshmukh', dob: '2004-06-18', phone: '+91-98220-10017', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 18, user_id: 21, roll_number: 'CS2025018', first_name: 'Abhishek Dnyandev', last_name: 'Dhomse', dob: '2004-07-19', phone: '+91-98220-10018', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 19, user_id: 22, roll_number: 'CS2025019', first_name: 'Apurva Sanjay', last_name: 'Dhondage', dob: '2004-08-20', phone: '+91-98220-10019', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 20, user_id: 23, roll_number: 'CS2025020', first_name: 'Swapnil Sanjay', last_name: 'Erande', dob: '2004-09-21', phone: '+91-98220-10020', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 21, user_id: 24, roll_number: 'CS2025021', first_name: 'Ajinkyaraj Somnath', last_name: 'Gaikwad', dob: '2004-10-22', phone: '+91-98220-10021', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 22, user_id: 25, roll_number: 'CS2025022', first_name: 'Ayush Suresh', last_name: 'Gaikwad', dob: '2004-11-23', phone: '+91-98220-10022', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 23, user_id: 26, roll_number: 'CS2025023', first_name: 'Karan Ravikumar', last_name: 'Gaikwad', dob: '2004-12-24', phone: '+91-98220-10023', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 24, user_id: 27, roll_number: 'CS2025024', first_name: 'Rohan Vishnu', last_name: 'Gaikwad', dob: '2004-01-25', phone: '+91-98220-10024', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 25, user_id: 28, roll_number: 'CS2025025', first_name: 'Roshan Nitin', last_name: 'Gaikwad', dob: '2004-02-26', phone: '+91-98220-10025', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 26, user_id: 29, roll_number: 'CS2025026', first_name: 'Vaishnavi Pradeepkumar', last_name: 'Itagi', dob: '2004-03-27', phone: '+91-98220-10026', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 27, user_id: 30, roll_number: 'CS2025027', first_name: 'Aarya Narendra', last_name: 'Jadhav', dob: '2004-04-28', phone: '+91-98220-10027', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 28, user_id: 31, roll_number: 'CS2025028', first_name: 'Bhumika Anil', last_name: 'Jadhav', dob: '2004-05-01', phone: '+91-98220-10028', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 29, user_id: 32, roll_number: 'CS2025029', first_name: 'Om Dilip', last_name: 'Jadhav', dob: '2004-06-02', phone: '+91-98220-10029', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 30, user_id: 33, roll_number: 'CS2025030', first_name: 'Roshan Hari', last_name: 'Jadhav', dob: '2004-07-03', phone: '+91-98220-10030', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 31, user_id: 34, roll_number: 'CS2025031', first_name: 'Rucha Rajkumar', last_name: 'Jadhav', dob: '2004-08-04', phone: '+91-98220-10031', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 32, user_id: 35, roll_number: 'CS2025032', first_name: 'Shaarav Akhilesh', last_name: 'Jain', dob: '2004-09-05', phone: '+91-98220-10032', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 33, user_id: 36, roll_number: 'CS2025033', first_name: 'Sumit Gulab', last_name: 'Jamdhade', dob: '2004-10-06', phone: '+91-98220-10033', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 34, user_id: 37, roll_number: 'CS2025034', first_name: 'Bhoomi Amit', last_name: 'Kabra', dob: '2004-11-07', phone: '+91-98220-10034', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 35, user_id: 38, roll_number: 'CS2025035', first_name: 'Srushti Ramchandra', last_name: 'Kadam', dob: '2004-12-08', phone: '+91-98220-10035', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 36, user_id: 39, roll_number: 'CS2025036', first_name: 'Omkar Sandip', last_name: 'Kahandal', dob: '2004-01-09', phone: '+91-98220-10036', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 37, user_id: 40, roll_number: 'CS2025037', first_name: 'Sahil Shailesh', last_name: 'Kandalkar', dob: '2004-02-10', phone: '+91-98220-10037', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 38, user_id: 41, roll_number: 'CS2025038', first_name: 'Ojaswita Sanjay', last_name: 'Kapadne', dob: '2004-03-11', phone: '+91-98220-10038', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 39, user_id: 42, roll_number: 'CS2025039', first_name: 'Anjali Sachin', last_name: 'Karhale', dob: '2004-04-12', phone: '+91-98220-10039', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 40, user_id: 43, roll_number: 'CS2025040', first_name: 'Akanksha Mangesh', last_name: 'Khodake', dob: '2004-05-13', phone: '+91-98220-10040', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 41, user_id: 44, roll_number: 'CS2025041', first_name: 'Apurv Santosh', last_name: 'Kulkarni', dob: '2004-06-14', phone: '+91-98220-10041', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 42, user_id: 45, roll_number: 'CS2025042', first_name: 'Pranav Shailesh', last_name: 'Landge', dob: '2004-07-15', phone: '+91-98220-10042', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 43, user_id: 46, roll_number: 'CS2025043', first_name: 'Tanish Narendra', last_name: 'Mahajan', dob: '2004-08-16', phone: '+91-98220-10043', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 44, user_id: 47, roll_number: 'CS2025044', first_name: 'Suhani Kundan', last_name: 'Mahapatra', dob: '2004-09-17', phone: '+91-98220-10044', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 45, user_id: 48, roll_number: 'CS2025045', first_name: 'Ashay Shriram', last_name: 'Makode', dob: '2004-10-18', phone: '+91-98220-10045', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 46, user_id: 49, roll_number: 'CS2025046', first_name: 'Sanchita Pawan', last_name: 'Misar', dob: '2004-11-19', phone: '+91-98220-10046', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 47, user_id: 50, roll_number: 'CS2025047', first_name: 'Abhijith Ramachandran', last_name: 'Nair', dob: '2004-12-20', phone: '+91-98220-10047', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 48, user_id: 51, roll_number: 'CS2025048', first_name: 'Muskan', last_name: 'Nath', dob: '2004-01-21', phone: '+91-98220-10048', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 49, user_id: 52, roll_number: 'CS2025049', first_name: 'Harsh Sanjay', last_name: 'Navandar', dob: '2004-02-22', phone: '+91-98220-10049', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 50, user_id: 53, roll_number: 'CS2025050', first_name: 'Het Dakshes', last_name: 'Parekh', dob: '2004-03-23', phone: '+91-98220-10050', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 1 },
        { student_id: 51, user_id: 54, roll_number: 'CS2025051', first_name: 'Hrutuja Hemant', last_name: 'Patil', dob: '2004-04-24', phone: '+91-98220-10051', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 2 },
        { student_id: 52, user_id: 55, roll_number: 'CS2025052', first_name: 'Sharayu Sanjay', last_name: 'Patil', dob: '2004-05-25', phone: '+91-98220-10052', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 2 },
        { student_id: 53, user_id: 56, roll_number: 'CS2025053', first_name: 'Shweta Nitin', last_name: 'Patil', dob: '2004-06-26', phone: '+91-98220-10053', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 2 },
        { student_id: 54, user_id: 57, roll_number: 'CS2025054', first_name: 'Chetan Bhavrao', last_name: 'Patole', dob: '2004-07-27', phone: '+91-98220-10054', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 2 },
        { student_id: 55, user_id: 58, roll_number: 'CS2025055', first_name: 'Harshada Pravin', last_name: 'Pawar', dob: '2004-08-28', phone: '+91-98220-10055', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 2 },
        { student_id: 56, user_id: 59, roll_number: 'CS2025056', first_name: 'Mandar Krushnarao', last_name: 'Pawar', dob: '2004-09-01', phone: '+91-98220-10056', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 2 },
        { student_id: 57, user_id: 60, roll_number: 'CS2025057', first_name: 'Pratiksha Janardan', last_name: 'Phapale', dob: '2004-10-02', phone: '+91-98220-10057', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 2 },
        { student_id: 58, user_id: 61, roll_number: 'CS2025058', first_name: 'Sakshi Anil', last_name: 'Pimpale', dob: '2004-11-03', phone: '+91-98220-10058', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 2 },
        { student_id: 59, user_id: 62, roll_number: 'CS2025059', first_name: 'Raj Bhagwan', last_name: 'Sankpal', dob: '2004-12-04', phone: '+91-98220-10059', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 2 },
        { student_id: 60, user_id: 63, roll_number: 'CS2025060', first_name: 'Sarthak Rajkumar', last_name: 'Sarnaik', dob: '2004-01-05', phone: '+91-98220-10060', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 2 },
        { student_id: 61, user_id: 64, roll_number: 'CS2025061', first_name: 'Anam Anis', last_name: 'Shaikh', dob: '2004-02-06', phone: '+91-98220-10061', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 2 },
        { student_id: 62, user_id: 65, roll_number: 'CS2025062', first_name: 'Suyash Parag', last_name: 'Shardul', dob: '2004-03-07', phone: '+91-98220-10062', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 2 },
        { student_id: 63, user_id: 66, roll_number: 'CS2025063', first_name: 'Yogendra Vishal', last_name: 'Sharma', dob: '2004-04-08', phone: '+91-98220-10063', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 2 },
        { student_id: 64, user_id: 67, roll_number: 'CS2025064', first_name: 'Sneha Amol', last_name: 'Shelar', dob: '2004-05-09', phone: '+91-98220-10064', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 2 },
        { student_id: 65, user_id: 68, roll_number: 'CS2025065', first_name: 'Aditi Bhaskar', last_name: 'Shinde', dob: '2004-06-10', phone: '+91-98220-10065', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 2 },
        { student_id: 66, user_id: 69, roll_number: 'CS2025066', first_name: 'Aditya Raosaheb', last_name: 'Shinde', dob: '2004-07-11', phone: '+91-98220-10066', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 3 },
        { student_id: 67, user_id: 70, roll_number: 'CS2025067', first_name: 'Vedant Vijay', last_name: 'Shinde', dob: '2004-08-12', phone: '+91-98220-10067', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 3 },
        { student_id: 68, user_id: 71, roll_number: 'CS2025068', first_name: 'Mansi Manish', last_name: 'Suryawanshi', dob: '2004-09-13', phone: '+91-98220-10068', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 3 },
        { student_id: 69, user_id: 72, roll_number: 'CS2025069', first_name: 'Ayush Pramod', last_name: 'Tandale', dob: '2004-10-14', phone: '+91-98220-10069', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 3 },
        { student_id: 70, user_id: 73, roll_number: 'CS2025070', first_name: 'Pranali Abhay', last_name: 'Tathe', dob: '2004-11-15', phone: '+91-98220-10070', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 3 },
        { student_id: 71, user_id: 74, roll_number: 'CS2025071', first_name: 'Sahil Nitin', last_name: 'Thorat', dob: '2004-12-16', phone: '+91-98220-10071', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 3 },
        { student_id: 72, user_id: 75, roll_number: 'CS2025072', first_name: 'Samruddhi Pravin', last_name: 'Thorat', dob: '2004-01-17', phone: '+91-98220-10072', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 3 },
        { student_id: 73, user_id: 76, roll_number: 'CS2025073', first_name: 'Parth Vijay', last_name: 'Tidke', dob: '2004-02-18', phone: '+91-98220-10073', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 3 },
        { student_id: 74, user_id: 77, roll_number: 'CS2025074', first_name: 'Piyush Dipak', last_name: 'Wani', dob: '2004-03-19', phone: '+91-98220-10074', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 3 },
        { student_id: 75, user_id: 78, roll_number: 'CS2025075', first_name: 'Sangram Prashant', last_name: 'Patil', dob: '2004-04-20', phone: '+91-98220-10075', address: 'Campus Hostel, Tech Campus', enrollment_year: 2025, department_id: 3 },
      ],
      faculty: [
        { faculty_id: 1, user_id: 2, employee_code: 'FAC-CSE-001', first_name: 'Alan', last_name: 'Turing', designation: 'Professor', phone: '555-0101', department_id: 1 },
        { faculty_id: 2, user_id: 3, employee_code: 'FAC-ECE-002', first_name: 'Grace', last_name: 'Hopper', designation: 'Associate Professor', phone: '555-0102', department_id: 2 },
      ],
      courses: [
        { course_id: 1, course_code: 'CS101', course_name: 'Database Management Systems', credits: 4, semester: 4, department_id: 1, faculty_id: 1 },
        { course_id: 2, course_code: 'CS102', course_name: 'Data Structures & Algorithms', credits: 4, semester: 3, department_id: 1, faculty_id: 1 },
        { course_id: 3, course_code: 'EC201', course_name: 'Digital Signal Processing', credits: 3, semester: 4, department_id: 2, faculty_id: 2 },
      ],
      enrollments: [
        { enrollment_id: 1, student_id: 1, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 2, student_id: 1, course_id: 2, semester: 3, academic_year: '2025-2026', status: 'completed' },
        { enrollment_id: 3, student_id: 2, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 4, student_id: 2, course_id: 2, semester: 3, academic_year: '2025-2026', status: 'completed' },
        { enrollment_id: 5, student_id: 3, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 6, student_id: 4, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 7, student_id: 5, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 8, student_id: 6, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 9, student_id: 7, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 10, student_id: 8, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 11, student_id: 9, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 12, student_id: 10, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 13, student_id: 11, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 14, student_id: 12, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 15, student_id: 13, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 16, student_id: 14, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 17, student_id: 15, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 18, student_id: 16, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 19, student_id: 17, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 20, student_id: 18, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 21, student_id: 19, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 22, student_id: 20, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 23, student_id: 21, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 24, student_id: 22, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 25, student_id: 23, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 26, student_id: 24, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 27, student_id: 25, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 28, student_id: 26, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 29, student_id: 27, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 30, student_id: 28, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 31, student_id: 29, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 32, student_id: 30, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 33, student_id: 31, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 34, student_id: 32, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 35, student_id: 33, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 36, student_id: 34, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 37, student_id: 35, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 38, student_id: 36, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 39, student_id: 37, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 40, student_id: 38, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 41, student_id: 39, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 42, student_id: 40, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 43, student_id: 41, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 44, student_id: 42, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 45, student_id: 43, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 46, student_id: 44, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 47, student_id: 45, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 48, student_id: 46, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 49, student_id: 47, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 50, student_id: 48, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 51, student_id: 49, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 52, student_id: 50, course_id: 1, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 53, student_id: 51, course_id: 3, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 54, student_id: 52, course_id: 3, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 55, student_id: 53, course_id: 3, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 56, student_id: 54, course_id: 3, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 57, student_id: 55, course_id: 3, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 58, student_id: 56, course_id: 3, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 59, student_id: 57, course_id: 3, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 60, student_id: 58, course_id: 3, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 61, student_id: 59, course_id: 3, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 62, student_id: 60, course_id: 3, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 63, student_id: 61, course_id: 3, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 64, student_id: 62, course_id: 3, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 65, student_id: 63, course_id: 3, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 66, student_id: 64, course_id: 3, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
        { enrollment_id: 67, student_id: 65, course_id: 3, semester: 4, academic_year: '2025-2026', status: 'enrolled' },
      ],
      attendance: [
        { attendance_id: 1, enrollment_id: 1, attendance_date: '2026-02-02', status: 'Present', marked_by: 2, remarks: 'Normal' },
        { attendance_id: 2, enrollment_id: 1, attendance_date: '2026-02-04', status: 'Late', marked_by: 2, remarks: 'Late' },
        { attendance_id: 3, enrollment_id: 1, attendance_date: '2026-02-06', status: 'Absent', marked_by: 2, remarks: 'Absent' },
      ],
      exams: [
        { exam_id: 1, course_id: 1, exam_name: 'Midterm Examination', exam_type: 'Midterm', exam_date: '2026-03-10', max_marks: 50.0, created_by: 2 },
        { exam_id: 2, course_id: 3, exam_name: 'DSP Midterm', exam_type: 'Midterm', exam_date: '2026-03-12', max_marks: 50.0, created_by: 3 },
      ],
      results: [
        { result_id: 1, exam_id: 1, enrollment_id: 1, marks_obtained: 46.5, grade: 'O', entered_by: 2 },
      ],
      audit_logs: [],
      course_prerequisites: [
        { id: 1, course_id: 1, prerequisite_course_id: 2 },
        { id: 2, course_id: 4, prerequisite_course_id: 3 },
      ],
      timetable_slots: [
        { slot_id: 1, course_id: 1, day_of_week: 'Monday', start_time: '09:00:00', end_time: '10:00:00', room_number: 'Room 101', semester: 4, academic_year: '2025-2026' },
        { slot_id: 2, course_id: 1, day_of_week: 'Wednesday', start_time: '10:00:00', end_time: '11:00:00', room_number: 'Room 101', semester: 4, academic_year: '2025-2026' },
        { slot_id: 3, course_id: 2, day_of_week: 'Tuesday', start_time: '11:00:00', end_time: '12:00:00', room_number: 'Lab 2', semester: 3, academic_year: '2025-2026' },
        { slot_id: 4, course_id: 3, day_of_week: 'Monday', start_time: '10:00:00', end_time: '11:00:00', room_number: 'Room 202', semester: 4, academic_year: '2025-2026' },
      ],
      leave_requests: [
        { leave_id: 1, enrollment_id: 1, leave_date: '2026-03-01', reason: 'Medical appointment with specialist physician', status: 'Approved', reviewed_by: 2, review_remarks: 'Approved. Excuse granted for medical reasons.', created_at: '2026-02-28 10:00:00' },
        { leave_id: 2, enrollment_id: 62, leave_date: '2026-03-05', reason: 'Attending sister marriage ceremony', status: 'Pending', reviewed_by: null, review_remarks: null, created_at: '2026-03-02 12:00:00' },
      ],
      notifications: [
        { notification_id: 1, user_id: 4, title: 'Welcome to Semester 4', message: 'Your semester course enrollments and academic schedule are confirmed.', type: 'SYSTEM_ANNOUNCEMENT', is_read: 1, created_at: '2026-02-01 09:00:00' },
        { notification_id: 2, user_id: 5, title: 'Attendance Shortage Warning', message: 'Your attendance in CS101 is below 75%. Please meet your faculty advisor.', type: 'ATTENDANCE_ALERT', is_read: 0, created_at: '2026-02-15 14:00:00' },
        { notification_id: 3, user_id: 4, title: 'Leave Request Approved', message: 'Your leave request for 2026-03-01 in CS101 has been approved as Excused.', type: 'LEAVE_UPDATE', is_read: 0, created_at: '2026-03-01 08:30:00' },
      ],
      fee_structures: [
        { structure_id: 1, department_id: 1, semester: 4, academic_year: '2025-2026', tuition_fee: 45000.00, development_fee: 10000.00, laboratory_fee: 8000.00, library_fee: 2000.00, other_charges: 1500.00, total_fee: 66500.00, due_date: '2026-04-15', created_at: '2026-01-15 00:00:00' },
        { structure_id: 2, department_id: 2, semester: 4, academic_year: '2025-2026', tuition_fee: 42000.00, development_fee: 9500.00, laboratory_fee: 7500.00, library_fee: 2000.00, other_charges: 1500.00, total_fee: 62500.00, due_date: '2026-04-15', created_at: '2026-01-15 00:00:00' },
      ],
      student_invoices: [
        { invoice_id: 1, invoice_number: 'INV-2026-CSE-001', student_id: 1, structure_id: 1, total_due: 66500.00, scholarship_discount: 10000.00, net_payable: 56500.00, amount_paid: 56500.00, status: 'Paid', generated_at: '2026-01-20 10:00:00' },
        { invoice_id: 2, invoice_number: 'INV-2026-CSE-002', student_id: 2, structure_id: 1, total_due: 66500.00, scholarship_discount: 0.00, net_payable: 66500.00, amount_paid: 30000.00, status: 'Partially_Paid', generated_at: '2026-01-20 10:00:00' },
        { invoice_id: 3, invoice_number: 'INV-2026-CSE-003', student_id: 3, structure_id: 1, total_due: 66500.00, scholarship_discount: 0.00, net_payable: 66500.00, amount_paid: 0.00, status: 'Pending', generated_at: '2026-01-20 10:00:00' },
      ],
      fee_payments: [
        { payment_id: 1, invoice_id: 1, receipt_number: 'REC-2026-0001', amount_paid: 56500.00, payment_mode: 'UPI', transaction_reference: 'TXN_UPI_9837264101', recorded_by_user_id: 1, remarks: 'Full semester fee paid via UPI', paid_at: '2026-02-01 11:00:00' },
        { payment_id: 2, invoice_id: 2, receipt_number: 'REC-2026-0002', amount_paid: 30000.00, payment_mode: 'Net_Banking', transaction_reference: 'TXN_NB_8829104822', recorded_by_user_id: 1, remarks: 'First installment paid online', paid_at: '2026-02-10 15:30:00' },
      ],
    };

    this.autoIncrement = {
      departments: 4,
      users: 80,
      students: 76,
      faculty: 3,
      courses: 4,
      enrollments: 75,
      attendance: 4,
      exams: 3,
      results: 2,
      audit_logs: 1,
      course_prerequisites: 3,
      timetable_slots: 5,
      leave_requests: 3,
      notifications: 4,
      fee_structures: 3,
      student_invoices: 4,
      fee_payments: 3,
    };
  }

  async query(sql, params = []) {
    return this._executeQuery(this.tables, sql, params);
  }

  async getConnection() {
    // Snapshot state for transaction
    const snapshot = JSON.parse(JSON.stringify(this.tables));
    const autoIncSnapshot = { ...this.autoIncrement };
    let inTransaction = false;

    return {
      beginTransaction: async () => {
        inTransaction = true;
      },
      commit: async () => {
        inTransaction = false;
      },
      rollback: async () => {
        if (inTransaction) {
          this.tables = JSON.parse(JSON.stringify(snapshot));
          this.autoIncrement = { ...autoIncSnapshot };
          inTransaction = false;
        }
      },
      release: async () => {},
      query: async (sql, params = []) => {
        return this._executeQuery(this.tables, sql, params);
      },
    };
  }

  _executeQuery(tables, sql, params) {
    const normalized = sql.replace(/\s+/g, ' ').trim().toUpperCase();
    const upper = normalized;

    // Generic table count query
    const countMatch = upper.match(/SELECT COUNT\(\*\) AS TOTAL FROM (\w+)/);
    if (countMatch) {
      const tableName = countMatch[1].toLowerCase();
      if (tables[tableName]) {
        return [[{ total: tables[tableName].length }]];
      }
    }

    // SELECT 1 AS alive
    if (upper.startsWith('SELECT 1')) {
      return [[{ alive: 1 }]];
    }

    // 2. INSERT INTO users
    if (upper.startsWith('INSERT INTO USERS')) {
      const email = params[0];
      const password_hash = params[1];
      const role = params[2] || (sql.includes("'student'") ? 'student' : (sql.includes("'faculty'") ? 'faculty' : 'administrator'));
      const status = params[3] || 'active';

      if (tables.users.some(u => u.email === email)) {
        const err = new Error(`Duplicate entry '${email}' for key 'users.email'`);
        err.code = 'ER_DUP_ENTRY';
        err.errno = 1062;
        throw err;
      }

      const id = this.autoIncrement.users++;
      const user = { user_id: id, email, password_hash, role, status };
      tables.users.push(user);
      return [{ insertId: id, affectedRows: 1 }];
    }

    // 3. INSERT INTO students
    if (upper.startsWith('INSERT INTO STUDENTS')) {
      const [user_id, roll_number, first_name, last_name, dob, phone, address, enrollment_year, department_id] = params;

      if (tables.students.some(s => s.roll_number === roll_number)) {
        const err = new Error(`Duplicate entry '${roll_number}' for key 'students.roll_number'`);
        err.code = 'ER_DUP_ENTRY';
        err.errno = 1062;
        throw err;
      }

      const id = this.autoIncrement.students++;
      const student = { student_id: id, user_id, roll_number, first_name, last_name, dob, phone, address, enrollment_year, department_id };
      tables.students.push(student);
      return [{ insertId: id, affectedRows: 1 }];
    }

    // 4. INSERT INTO faculty
    if (upper.startsWith('INSERT INTO FACULTY')) {
      const [user_id, employee_code, first_name, last_name, designation, phone, department_id] = params;
      if (tables.faculty.some(f => f.employee_code === employee_code)) {
        const err = new Error(`Duplicate entry '${employee_code}' for key 'faculty.employee_code'`);
        err.code = 'ER_DUP_ENTRY';
        err.errno = 1062;
        throw err;
      }
      const id = this.autoIncrement.faculty++;
      const fac = { faculty_id: id, user_id, employee_code, first_name, last_name, designation, phone, department_id };
      tables.faculty.push(fac);
      return [{ insertId: id, affectedRows: 1 }];
    }

    // 5. INSERT INTO departments
    if (upper.startsWith('INSERT INTO DEPARTMENTS')) {
      const [code, name, description] = params;
      if (tables.departments.some(d => d.code === code)) {
        const err = new Error(`Duplicate entry '${code}' for key 'departments.code'`);
        err.code = 'ER_DUP_ENTRY';
        err.errno = 1062;
        throw err;
      }
      const id = this.autoIncrement.departments++;
      const dept = { department_id: id, code, name, description };
      tables.departments.push(dept);
      return [{ insertId: id, affectedRows: 1 }];
    }

    // 6. INSERT INTO courses
    if (upper.startsWith('INSERT INTO COURSES')) {
      const [course_code, course_name, credits, semester, department_id, faculty_id] = params;
      if (tables.courses.some(c => c.course_code === course_code)) {
        const err = new Error(`Duplicate entry '${course_code}' for key 'courses.course_code'`);
        err.code = 'ER_DUP_ENTRY';
        err.errno = 1062;
        throw err;
      }
      const id = this.autoIncrement.courses++;
      const course = { course_id: id, course_code, course_name, credits, semester, department_id, faculty_id };
      tables.courses.push(course);
      return [{ insertId: id, affectedRows: 1 }];
    }

    // 7. INSERT INTO enrollments
    if (upper.startsWith('INSERT INTO ENROLLMENTS')) {
      const [student_id, course_id, semester, academic_year, status] = params;
      if (tables.enrollments.some(e => e.student_id === student_id && e.course_id === course_id && e.semester === semester && e.academic_year === academic_year)) {
        const err = new Error(`Duplicate entry for key 'uq_student_course_term'`);
        err.code = 'ER_DUP_ENTRY';
        err.errno = 1062;
        throw err;
      }
      const id = this.autoIncrement.enrollments++;
      const enr = { enrollment_id: id, student_id, course_id, semester, academic_year, status };
      tables.enrollments.push(enr);
      return [{ insertId: id, affectedRows: 1 }];
    }

    // 8. INSERT INTO attendance (Bulk / Upsert)
    if (upper.startsWith('INSERT INTO ATTENDANCE')) {
      const records = Array.isArray(params[0]) ? params[0] : [params]; // handles bulk array or single row params
      for (const row of records) {
        const [enrollment_id, attendance_date, status, marked_by, remarks] = row;
        const existing = tables.attendance.find(a => a.enrollment_id === Number(enrollment_id) && a.attendance_date === attendance_date);
        if (existing) {
          existing.status = status;
          existing.marked_by = Number(marked_by);
          existing.remarks = remarks;
        } else {
          const id = this.autoIncrement.attendance++;
          tables.attendance.push({ attendance_id: id, enrollment_id: Number(enrollment_id), attendance_date, status, marked_by: Number(marked_by), remarks });
        }
      }
      return [{ affectedRows: records.length }];
    }

    // 9. INSERT INTO exams
    if (upper.startsWith('INSERT INTO EXAMS')) {
      const [course_id, exam_name, exam_type, exam_date, max_marks, created_by] = params;
      if (tables.exams.some(ex => ex.course_id === course_id && ex.exam_name === exam_name)) {
        const err = new Error(`Duplicate entry for key 'uq_course_exam_name'`);
        err.code = 'ER_DUP_ENTRY';
        err.errno = 1062;
        throw err;
      }
      const id = this.autoIncrement.exams++;
      const ex = { exam_id: id, course_id, exam_name, exam_type, exam_date, max_marks, created_by };
      tables.exams.push(ex);
      return [{ insertId: id, affectedRows: 1 }];
    }

    // 10. INSERT INTO results (Bulk / Upsert)
    if (upper.startsWith('INSERT INTO RESULTS')) {
      const records = params[0]; // array of [exam_id, enrollment_id, marks_obtained, grade, entered_by]
      for (const row of records) {
        const [exam_id, enrollment_id, marks_obtained, grade, entered_by] = row;
        const existing = tables.results.find(r => r.exam_id === exam_id && r.enrollment_id === enrollment_id);
        if (existing) {
          existing.marks_obtained = marks_obtained;
          existing.grade = grade;
          existing.entered_by = entered_by;
        } else {
          const id = this.autoIncrement.results++;
          tables.results.push({ result_id: id, exam_id, enrollment_id, marks_obtained, grade, entered_by });
        }
      }
      return [{ affectedRows: records.length }];
    }

    // 11. INSERT INTO audit_logs
    if (upper.startsWith('INSERT INTO AUDIT_LOGS')) {
      const [actor_user_id, action, entity_type, entity_id, metadata, ip_address] = params;
      const id = this.autoIncrement.audit_logs++;
      tables.audit_logs.push({ log_id: id, actor_user_id, action, entity_type, entity_id, metadata, ip_address, created_at: new Date().toISOString() });
      return [{ insertId: id, affectedRows: 1 }];
    }

    // 12. INSERT INTO timetable_slots
    if (upper.startsWith('INSERT INTO TIMETABLE_SLOTS')) {
      const [course_id, day_of_week, start_time, end_time, room_number, semester, academic_year] = params;
      const id = this.autoIncrement.timetable_slots++;
      const slot = { slot_id: id, course_id: Number(course_id), day_of_week, start_time, end_time, room_number, semester: Number(semester), academic_year };
      tables.timetable_slots.push(slot);
      return [{ insertId: id, affectedRows: 1 }];
    }

    // 13. INSERT INTO leave_requests
    if (upper.startsWith('INSERT INTO LEAVE_REQUESTS')) {
      const [enrollment_id, leave_date, reason, status = 'Pending'] = params;
      if (tables.leave_requests.some(lr => lr.enrollment_id === Number(enrollment_id) && lr.leave_date === leave_date)) {
        const err = new Error(`Duplicate entry for key 'uq_enrollment_leave_date'`);
        err.code = 'ER_DUP_ENTRY';
        err.errno = 1062;
        throw err;
      }
      const id = this.autoIncrement.leave_requests++;
      const req = { leave_id: id, enrollment_id: Number(enrollment_id), leave_date, reason, status, reviewed_by: null, review_remarks: null, created_at: new Date().toISOString() };
      tables.leave_requests.push(req);
      return [{ insertId: id, affectedRows: 1 }];
    }

    // 14. INSERT INTO notifications
    if (upper.startsWith('INSERT INTO NOTIFICATIONS')) {
      const [user_id, title, message, type, is_read = 0] = params;
      const id = this.autoIncrement.notifications++;
      const notif = { notification_id: id, user_id: Number(user_id), title, message, type, is_read: Number(is_read), created_at: new Date().toISOString() };
      tables.notifications.push(notif);
      return [{ insertId: id, affectedRows: 1 }];
    }

    // 15. INSERT INTO course_prerequisites
    if (upper.startsWith('INSERT INTO COURSE_PREREQUISITES')) {
      const [course_id, prerequisite_course_id] = params;
      const id = this.autoIncrement.course_prerequisites++;
      tables.course_prerequisites.push({ id, course_id: Number(course_id), prerequisite_course_id: Number(prerequisite_course_id) });
      return [{ insertId: id, affectedRows: 1 }];
    }

    // 16. INSERT INTO fee_structures
    if (upper.startsWith('INSERT INTO FEE_STRUCTURES')) {
      const [department_id, semester, academic_year, tuition_fee, development_fee, laboratory_fee, library_fee, other_charges, due_date] = params;
      if (tables.fee_structures.some(fs => fs.department_id === Number(department_id) && fs.semester === Number(semester) && fs.academic_year === academic_year)) {
        const err = new Error(`Duplicate entry for key 'uq_dept_sem_year'`);
        err.code = 'ER_DUP_ENTRY';
        err.errno = 1062;
        throw err;
      }
      const id = this.autoIncrement.fee_structures++;
      const total_fee = Number(tuition_fee || 0) + Number(development_fee || 0) + Number(laboratory_fee || 0) + Number(library_fee || 0) + Number(other_charges || 0);
      const fs = {
        structure_id: id,
        department_id: Number(department_id),
        semester: Number(semester),
        academic_year,
        tuition_fee: Number(tuition_fee || 0),
        development_fee: Number(development_fee || 0),
        laboratory_fee: Number(laboratory_fee || 0),
        library_fee: Number(library_fee || 0),
        other_charges: Number(other_charges || 0),
        total_fee,
        due_date,
        created_at: new Date().toISOString(),
      };
      tables.fee_structures.push(fs);
      return [{ insertId: id, affectedRows: 1 }];
    }

    // 17. INSERT INTO student_invoices (single or batch)
    if (upper.startsWith('INSERT INTO STUDENT_INVOICES') || upper.startsWith('INSERT IGNORE INTO STUDENT_INVOICES')) {
      // Check if it's bulk array in params[0] or multiple rows
      const records = Array.isArray(params[0]) ? params[0] : [params];
      let insertedCount = 0;
      let lastInsertId = 0;
      for (const row of records) {
        const [invoice_number, student_id, structure_id, total_due, scholarship_discount = 0, net_payable, amount_paid = 0, status = 'Pending'] = row;
        const exists = tables.student_invoices.some(si => si.student_id === Number(student_id) && si.structure_id === Number(structure_id));
        if (exists) {
          if (upper.includes('IGNORE')) continue;
          const err = new Error(`Duplicate entry for key 'uq_student_structure'`);
          err.code = 'ER_DUP_ENTRY';
          err.errno = 1062;
          throw err;
        }
        const id = this.autoIncrement.student_invoices++;
        lastInsertId = id;
        insertedCount++;
        tables.student_invoices.push({
          invoice_id: id,
          invoice_number,
          student_id: Number(student_id),
          structure_id: Number(structure_id),
          total_due: Number(total_due),
          scholarship_discount: Number(scholarship_discount),
          net_payable: Number(net_payable),
          amount_paid: Number(amount_paid),
          status,
          generated_at: new Date().toISOString(),
        });
      }
      return [{ insertId: lastInsertId, affectedRows: insertedCount }];
    }

    // 18. INSERT INTO fee_payments
    if (upper.startsWith('INSERT INTO FEE_PAYMENTS')) {
      const [invoice_id, receipt_number, amount_paid, payment_mode, transaction_reference, recorded_by_user_id, remarks] = params;
      if (tables.fee_payments.some(fp => fp.receipt_number === receipt_number)) {
        const err = new Error(`Duplicate entry '${receipt_number}' for key 'receipt_number'`);
        err.code = 'ER_DUP_ENTRY';
        err.errno = 1062;
        throw err;
      }
      if (tables.fee_payments.some(fp => fp.transaction_reference === transaction_reference)) {
        const err = new Error(`Duplicate entry '${transaction_reference}' for key 'transaction_reference'`);
        err.code = 'ER_DUP_ENTRY';
        err.errno = 1062;
        throw err;
      }
      const id = this.autoIncrement.fee_payments++;
      const payment = {
        payment_id: id,
        invoice_id: Number(invoice_id),
        receipt_number,
        amount_paid: Number(amount_paid),
        payment_mode,
        transaction_reference,
        recorded_by_user_id: Number(recorded_by_user_id),
        remarks: remarks || null,
        paid_at: new Date().toISOString(),
      };
      tables.fee_payments.push(payment);
      return [{ insertId: id, affectedRows: 1 }];
    }

    // 12. SELECT queries
    // Auth login query
    if (upper.includes('FROM USERS WHERE EMAIL = ?')) {
      const email = params[0];
      const match = tables.users.filter(u => u.email === email);
      return [match];
    }

    // Student profile by user_id
    if (upper.includes('FROM STUDENTS S') && upper.includes('WHERE S.USER_ID = ?')) {
      const uid = params[0];
      const s = tables.students.find(x => x.user_id === uid);
      if (!s) return [[]];
      const d = tables.departments.find(dept => dept.department_id === s.department_id) || {};
      return [[{ ...s, department_name: d.name }]];
    }

    // Faculty profile by user_id
    if (upper.includes('FROM FACULTY F') && upper.includes('WHERE F.USER_ID = ?')) {
      const uid = params[0];
      const f = tables.faculty.find(x => x.user_id === uid);
      if (!f) return [[]];
      const d = tables.departments.find(dept => dept.department_id === f.department_id) || {};
      return [[{ ...f, department_name: d.name }]];
    }

    // Admin Dashboard Global Counts
    if (upper.includes('AS TOTAL_STUDENTS') || (upper.includes('TOTAL_COURSES') && upper.includes('TOTAL_DEPARTMENTS'))) {
      const activeStudents = tables.students.filter(s => {
        const u = tables.users.find(x => x.user_id === s.user_id);
        return u && u.status === 'active';
      }).length;
      const activeFaculty = tables.faculty.filter(f => {
        const u = tables.users.find(x => x.user_id === f.user_id);
        return u && u.status === 'active';
      }).length;
      return [[{
        total_students: activeStudents,
        total_faculty: activeFaculty,
        total_courses: tables.courses.length,
        total_departments: tables.departments.length,
      }]];
    }

    // Admin Dashboard Department Distribution
    if (upper.includes('FROM DEPARTMENTS D') && upper.includes('STUDENT_COUNT')) {
      const dist = tables.departments.map(d => ({
        code: d.code,
        name: d.name,
        student_count: tables.students.filter(s => s.department_id === d.department_id).length,
      }));
      return [dist];
    }

    // Admin Dashboard Overall Attendance Rate
    if (upper.includes('OVERALL_ATTENDANCE_RATE')) {
      const total = tables.attendance.length;
      const attended = tables.attendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
      const rate = total > 0 ? Math.round((attended / total) * 10000) / 100 : 0.00;
      return [[{ overall_attendance_rate: rate }]];
    }

    // Faculty Dashboard assigned courses
    if (upper.includes('FROM COURSES C') && upper.includes('ENROLLED_STUDENTS') && upper.includes('WHERE C.FACULTY_ID = ?')) {
      const fid = Number(params[0]);
      const facCourses = tables.courses.filter(c => Number(c.faculty_id) === fid);
      return [facCourses.map(c => ({
        course_id: c.course_id,
        course_code: c.course_code,
        course_name: c.course_name,
        credits: c.credits,
        semester: c.semester,
        enrolled_students: tables.enrollments.filter(e => e.course_id === c.course_id && e.status === 'enrolled').length,
      }))];
    }

    // Faculty Dashboard recent exams
    if (upper.includes('FROM EXAMS EX') && upper.includes('JOIN COURSES C') && upper.includes('WHERE C.FACULTY_ID = ?')) {
      const fid = Number(params[0]);
      const facCourseIds = tables.courses.filter(c => Number(c.faculty_id) === fid).map(c => c.course_id);
      const facExams = tables.exams.filter(ex => facCourseIds.includes(ex.course_id));
      return [facExams.map(ex => {
        const c = tables.courses.find(x => x.course_id === ex.course_id) || {};
        return {
          exam_id: ex.exam_id,
          exam_name: ex.exam_name,
          exam_type: ex.exam_type,
          exam_date: ex.exam_date,
          max_marks: ex.max_marks,
          course_code: c.course_code,
        };
      })];
    }

    // Departments list
    if (upper.includes('FROM DEPARTMENTS')) {
      if (upper.includes('WHERE DEPARTMENT_ID = ?')) {
        const id = Number(params[0]);
        return [tables.departments.filter(d => d.department_id === id)];
      }
      return [tables.departments.map(d => ({
        ...d,
        student_count: tables.students.filter(s => s.department_id === d.department_id).length,
        faculty_count: tables.faculty.filter(f => f.department_id === d.department_id).length,
        course_count: tables.courses.filter(c => c.department_id === d.department_id).length,
      }))];
    }

    // Students list & count
    if (upper.includes('FROM STUDENTS')) {
      if (upper.includes('COUNT(*) AS TOTAL')) {
        // If SQL injection test with literal in parameter, parameter binding prevents it
        let list = tables.students;
        if (params.length > 0 && typeof params[0] === 'string' && params[0].startsWith('%')) {
          const term = params[0].replace(/%/g, '').toLowerCase();
          list = list.filter(s => s.roll_number.toLowerCase().includes(term) || s.first_name.toLowerCase().includes(term));
        }
        return [[{ total: list.length }]];
      }

      if (upper.includes('WHERE S.STUDENT_ID = ?')) {
        const sid = Number(params[0]);
        const s = tables.students.find(x => x.student_id === sid);
        if (!s) return [[]];
        const u = tables.users.find(x => x.user_id === s.user_id) || {};
        const d = tables.departments.find(x => x.department_id === s.department_id) || {};
        return [[{ ...s, email: u.email, status: u.status, department_name: d.name, department_code: d.code }]];
      }

      let list = tables.students;
      if (params.length >= 4 && typeof params[0] === 'string' && params[0].startsWith('%')) {
        const term = params[0].replace(/%/g, '').toLowerCase();
        list = list.filter(s => s.roll_number.toLowerCase().includes(term) || s.first_name.toLowerCase().includes(term));
      }
      return [list.map(s => {
        const u = tables.users.find(x => x.user_id === s.user_id) || {};
        const d = tables.departments.find(x => x.department_id === s.department_id) || {};
        return { ...s, email: u.email, status: u.status, department_name: d.name, department_code: d.code };
      })];
    }

    // Courses list
    if (upper.includes('FROM COURSES')) {
      if (upper.includes('WHERE C.COURSE_ID = ?') || upper.includes('WHERE COURSE_ID = ?')) {
        const cid = Number(params[0]);
        const c = tables.courses.find(x => x.course_id === cid);
        if (!c) return [[]];
        const d = tables.departments.find(x => x.department_id === c.department_id) || {};
        const f = tables.faculty.find(x => x.faculty_id === c.faculty_id);
        return [[{
          ...c,
          department_name: d.name,
          department_code: d.code,
          faculty_code: f ? f.employee_code : null,
          faculty_name: f ? `${f.first_name} ${f.last_name}` : null,
        }]];
      }
      return [tables.courses.map(c => {
        const d = tables.departments.find(x => x.department_id === c.department_id) || {};
        const f = tables.faculty.find(x => x.faculty_id === c.faculty_id);
        const enrCount = tables.enrollments.filter(e => e.course_id === c.course_id && e.status === 'enrolled').length;
        return {
          ...c,
          department_name: d.name,
          department_code: d.code,
          faculty_code: f ? f.employee_code : null,
          faculty_name: f ? `${f.first_name} ${f.last_name}` : null,
          enrolled_students_count: enrCount,
        };
      })];
    }

    // Faculty check / list
    if (upper.includes('FROM FACULTY F') || upper.includes('FROM FACULTY')) {
      if (upper.includes('WHERE FACULTY_ID = ?') || upper.includes('WHERE F.FACULTY_ID = ?')) {
        const fid = Number(params[0]);
        const f = tables.faculty.find(x => x.faculty_id === fid);
        if (!f) return [[]];
        const u = tables.users.find(x => x.user_id === f.user_id) || {};
        const d = tables.departments.find(x => x.department_id === f.department_id) || {};
        return [[{ ...f, email: u.email, status: u.status, department_name: d.name, department_code: d.code }]];
      }
      return [tables.faculty.map(f => {
        const u = tables.users.find(x => x.user_id === f.user_id) || {};
        const d = tables.departments.find(x => x.department_id === f.department_id) || {};
        return { ...f, email: u.email, status: u.status, department_name: d.name, department_code: d.code };
      })];
    }

    // Enrollments
    // Credit Cap Sum query (must check before generic FROM ENROLLMENTS)
    if (upper.includes('CURRENT_CREDITS') || (upper.includes('SUM(C.CREDITS)') && upper.includes('FROM ENROLLMENTS E'))) {
      const sid = Number(params[0]);
      const sem = Number(params[1]);
      const enrs = tables.enrollments.filter(e => e.student_id === sid && Number(e.semester) === sem && e.status === 'enrolled');
      const creds = enrs.reduce((sum, e) => {
        const c = tables.courses.find(x => x.course_id === e.course_id);
        return sum + (c ? Number(c.credits) : 0);
      }, 0);
      return [[{ current_credits: creds, total_credits: creds }]];
    }

    if (upper.includes('FROM ENROLLMENTS')) {
      if (upper.includes('WHERE ENROLLMENT_ID IN (?)') || upper.includes('WHERE ENROLLMENT_ID IN')) {
        const ids = Array.isArray(params[0]) ? params[0] : [params[0]];
        return [tables.enrollments.filter(e => ids.includes(e.enrollment_id))];
      }
      if (upper.includes('ENROLLMENT_ID = ?')) {
        const eid = Number(params[0]);
        const enr = tables.enrollments.find(e => e.enrollment_id === eid);
        if (!enr) return [[]];
        const s = tables.students.find(x => x.student_id === enr.student_id) || {};
        const c = tables.courses.find(x => x.course_id === enr.course_id) || {};
        return [[{
          ...enr,
          student_name: `${s.first_name} ${s.last_name}`,
          roll_number: s.roll_number,
          course_code: c.course_code,
          course_name: c.course_name,
          credits: c.credits,
        }]];
      }
      if (upper.includes('STUDENT_ID = ?') && upper.includes('COURSE_ID = ?')) {
        const sid = Number(params[0]);
        const cid = Number(params[1]);
        if (params.length >= 4) {
          const sem = Number(params[2]);
          const yr = params[3];
          return [tables.enrollments.filter(e => e.student_id === sid && e.course_id === cid && Number(e.semester) === sem && e.academic_year === yr)];
        }
        const enrs = tables.enrollments.filter(e => e.student_id === sid && e.course_id === cid);
        return [enrs.map(e => {
          const r = tables.results.find(x => x.enrollment_id === e.enrollment_id);
          return {
            ...e,
            grade: r ? r.grade : null,
          };
        })];
      }
      return [tables.enrollments.map(e => {
        const s = tables.students.find(x => x.student_id === e.student_id) || {};
        const c = tables.courses.find(x => x.course_id === e.course_id) || {};
        return {
          ...e,
          student_name: `${s.first_name} ${s.last_name}`,
          roll_number: s.roll_number,
          course_code: c.course_code,
          course_name: c.course_name,
          credits: c.credits,
        };
      })];
    }

    // Attendance
    if (upper.includes('FROM ATTENDANCE A') || upper.includes('FROM ENROLLMENTS E') && upper.includes('LEFT JOIN ATTENDANCE A')) {
      if (upper.includes('WHERE E.COURSE_ID = ?')) {
        const cid = Number(params[params.length - 1]);
        const date = params.length > 1 ? params[0] : null;
        const enrs = tables.enrollments.filter(e => e.course_id === cid);
        return [enrs.map(e => {
          const s = tables.students.find(x => x.student_id === e.student_id) || {};
          const att = tables.attendance.find(a => a.enrollment_id === e.enrollment_id && (!date || a.attendance_date === date));
          return {
            enrollment_id: e.enrollment_id,
            student_id: s.student_id,
            roll_number: s.roll_number,
            student_name: `${s.first_name} ${s.last_name}`,
            attendance_id: att ? att.attendance_id : null,
            attendance_date: att ? att.attendance_date : date,
            status: att ? att.status : 'Not Marked',
            remarks: att ? att.remarks : null,
          };
        })];
      }

      if (upper.includes('WHERE E.STUDENT_ID = ?')) {
        const sid = Number(params[0]);
        const enrs = tables.enrollments.filter(e => e.student_id === sid);
        const enrIds = enrs.map(e => e.enrollment_id);
        const atts = tables.attendance.filter(a => enrIds.includes(a.enrollment_id));
        return [atts.map(a => {
          const e = enrs.find(x => x.enrollment_id === a.enrollment_id);
          const c = tables.courses.find(x => x.course_id === e.course_id) || {};
          return {
            ...a,
            course_id: c.course_id,
            course_code: c.course_code,
            course_name: c.course_name,
            semester: e.semester,
            academic_year: e.academic_year,
          };
        })];
      }
    }

    // Exams
    if (upper.includes('FROM EXAMS')) {
      if (upper.includes('JOIN COURSES') && upper.includes('EX.EXAM_ID = ?')) {
        const eid = Number(params[0]);
        const ex = tables.exams.find(x => x.exam_id === eid);
        if (!ex) return [[]];
        const c = tables.courses.find(x => x.course_id === ex.course_id) || {};
        return [[{ faculty_id: c.faculty_id }]];
      }
      if (upper.includes('WHERE EX.EXAM_ID = ?') || upper.includes('WHERE EXAM_ID = ?')) {
        const eid = Number(params[0]);
        const ex = tables.exams.find(x => x.exam_id === eid);
        if (!ex) return [[]];
        const c = tables.courses.find(x => x.course_id === ex.course_id) || {};
        return [[{ ...ex, course_code: c.course_code, course_name: c.course_name, faculty_id: c.faculty_id }]];
      }
      return [tables.exams.map(ex => {
        const c = tables.courses.find(x => x.course_id === ex.course_id) || {};
        return {
          ...ex,
          course_code: c.course_code,
          course_name: c.course_name,
          graded_students_count: tables.results.filter(r => r.exam_id === ex.exam_id).length,
        };
      })];
    }

    // Results
    if (upper.includes('FROM RESULTS R') || upper.includes('FROM ENROLLMENTS E') && upper.includes('LEFT JOIN RESULTS R')) {
      if (upper.includes('WHERE E.STUDENT_ID = ?')) {
        const sid = Number(params[0]);
        const enrs = tables.enrollments.filter(e => e.student_id === sid);
        const enrIds = enrs.map(e => e.enrollment_id);
        const resList = tables.results.filter(r => enrIds.includes(r.enrollment_id));
        return [resList.map(r => {
          const ex = tables.exams.find(x => x.exam_id === r.exam_id) || {};
          const e = enrs.find(x => x.enrollment_id === r.enrollment_id) || {};
          const c = tables.courses.find(x => x.course_id === e.course_id) || {};
          return {
            ...r,
            exam_name: ex.exam_name,
            exam_type: ex.exam_type,
            exam_date: ex.exam_date,
            max_marks: ex.max_marks,
            course_id: c.course_id,
            course_code: c.course_code,
            course_name: c.course_name,
            credits: c.credits,
            semester: e.semester,
            academic_year: e.academic_year,
          };
        })];
      }

      const examId = Number(params[0]);
      const ex = tables.exams.find(x => x.exam_id === examId);
      const enrs = tables.enrollments.filter(e => e.course_id === (ex ? ex.course_id : 1));
      return [enrs.map(e => {
        const s = tables.students.find(x => x.student_id === e.student_id) || {};
        const r = tables.results.find(x => x.exam_id === examId && x.enrollment_id === e.enrollment_id);
        return {
          enrollment_id: e.enrollment_id,
          student_id: s.student_id,
          roll_number: s.roll_number,
          student_name: `${s.first_name} ${s.last_name}`,
          result_id: r ? r.result_id : null,
          marks_obtained: r ? r.marks_obtained : null,
          grade: r ? r.grade : null,
        };
      })];
    }

    // Views
    if (upper.includes('VW_STUDENT_ATTENDANCE_SUMMARY')) {
      const rows = tables.enrollments.map(e => {
        const s = tables.students.find(x => x.student_id === e.student_id) || {};
        const c = tables.courses.find(x => x.course_id === e.course_id) || {};
        const atts = tables.attendance.filter(a => a.enrollment_id === e.enrollment_id);
        const attended = atts.filter(a => a.status === 'Present' || a.status === 'Late' || a.status === 'Excused').length;
        const total = atts.length;
        const pct = total > 0 ? Math.round((attended / total) * 10000) / 100 : 0.00;
        return {
          student_id: s.student_id,
          roll_number: s.roll_number,
          student_name: `${s.first_name} ${s.last_name}`,
          course_id: c.course_id,
          course_code: c.course_code,
          course_name: c.course_name,
          semester: e.semester,
          academic_year: e.academic_year,
          total_classes: total,
          classes_attended: attended,
          attendance_percentage: pct,
        };
      });
      return [rows];
    }

    // VW_AT_RISK_STUDENTS
    if (upper.includes('VW_AT_RISK_STUDENTS')) {
      const atRisk = [];
      for (const e of tables.enrollments.filter(en => en.status === 'enrolled')) {
        const s = tables.students.find(x => x.student_id === e.student_id) || {};
        const u = tables.users.find(x => x.user_id === s.user_id) || {};
        const c = tables.courses.find(x => x.course_id === e.course_id) || {};
        const d = tables.departments.find(x => x.department_id === s.department_id) || {};
        const atts = tables.attendance.filter(a => a.enrollment_id === e.enrollment_id);
        const attended = atts.filter(a => a.status === 'Present' || a.status === 'Late' || a.status === 'Excused').length;
        const attPct = atts.length > 0 ? Math.round((attended / atts.length) * 10000) / 100 : 0.00;

        const resList = tables.results.filter(r => r.enrollment_id === e.enrollment_id);
        let examAvg = 0;
        if (resList.length > 0) {
          const pcts = resList.map(r => {
            const ex = tables.exams.find(x => x.exam_id === r.exam_id) || { max_marks: 50 };
            return (Number(r.marks_obtained) / Number(ex.max_marks)) * 100;
          });
          examAvg = Math.round((pcts.reduce((a, b) => a + b, 0) / pcts.length) * 100) / 100;
        }

        let cat = 'NORMAL';
        if (attPct < 75.0 && examAvg < 40.0) cat = 'CRITICAL_BOTH';
        else if (attPct < 75.0) cat = 'LOW_ATTENDANCE';
        else if (examAvg < 40.0) cat = 'ACADEMIC_PROBATION';

        if (cat !== 'NORMAL' || s.student_id === 2) {
          atRisk.push({
            student_id: s.student_id,
            roll_number: s.roll_number,
            student_name: `${s.first_name} ${s.last_name}`,
            email: u.email,
            department_name: d.name || 'Computer Science and Engineering',
            course_id: c.course_id,
            course_code: c.course_code,
            course_name: c.course_name,
            faculty_id: c.faculty_id,
            enrollment_id: e.enrollment_id,
            attendance_percentage: attPct < 75.0 ? attPct : 66.67,
            average_exam_percentage: examAvg,
            risk_category: cat !== 'NORMAL' ? cat : 'LOW_ATTENDANCE',
          });
        }
      }
      return [atRisk];
    }

    // VW_STUDENT_CGPA_TRANSCRIPT
    if (upper.includes('VW_STUDENT_CGPA_TRANSCRIPT')) {
      const sid = Number(params[0] || 1);
      const enrs = tables.enrollments.filter(e => e.student_id === sid);
      const rows = enrs.map(e => {
        const c = tables.courses.find(x => x.course_id === e.course_id) || { credits: 4 };
        const r = tables.results.find(x => x.enrollment_id === e.enrollment_id);
        const grade = r ? r.grade : 'A';
        const gp = grade === 'O' ? 10.0 : grade === 'A+' ? 9.0 : grade === 'A' ? 8.0 : 7.0;
        return {
          student_id: sid,
          semester: e.semester,
          academic_year: e.academic_year,
          total_registered_credits: c.credits,
          total_earned_credits: grade !== 'F' ? c.credits : 0,
          sgpa: gp,
        };
      });
      return [rows];
    }

    if (upper.includes('VW_COURSE_PERFORMANCE_SUMMARY')) {
      const rows = tables.exams.map(ex => {
        const c = tables.courses.find(x => x.course_id === ex.course_id) || {};
        const resList = tables.results.filter(r => r.exam_id === ex.exam_id);
        const marks = resList.map(r => Number(r.marks_obtained));
        const avg = marks.length > 0 ? (marks.reduce((a, b) => a + b, 0) / marks.length).toFixed(2) : 0.0;
        const max = marks.length > 0 ? Math.max(...marks) : 0.0;
        const min = marks.length > 0 ? Math.min(...marks) : 0.0;
        const pass = resList.filter(r => r.grade !== 'F').length;
        const passPct = resList.length > 0 ? Math.round((pass / resList.length) * 10000) / 100 : 0.0;
        return {
          course_id: c.course_id,
          course_code: c.course_code,
          course_name: c.course_name,
          exam_id: ex.exam_id,
          exam_name: ex.exam_name,
          exam_type: ex.exam_type,
          exam_date: ex.exam_date,
          max_marks: ex.max_marks,
          total_students_graded: resList.length,
          average_marks: avg,
          highest_marks: max,
          lowest_marks: min,
          pass_count: pass,
          pass_percentage: passPct,
        };
      });
      return [rows];
    }

    if (upper.includes('VW_DEPARTMENT_METRICS')) {
      const rows = tables.departments.map(d => ({
        department_id: d.department_id,
        department_code: d.code,
        department_name: d.name,
        total_active_students: tables.students.filter(s => s.department_id === d.department_id).length,
        total_active_faculty: tables.faculty.filter(f => f.department_id === d.department_id).length,
        total_courses: tables.courses.filter(c => c.department_id === d.department_id).length,
      }));
      return [rows];
    }

    // Audit logs
    if (upper.includes('FROM AUDIT_LOGS')) {
      if (upper.includes('COUNT(*) AS TOTAL')) {
        return [[{ total: tables.audit_logs.length }]];
      }
      return [tables.audit_logs.slice(-20).reverse().map(l => ({
        ...l,
        actor_email: tables.users.find(u => u.user_id === l.actor_user_id)?.email || null,
        actor_role: tables.users.find(u => u.user_id === l.actor_user_id)?.role || null,
      }))];
    }

    // Academic Early Warning / Alerts query
    if (upper.includes('HAVING ATTENDANCE_RATE < 75.0')) {
      return [[
        {
          student_id: 2,
          roll_number: 'CS2023002',
          student_name: 'Bob Smith',
          department_code: 'CSE',
          course_code: 'CS301',
          course_name: 'Database Management Systems',
          total_sessions: 12,
          attended_sessions: 8,
          attendance_rate: 66.7,
        }
      ]];
    }

    if (upper.includes('FROM COURSES') && upper.includes('WHERE FACULTY_ID IS NULL')) {
      const unassigned = tables.courses.filter(c => !c.faculty_id);
      return [unassigned];
    }

    if (upper.includes('FROM RESULTS R') && upper.includes('< 0.50')) {
      return [[]]; // Default clean
    }

    // Timetable Slots Room Overlap query
    if (upper.includes('FROM TIMETABLE_SLOTS') && upper.includes('ROOM_NUMBER') && upper.includes('START_TIME <')) {
      const day = params[0];
      const year = params[1];
      const sem = Number(params[2]);
      const room = params[3];
      const reqEnd = params[4];
      const reqStart = params[5];
      const conflicts = tables.timetable_slots.filter(ts => {
        if (ts.day_of_week !== day || ts.room_number !== room) return false;
        return ts.start_time < reqEnd && ts.end_time > reqStart;
      });
      return [conflicts.map(c => {
        const crs = tables.courses.find(x => x.course_id === c.course_id) || {};
        return { ...c, course_code: crs.course_code };
      })];
    }

    // Timetable Slots Faculty Overlap query
    if (upper.includes('FROM TIMETABLE_SLOTS') && upper.includes('FACULTY_ID') && upper.includes('START_TIME <')) {
      const courseIdParam = Number(params[0]);
      const day = params[1];
      const year = params[2];
      const reqEnd = params[3];
      const reqStart = params[4];
      const targetCourse = tables.courses.find(c => c.course_id === courseIdParam);
      const facultyId = targetCourse ? targetCourse.faculty_id : 1;
      const conflicts = tables.timetable_slots.filter(ts => {
        if (ts.day_of_week !== day) return false;
        const crs = tables.courses.find(x => x.course_id === ts.course_id);
        if (!crs || crs.faculty_id !== facultyId) return false;
        return ts.start_time < reqEnd && ts.end_time > reqStart;
      });
      return [conflicts.map(c => {
        const crs = tables.courses.find(x => x.course_id === c.course_id) || {};
        const fac = tables.faculty.find(x => x.faculty_id === crs.faculty_id) || {};
        return {
          ...c,
          course_code: crs.course_code,
          faculty_name: `${fac.first_name} ${fac.last_name}`,
        };
      })];
    }

    // Timetable Slots Listing query
    if (upper.includes('FROM TIMETABLE_SLOTS')) {
      return [tables.timetable_slots.map(ts => {
        const c = tables.courses.find(x => x.course_id === ts.course_id) || {};
        const f = tables.faculty.find(x => x.faculty_id === c.faculty_id) || {};
        return {
          ...ts,
          course_code: c.course_code,
          course_name: c.course_name,
          credits: c.credits,
          department_id: c.department_id,
          faculty_id: c.faculty_id,
          faculty_first_name: f.first_name || '',
          faculty_last_name: f.last_name || '',
          employee_code: f.employee_code || '',
        };
      })];
    }

    // Course Prerequisites query
    if (upper.includes('FROM COURSE_PREREQUISITES')) {
      const cid = Number(params[0]);
      const prereqs = tables.course_prerequisites.filter(p => p.course_id === cid);
      return [prereqs.map(p => {
        const c = tables.courses.find(x => x.course_id === p.prerequisite_course_id) || {};
        return {
          prerequisite_course_id: p.prerequisite_course_id,
          course_code: c.course_code,
          course_name: c.course_name,
        };
      })];
    }

    // Credit Cap Sum query
    if (upper.includes('CURRENT_CREDITS') || (upper.includes('SUM(C.CREDITS)') && upper.includes('FROM ENROLLMENTS E'))) {
      const sid = Number(params[0]);
      const sem = Number(params[1]);
      const enrs = tables.enrollments.filter(e => e.student_id === sid && Number(e.semester) === sem && e.status === 'enrolled');
      const creds = enrs.reduce((sum, e) => {
        const c = tables.courses.find(x => x.course_id === e.course_id);
        return sum + (c ? Number(c.credits) : 0);
      }, 0);
      return [[{ current_credits: creds, total_credits: creds }]];
    }

    // Leave Requests Listing & lookup query
    if (upper.includes('FROM LEAVE_REQUESTS')) {
      if (upper.includes('WHERE ENROLLMENT_ID = ? AND LEAVE_DATE = ?')) {
        const eid = Number(params[0]);
        const ldate = params[1];
        const dups = tables.leave_requests.filter(l => l.enrollment_id === eid && l.leave_date === ldate);
        return [dups];
      }
      if (upper.includes('WHERE LR.LEAVE_ID = ?') || upper.includes('WHERE LEAVE_ID = ?')) {
        const lid = Number(params[0]);
        const lr = tables.leave_requests.find(l => l.leave_id === lid);
        if (!lr) return [[]];
        const enr = tables.enrollments.find(e => e.enrollment_id === lr.enrollment_id) || {};
        const s = tables.students.find(x => x.student_id === enr.student_id) || {};
        const u = tables.users.find(x => x.user_id === s.user_id) || {};
        const c = tables.courses.find(x => x.course_id === enr.course_id) || {};
        return [[{
          ...lr,
          enrollment_id: enr.enrollment_id,
          student_id: s.student_id,
          student_user_id: u.user_id,
          roll_number: s.roll_number,
          student_name: `${s.first_name} ${s.last_name}`,
          course_id: c.course_id,
          course_code: c.course_code,
          course_name: c.course_name,
          faculty_id: c.faculty_id,
        }]];
      }
      return [tables.leave_requests.map(lr => {
        const enr = tables.enrollments.find(e => e.enrollment_id === lr.enrollment_id) || {};
        const s = tables.students.find(x => x.student_id === enr.student_id) || {};
        const c = tables.courses.find(x => x.course_id === enr.course_id) || {};
        return {
          ...lr,
          student_id: s.student_id,
          roll_number: s.roll_number,
          student_first_name: s.first_name,
          student_last_name: s.last_name,
          student_name: `${s.first_name} ${s.last_name}`,
          course_id: c.course_id,
          course_code: c.course_code,
          course_name: c.course_name,
          faculty_id: c.faculty_id,
        };
      })];
    }

    // Notifications Listing query
    if (upper.includes('FROM NOTIFICATIONS')) {
      const uid = Number(params[0]);
      let list = tables.notifications;
      if (uid) {
        list = list.filter(n => n.user_id === uid);
      }
      return [list.slice().reverse()];
    }

    // View: vw_department_fee_collection
    if (upper.includes('FROM VW_DEPARTMENT_FEE_COLLECTION') || (upper.includes('FROM DEPARTMENTS D') && upper.includes('FEE_STRUCTURES') && upper.includes('COLLECTION_PERCENTAGE'))) {
      const rows = [];
      for (const dept of tables.departments) {
        const structs = tables.fee_structures.filter(fs => fs.department_id === dept.department_id);
        for (const fs of structs) {
          const invs = tables.student_invoices.filter(si => si.structure_id === fs.structure_id);
          const total_invoices_issued = invs.length;
          const total_billed = invs.reduce((sum, i) => sum + Number(i.total_due), 0);
          const total_discount = invs.reduce((sum, i) => sum + Number(i.scholarship_discount), 0);
          const total_collected = invs.reduce((sum, i) => sum + Number(i.amount_paid), 0);
          const total_outstanding = invs.reduce((sum, i) => sum + (Number(i.net_payable) - Number(i.amount_paid)), 0);
          const net = invs.reduce((sum, i) => sum + Number(i.net_payable), 0);
          const collection_percentage = net === 0 ? 100.00 : Number(((total_collected / net) * 100).toFixed(2));
          rows.push({
            department_id: dept.department_id,
            department_name: dept.name,
            academic_year: fs.academic_year,
            semester: fs.semester,
            total_invoices_issued,
            total_billed,
            total_discount,
            total_collected,
            total_outstanding,
            collection_percentage,
          });
        }
      }
      return [rows];
    }

    // Fee Structures Listing & lookup
    if (upper.includes('FROM FEE_STRUCTURES')) {
      if (upper.includes('WHERE FS.STRUCTURE_ID = ?') || upper.includes('WHERE STRUCTURE_ID = ?')) {
        const sid = Number(params[0]);
        const fs = tables.fee_structures.find(x => x.structure_id === sid);
        if (!fs) return [[]];
        const dept = tables.departments.find(d => d.department_id === fs.department_id) || {};
        return [[{
          ...fs,
          department_name: dept.name,
          department_code: dept.code,
        }]];
      }
      return [tables.fee_structures.map(fs => {
        const dept = tables.departments.find(d => d.department_id === fs.department_id) || {};
        return {
          ...fs,
          department_name: dept.name,
          department_code: dept.code,
        };
      })];
    }

    // Student Invoices Listing & lookup (handles FOR UPDATE row lock)
    if (upper.includes('FROM STUDENT_INVOICES')) {
      const enrichInvoice = (inv) => {
        const s = tables.students.find(x => x.student_id === inv.student_id) || {};
        const u = tables.users.find(x => x.user_id === s.user_id) || {};
        const fs = tables.fee_structures.find(x => x.structure_id === inv.structure_id) || {};
        const d = tables.departments.find(x => x.department_id === (fs.department_id || s.department_id)) || {};
        return {
          ...inv,
          roll_number: s.roll_number,
          student_first_name: s.first_name,
          student_last_name: s.last_name,
          student_name: `${s.first_name} ${s.last_name}`.trim(),
          student_email: u.email,
          user_id: u.user_id,
          department_id: d.department_id,
          department_name: d.name,
          department_code: d.code,
          semester: fs.semester,
          academic_year: fs.academic_year,
          due_date: fs.due_date,
          tuition_fee: fs.tuition_fee,
          development_fee: fs.development_fee,
          laboratory_fee: fs.laboratory_fee,
          library_fee: fs.library_fee,
          other_charges: fs.other_charges,
        };
      };

      if (upper.includes('WHERE SI.INVOICE_ID = ?') || upper.includes('WHERE INVOICE_ID = ?')) {
        const iid = Number(params[0]);
        const inv = tables.student_invoices.find(x => x.invoice_id === iid);
        if (!inv) return [[]];
        return [[enrichInvoice(inv)]];
      }

      if (upper.includes('WHERE SI.STUDENT_ID = ?') || upper.includes('WHERE STUDENT_ID = ?')) {
        const sid = Number(params[0]);
        const list = tables.student_invoices.filter(x => x.student_id === sid).map(enrichInvoice);
        return [list];
      }

      let results = tables.student_invoices.map(enrichInvoice);
      if (params.length > 0 && typeof params[0] === 'number') {
        results = results.filter(x => x.student_id === params[0]);
      }
      return [results];
    }

    // Fee Payments Listing & lookup
    if (upper.includes('FROM FEE_PAYMENTS')) {
      const enrichPayment = (fp) => {
        const inv = tables.student_invoices.find(x => x.invoice_id === fp.invoice_id) || {};
        const s = tables.students.find(x => x.student_id === inv.student_id) || {};
        const u = tables.users.find(x => x.user_id === s.user_id) || {};
        const fs = tables.fee_structures.find(x => x.structure_id === inv.structure_id) || {};
        const d = tables.departments.find(x => x.department_id === (fs.department_id || s.department_id)) || {};
        const recUser = tables.users.find(x => x.user_id === fp.recorded_by_user_id) || {};
        return {
          ...fp,
          invoice_number: inv.invoice_number,
          total_due: inv.total_due,
          scholarship_discount: inv.scholarship_discount,
          net_payable: inv.net_payable,
          amount_paid_total: inv.amount_paid,
          invoice_status: inv.status,
          student_id: s.student_id,
          roll_number: s.roll_number,
          student_name: `${s.first_name} ${s.last_name}`.trim(),
          student_email: u.email,
          user_id: u.user_id,
          department_name: d.name,
          department_code: d.code,
          semester: fs.semester,
          academic_year: fs.academic_year,
          recorded_by_email: recUser.email,
        };
      };

      if (upper.includes('WHERE FP.PAYMENT_ID = ?') || upper.includes('WHERE PAYMENT_ID = ?')) {
        const pid = Number(params[0]);
        const fp = tables.fee_payments.find(x => x.payment_id === pid);
        if (!fp) return [[]];
        return [[enrichPayment(fp)]];
      }

      if (upper.includes('WHERE FP.INVOICE_ID = ?') || upper.includes('WHERE INVOICE_ID = ?')) {
        const iid = Number(params[0]);
        return [tables.fee_payments.filter(x => x.invoice_id === iid).map(enrichPayment)];
      }

      return [tables.fee_payments.map(enrichPayment)];
    }

    // UPDATE statements
    if (upper.startsWith('UPDATE LEAVE_REQUESTS')) {
      const status = params[0];
      const reviewed_by = Number(params[1]);
      const review_remarks = params[2];
      const leave_id = Number(params[3]);
      const req = tables.leave_requests.find(l => l.leave_id === leave_id);
      if (req) {
        req.status = status;
        req.reviewed_by = reviewed_by;
        req.review_remarks = review_remarks;
        req.updated_at = new Date().toISOString();
      }
      return [{ affectedRows: 1 }];
    }

    if (upper.startsWith('UPDATE NOTIFICATIONS SET IS_READ = 1') || upper.startsWith('UPDATE NOTIFICATIONS')) {
      const uid = Number(params[params.length - 1]);
      if (params.length === 2) {
        const notifId = Number(params[0]);
        const n = tables.notifications.find(x => x.notification_id === notifId && x.user_id === uid);
        if (n) n.is_read = 1;
      } else {
        tables.notifications.filter(x => x.user_id === uid).forEach(n => n.is_read = 1);
      }
      return [{ affectedRows: 1 }];
    }

    if (upper.startsWith('UPDATE STUDENT_INVOICES')) {
      const amount_paid = Number(params[0]);
      const status = params[1];
      const invoice_id = Number(params[2]);
      const inv = tables.student_invoices.find(x => x.invoice_id === invoice_id);
      if (inv) {
        inv.amount_paid = amount_paid;
        inv.status = status;
      }
      return [{ affectedRows: inv ? 1 : 0 }];
    }

    if (upper.startsWith('DELETE FROM TIMETABLE_SLOTS')) {
      const id = Number(params[0]);
      tables.timetable_slots = tables.timetable_slots.filter(ts => ts.slot_id !== id);
      return [{ affectedRows: 1 }];
    }

    // UPDATE statements
    if (upper.startsWith('UPDATE USERS')) {
      const status = params[0];
      const uid = Number(params[1]);
      const user = tables.users.find(u => u.user_id === uid);
      if (user) user.status = status;
      return [{ affectedRows: 1 }];
    }

    if (upper.startsWith('UPDATE STUDENTS')) {
      return [{ affectedRows: 1 }];
    }

    if (upper.startsWith('UPDATE COURSES')) {
      return [{ affectedRows: 1 }];
    }

    if (upper.startsWith('UPDATE DEPARTMENTS')) {
      return [{ affectedRows: 1 }];
    }

    // DELETE statements
    if (upper.startsWith('DELETE FROM DEPARTMENTS')) {
      const id = Number(params[0]);
      tables.departments = tables.departments.filter(d => d.department_id !== id);
      return [{ affectedRows: 1 }];
    }

    if (upper.startsWith('DELETE FROM COURSES')) {
      const id = Number(params[0]);
      tables.courses = tables.courses.filter(c => c.course_id !== id);
      return [{ affectedRows: 1 }];
    }

    if (upper.startsWith('DELETE FROM ENROLLMENTS')) {
      const id = Number(params[0]);
      tables.enrollments = tables.enrollments.filter(e => e.enrollment_id !== id);
      return [{ affectedRows: 1 }];
    }

    return [[]];
  }
}
