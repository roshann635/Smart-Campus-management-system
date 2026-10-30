import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawStudentList = [
  "1\tAdhikari Himesh Sunil",
  "2\tBagul Sanjana Bharat",
  "3\tBaisane Vaibhav Satyavijay",
  "4\tBeldar Tirupati Gorakh",
  "5\tBerad Renuka Arun",
  "6\tBhatkhande Adwait Sunil",
  "7\tBhavar Pranali Arvind",
  "8\tBirari Devayani Vasant",
  "9\tBire Kalpesh Navnath",
  "10\tBonde Payal Laxman",
  "11\tBorse Anurag Narayan",
  "12\tChaudhari Kaustubh Pravin",
  "13\tChaudhari Krushnal Mahesh",
  "14\tChaudhari Sharvari Sandeep",
  "15\tChaudhary Farukh Israil",
  "16\tChoughule Sanika Raju",
  "17\tDeshmukh Om Sachin",
  "18\tDhomse Abhishek Dnyandev",
  "19\tDhondage Apurva Sanjay",
  "20\tErande Swapnil Sanjay",
  "21\tGaikwad Ajinkyaraj Somnath",
  "22\tGaikwad Ayush Suresh",
  "23\tGaikwad Karan Ravikumar",
  "24\tGaikwad Rohan Vishnu",
  "25\tGaikwad Roshan Nitin",
  "26\tItagi Vaishnavi Pradeepkumar",
  "27\tJadhav Aarya Narendra",
  "28\tJadhav Bhumika Anil",
  "29\tJadhav Om Dilip",
  "30\tJadhav Roshan Hari",
  "31\tJadhav Rucha Rajkumar",
  "32\tJain Shaarav Akhilesh",
  "33\tJamdhade Sumit Gulab",
  "34\tKabra Bhoomi Amit",
  "35\tKadam Srushti Ramchandra",
  "36\tKahandal Omkar Sandip",
  "37\tKandalkar Sahil Shailesh",
  "38\tKapadne Ojaswita Sanjay",
  "39\tKarhale Anjali Sachin",
  "40\tKhodake Akanksha Mangesh",
  "41\tKulkarni Apurv Santosh",
  "42\tLandge Pranav Shailesh",
  "43\tMahajan Tanish Narendra",
  "44\tMahapatra Suhani Kundan",
  "45\tMakode Ashay Shriram",
  "46\tMisar Sanchita Pawan",
  "47\tNair Abhijith Ramachandran",
  "48\tNath Muskan",
  "49\tNavandar Harsh Sanjay",
  "50\tParekh Het Dakshes",
  "51\tPatil Hrutuja Hemant",
  "52\tPatil Sharayu Sanjay",
  "53\tPatil Shweta Nitin",
  "54\tPatole Chetan Bhavrao",
  "55\tPawar Harshada Pravin",
  "56\tPawar Mandar Krushnarao",
  "57\tPhapale Pratiksha Janardan",
  "58\tPimpale Sakshi Anil",
  "59\tSankpal Raj Bhagwan",
  "60\tSarnaik Sarthak Rajkumar",
  "61\tShaikh Anam Anis",
  "62\tShardul Suyash Parag",
  "63\tSharma Yogendra Vishal",
  "64\tShelar Sneha Amol",
  "65\tShinde Aditi Bhaskar",
  "66\tShinde Aditya Raosaheb",
  "67\tShinde Vedant Vijay",
  "68\tSuryawanshi Mansi Manish",
  "69\tTandale Ayush Pramod",
  "70\tTathe Pranali Abhay",
  "71\tThorat Sahil Nitin",
  "72\tThorat Samruddhi Pravin",
  "73\tTidke Parth Vijay",
  "74\tWani Piyush Dipak",
  "75\tPatil Sangram Prashant",
];

export const parsedStudents = rawStudentList.map((line) => {
  const parts = line.trim().split(/\s+/);
  const rollNo = parseInt(parts[0], 10);
  const nameParts = parts.slice(1);
  const lastName = nameParts[0]; // Surname
  const firstName = nameParts.slice(1).join(' ') || nameParts[0]; // Given + Father's name
  const fullName = nameParts.join(' ');
  const padRoll = String(rollNo).padStart(3, '0');
  const rollNumber = `CS2025${padRoll}`;
  const email = `student${rollNo}@campus.edu`;
  const departmentId = rollNo <= 50 ? 1 : rollNo <= 65 ? 2 : 3;

  return {
    studentId: rollNo,
    userId: 3 + rollNo,
    rollNo,
    rollNumber,
    firstName,
    lastName,
    fullName,
    email,
    departmentId,
    phone: `+91-98220-${String(10000 + rollNo)}`,
    address: 'Campus Hostel, Tech Campus',
    dob: `2004-${String((rollNo % 12) + 1).padStart(2, '0')}-${String((rollNo % 28) + 1).padStart(2, '0')}`,
    enrollmentYear: 2025,
  };
});

console.log(`Successfully parsed ${parsedStudents.length} real students.`);

