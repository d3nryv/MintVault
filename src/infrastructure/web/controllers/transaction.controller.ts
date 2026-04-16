import { Request, Response, NextFunction } from 'express';
import { TransactionRepository } from '../../../domain/repositories/transaction.repository';
import { SaleRepository } from '../../../domain/repositories/sale.repository';
import {
  CreateTransactionUseCase,
  GetTransactionUseCase,
  ListTransactionsUseCase,
  UpdateTransactionStatusUseCase
} from '../../../application/use-cases';
import { db } from '../../database/postgres/database';

export class TransactionController {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly saleRepository: SaleRepository
  ) {}
  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const transaction = await new CreateTransactionUseCase(
        this.transactionRepository, 
        this.saleRepository,
        db
      ).execute(req.body);
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
      const { status, userId } = req.body;
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
}
