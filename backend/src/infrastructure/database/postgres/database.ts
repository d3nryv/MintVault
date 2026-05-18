import { Pool, PoolClient, QueryResult } from 'pg';
import { envs } from '../../config/envs';
import { TransactionManager } from '../../../domain/interfaces/transaction-manager.interface';

class Database implements TransactionManager {
  private static instance: Database;
  private pool: Pool;

  private constructor() {
    const isProduction = envs.NODE_ENV === 'production';
    
    this.pool = new Pool({
      host: envs.DB_HOST,
      port: envs.DB_PORT,
      database: envs.DB_NAME,
      user: envs.DB_USER,
      password: envs.DB_PASSWORD,
      max: envs.DB_MAX_POOL,
      idleTimeoutMillis: envs.DB_IDLE_TIMEOUT,
      connectionTimeoutMillis: envs.DB_CONNECTION_TIMEOUT,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    });

    // Manejar errores del pool
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      // process.exit(-1); // Do not crash the entire server on idle connection drops
    });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  async connect(): Promise<void> {
    try {
      const client = await this.pool.connect();
      console.log('Database connected successfully');
      client.release();
    } catch (error) {
      console.error('Database connection error:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.pool.end();
      console.log('Database disconnected successfully');
    } catch (error) {
      console.error('Error disconnecting database:', error);
      throw error;
    }
  }

  async query(text: string, params?: any[]): Promise<QueryResult> {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text, duration, rows: result.rowCount });
      return result;
    } catch (error) {
      console.error('Error executing query:', { text, error });
      throw error;
    }
  }

  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  async transactional<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  getPool(): Pool {
    return this.pool;
  }
}

export const db = Database.getInstance();