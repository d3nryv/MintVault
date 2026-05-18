import { App } from '../src/app';
import { db } from '../src/infrastructure/database/postgres/database';

let isConnected = false;
const expressApp = new App().getApp();

export default async (req: any, res: any) => {
  if (!isConnected) {
    try {
      await db.connect();
      isConnected = true;
      console.log('Database connected successfully in serverless environment.');
    } catch (error) {
      console.error('Error connecting to database:', error);
      return res.status(500).json({ error: 'Database connection failed' });
    }
  }
  return expressApp(req, res);
};
