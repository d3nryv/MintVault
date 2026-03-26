import * as dotenv from 'dotenv';
dotenv.config();

interface EnvVars {
  PORT: number;
  NODE_ENV: string;
}

export const envs: EnvVars = {
  PORT: Number(process.env['PORT'] ?? 3000),
  NODE_ENV: process.env['NODE_ENV'] ?? 'development',
};
