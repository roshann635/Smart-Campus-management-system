import session from 'express-session';
import MySQLStoreFactory from 'express-mysql-session';
import { dbConfig, getPool, isMockMode } from './db.js';

const MySQLStore = MySQLStoreFactory(session);

export function configureSession() {
  const isProd = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test';

  let sessionStore;

  if (!isTest && !isMockMode()) {
    try {
      const options = {
        clearExpired: true,
        checkExpirationInterval: 900000, // 15 mins
        expiration: parseInt(process.env.SESSION_MAX_AGE_MS || '86400000', 10),
        createDatabaseTable: false, // Table created via schema.sql
        schema: {
          tableName: 'sessions',
          columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data',
          },
        },
      };

      const pool = getPool();
      sessionStore = new MySQLStore(options, pool);
      sessionStore.on('error', (err) => {
        console.warn('[Session Store Warning] MySQL session store error (falling back to MemoryStore):', err.message);
      });
    } catch (err) {
      console.warn('[Session Store Warning] Could not initialize MySQL session store, using MemoryStore:', err.message);
      sessionStore = undefined;
    }
  }

  return session({
    key: 'campus_session_id',
    secret: process.env.SESSION_SECRET || 'smart-campus-super-secret-dev-session-key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: parseInt(process.env.SESSION_MAX_AGE_MS || '86400000', 10),
    },
  });
}
