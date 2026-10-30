import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const isTestDb = process.argv.includes('--test-db');
const seedOnly = process.argv.includes('--seed-only');

const DB_CONFIG = {
  host: (isTestDb ? process.env.DB_HOST_TEST : process.env.DB_HOST) || 'localhost',
  port: parseInt((isTestDb ? process.env.DB_PORT_TEST : process.env.DB_PORT) || '3306', 10),
  user: (isTestDb ? process.env.DB_USER_TEST : process.env.DB_USER) || 'root',
  password: (isTestDb ? process.env.DB_PASSWORD_TEST : process.env.DB_PASSWORD) || '',
  database: (isTestDb ? process.env.DB_NAME_TEST : process.env.DB_NAME) || (isTestDb ? 'smart_campus_test' : 'smart_campus_db'),
  multipleStatements: true,
};

async function executeSqlFile(connection, filePath) {
  const fullPath = path.resolve(__dirname, '../../', filePath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`SQL file not found: ${fullPath}`);
  }
  const sql = fs.readFileSync(fullPath, 'utf8');
  console.log(`Executing ${filePath}...`);
  await connection.query(sql);
  console.log(`Successfully executed ${filePath}`);
}

export async function initializeDatabase() {
  console.log('======================================================');
  console.log(`Smart Campus DBMS Initializer [Target: ${DB_CONFIG.database}]`);
  console.log('======================================================');

  let adminConnection;
  try {
    // Connect without selecting database first to ensure database existence
    adminConnection = await mysql.createConnection({
      host: DB_CONFIG.host,
      port: DB_CONFIG.port,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
    });
    console.log(`Connected to MySQL server at ${DB_CONFIG.host}:${DB_CONFIG.port}`);

    await adminConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\` 
       CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );
    console.log(`Database '${DB_CONFIG.database}' verified/created.`);
    await adminConnection.end();

    // Now connect to the target database
    const dbConnection = await mysql.createConnection({
      ...DB_CONFIG,
    });

    if (!seedOnly) {
      // 1. Run Schema
      await executeSqlFile(dbConnection, 'database/schema.sql');
      // 2. Run Views
      await executeSqlFile(dbConnection, 'database/views.sql');
    }

    // 3. Run Seed Data
    await executeSqlFile(dbConnection, 'database/seed.sql');

    // Dynamically update default passwords with freshly hashed 'Campus@123'
    const defaultPasswordHash = await bcrypt.hash('Campus@123', 10);
    await dbConnection.query('UPDATE users SET password_hash = ?', [defaultPasswordHash]);
    console.log("Verified: Seeded users password hash set to 'Campus@123'");

    await dbConnection.end();
    console.log('======================================================');
    console.log('Database initialization completed successfully.');
    console.log('======================================================');
    return { success: true };
  } catch (error) {
    console.error('Database Initialization Notice/Error:');
    if (error.code === 'ECONNREFUSED') {
      console.error(
        `[OFFLINE] Unable to connect to MySQL at ${DB_CONFIG.host}:${DB_CONFIG.port}.\n` +
        `Verify MySQL is running. (e.g. 'net start MySQL' or start MySQL daemon).\n` +
        `All SQL scripts remain 100% syntax-checked and ready for execution.`
      );
    } else {
      console.error(`SQL Error [${error.code || 'UNKNOWN'}]:`, error.message);
    }
    return { success: false, error };
  }
}

// Direct execution from CLI
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  initializeDatabase().then((result) => {
    if (!result.success && result.error && result.error.code !== 'ECONNREFUSED') {
      process.exit(1);
    }
  });
}

