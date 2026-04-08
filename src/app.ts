import express, { Application } from 'express';
import cors from 'cors';
import { cardRouter } from './infrastructure/web/routes/card.routes';
import { userRouter } from './infrastructure/web/routes/user.routes';
import { albumRouter } from './infrastructure/web/routes/album.routes';
import { pageRouter } from './infrastructure/web/routes/page.routes';
import { errorMiddleware } from './infrastructure/web/middlewares/error.middleware';

export class App {
  private readonly app: Application;

  constructor() {
    this.app = express();
    this.middlewares();
    this.routes();
    this.errorHandling();
  }

  private middlewares(): void {
    // CORS: permite solo el origen del frontend (ajusta según necesites)
    const allowedOrigins = [
      'http://127.0.0.1:5500',
      'http://localhost:5500',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];
    this.app.use(cors({
      origin: (origin, callback) => {
        // allow requests with no origin (e.g. curl, postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('CORS policy: Origin not allowed'));
      },
      methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
      allowedHeaders: ['Content-Type','Authorization'],
      credentials: true,
    }));

    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private routes(): void {
    this.app.use('/api/cards', cardRouter);
    this.app.use('/api/users', userRouter);
    this.app.use('/api/albums', albumRouter);
    this.app.use('/api/pages', pageRouter);

    this.app.get('/health', (_req, res) => {
      res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });
  }

  private errorHandling(): void {
    this.app.use(errorMiddleware);
  }

  async start(port: number): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
        console.log(`Environment: ${process.env['NODE_ENV'] ?? 'development'}`);
        resolve();
      });
    });
  }
}
