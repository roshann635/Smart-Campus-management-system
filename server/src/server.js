import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { checkDatabaseConnection, enableInMemoryFallback } from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const PORT = parseInt(process.env.PORT || '5000', 10);

async function startServer() {
  // Check Database status
  const dbStatus = await checkDatabaseConnection();
  if (dbStatus.connected && dbStatus.mode === 'MYSQL') {
    console.log(`[Database] MySQL Connection Pool successfully established.`);
  } else {
    console.warn(`[Database Notice] MySQL is currently unreachable (${dbStatus.code || 'OFFLINE'}).`);
    console.warn(`[Database Notice] Auto-engaging In-Memory Relational Engine so you can immediately log in and explore!`);
    enableInMemoryFallback();
  }

  // Import app after configuring database fallback so sessions and routes initialize cleanly
  const { default: app } = await import('./app.js');

  const server = app.listen(PORT, () => {
    console.log('======================================================');
    console.log(`Smart Campus REST API active on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`API Base URL: http://localhost:${PORT}/api`);
    console.log(`Health Check: http://localhost:${PORT}/api/health`);
    console.log('======================================================');
  });

  // Graceful Shutdown
  const shutdown = () => {
    console.log('\nGracefully shutting down Smart Campus server...');
    server.close(() => {
      console.log('Server process terminated cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer();
