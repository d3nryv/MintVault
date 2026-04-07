
import 'dotenv/config';
import { get } from './env-var';

export const envs = {
  // Server
  PORT: get('PORT', 3000),
  NODE_ENV: get('NODE_ENV', 'development'),
  
  // Database
  DB_HOST: get('DB_HOST', 'localhost'),
  DB_PORT: get('DB_PORT', 5432),
  DB_NAME: get('DB_NAME', 'TCG_DB'),
  DB_USER: get('DB_USER', 'postgres'),
  DB_PASSWORD: get('DB_PASSWORD', 'root'),
  DB_MAX_POOL: get('DB_MAX_POOL', 20),
  DB_IDLE_TIMEOUT: get('DB_IDLE_TIMEOUT', 30000),
  DB_CONNECTION_TIMEOUT: get('DB_CONNECTION_TIMEOUT', 30000),
};