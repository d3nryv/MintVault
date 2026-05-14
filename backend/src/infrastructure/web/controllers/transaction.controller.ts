import { Request, Response, NextFunction } from 'express';
import { TransactionRepository } from '../../../domain/repositories/transaction.repository';
import { SaleRepository } from '../../../domain/repositories/sale.repository';
import { TransactionStatus } from '../../../domain/entities/transaction.entity';
import {
  CreateTransactionUseCase,
  GetTransactionUseCase,
  ListTransactionsUseCase,
  UpdateTransactionStatusUseCase,
  GetPriceHistoryUseCase,
  CreateTransactionDto
} from '../../../application/use-cases';
import { db } from '../../database/postgres/database';

export class TransactionController {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly saleRepository: SaleRepository
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as CreateTransactionDto;
      const transaction = await new CreateTransactionUseCase(
        this.transactionRepository, 
        this.saleRepository,
        db
      ).execute(dto);
      res.status(201).json(transaction);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const transaction = await new GetTransactionUseCase(this.transactionRepository).execute(String(req.params['id']));
      res.json(transaction);
    } catch (err) {
      next(err);
    }
  };

  getByBuyer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const transactions = await new ListTransactionsUseCase(this.transactionRepository).execute(String(req.params['userId']), 'buyer');
      res.json(transactions);
    } catch (err) {
      next(err);
    }
  };

  getBySeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const transactions = await new ListTransactionsUseCase(this.transactionRepository).execute(String(req.params['userId']), 'seller');
      res.json(transactions);
    } catch (err) {
      next(err);
    }
  };

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = req.body.status as TransactionStatus;
      const userId = String(req.body.userId);
      const transaction = await new UpdateTransactionStatusUseCase(this.transactionRepository, this.saleRepository).execute(
        String(req.params['id']),
        status,
        userId
      );
      res.json(transaction);
    } catch (err) {
      next(err);
    }
  };

  getPriceHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const history = await new GetPriceHistoryUseCase(this.transactionRepository).execute(String(req.params['cardId']));
      res.json(history);
    } catch (err) {
      next(err);
    }
  };
}
