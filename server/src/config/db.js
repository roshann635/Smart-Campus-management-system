import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { TestDbHarness } from './inMemoryDb.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const isTestEnv = process.env.NODE_ENV === 'test';

export const dbConfig = {
  host: (isTestEnv ? process.env.DB_HOST_TEST : process.env.DB_HOST) || 'localhost',
  port: parseInt((isTestEnv ? process.env.DB_PORT_TEST : process.env.DB_PORT) || '3306', 10),
  user: (isTestEnv ? process.env.DB_USER_TEST : process.env.DB_USER) || 'root',
  password: (isTestEnv ? process.env.DB_PASSWORD_TEST : process.env.DB_PASSWORD) || '',
  database: (isTestEnv ? process.env.DB_NAME_TEST : process.env.DB_NAME) || (isTestEnv ? 'smart_campus_test' : 'smart_campus_db'),
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  dateStrings: true,
  charset: 'utf8mb4',
};

let pool = null;
let mockPoolInstance = null;

export function setMockPool(mock) {
  mockPoolInstance = mock;
}

export function enableInMemoryFallback() {
  if (!mockPoolInstance) {
    mockPoolInstance = new TestDbHarness();
  }
  return mockPoolInstance;
}

export function isMockMode() {
  return !!mockPoolInstance;
}

export function getPool() {
  if (mockPoolInstance) {
    return mockPoolInstance;
  }
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

/**
 * Executes a parameterized query on the pool.
 */
export async function query(sql, params = []) {
  const p = getPool();
  return p.query(sql, params);
}

/**
 * Obtains a single connection from the pool (ideal for transactions).
 */
export async function getConnection() {
  const p = getPool();
  return p.getConnection();
}

/**
 * Health check utility for verifying database availability.
 */
export async function checkDatabaseConnection() {
  if (mockPoolInstance) {
    return { connected: true, mode: 'IN_MEMORY_FALLBACK' };
  }
  try {
    const p = getPool();
    const [rows] = await p.query('SELECT 1 AS alive');
    return { connected: true, rows, mode: 'MYSQL' };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
      code: error.code,
    };
  }
}

export default {
  getPool,
  query,
  getConnection,
  checkDatabaseConnection,
  setMockPool,
  enableInMemoryFallback,
  isMockMode,
  dbConfig,
};
