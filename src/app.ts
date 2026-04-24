import express, { Application } from 'express';
import cors from 'cors';
import { cardRouter } from './infrastructure/web/routes/card.routes';
import { userRouter } from './infrastructure/web/routes/user.routes';
import { albumRouter } from './infrastructure/web/routes/album.routes';
import { pageRouter } from './infrastructure/web/routes/page.routes';
import { saleRouter } from './infrastructure/web/routes/sale.routes';
import { transactionRouter } from './infrastructure/web/routes/transaction.routes';
import { pokedexRouter } from './infrastructure/web/routes/pokemon.routes';
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
    // CORS: permite solo el origen del frontend 
    const allowedOrigins = [
      'http://127.0.0.1:5500',
      'http://localhost:5500',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'chrome-extension://amknoiejhlmhancpahfcfcfhllgkpbld'
    ];
    this.app.use(cors({
      origin: (origin, callback) => {
        // allow requests with no origin (e.g. curl, postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        
        console.warn(`[CORS] Origen bloqueado: ${origin}`);
        // Devolvemos false en lugar de Error para que el navegador bloquee la petición 
        // pero el servidor no registre un error crítico "unhandled".
        return callback(null, false);
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
    this.app.use('/api/sales', saleRouter);
    this.app.use('/api/transactions', transactionRouter);
    this.app.use('/api/pokedex', pokedexRouter);

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
