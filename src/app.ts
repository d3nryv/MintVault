import express, { Application } from 'express';
import { cardRouter } from './infrastructure/web/routes/card.routes';
import { userRouter } from './infrastructure/web/routes/user.routes';
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
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  private routes(): void {
    this.app.use('/api/cards', cardRouter);
    this.app.use('/api/users', userRouter);

    // Health check
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
        console.log(`🚀 Server running on http://localhost:${port}`);
        console.log(`📦 Environment: ${process.env['NODE_ENV'] ?? 'development'}`);
        resolve();
      });
    });
  }
}
