// src/server.ts - restarted
import { App } from './app';
import { envs } from './infrastructure/config/envs';
import { db } from './infrastructure/database/postgres/database';

async function main(): Promise<void> {
  try {
    // Conectar a la base de datos primero
    await db.connect();
    console.log('Database connection established');

    // Iniciar el servidor
    const app = new App();
    await app.start(envs.PORT);

    console.log(`
    Server running on port ${envs.PORT}
    Database: ${envs.DB_NAME} on ${envs.DB_HOST}:${envs.DB_PORT}
    Environment: ${envs.NODE_ENV}
    `);

    // Manejar cierre graceful
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n ${signal} received. Shutting down gracefully...`);
      try {
        await db.disconnect();
        console.log('Database connection closed');
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (err) {
    console.error('Fatal error during startup:', err);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});