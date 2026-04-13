import { Request, Response, NextFunction } from 'express';
import { SaleRepository } from '../../../domain/repositories/sale.repository';
import { CardRepository } from '../../../domain/repositories/card.repository';
import {
  CreateSaleUseCase,
  GetSaleUseCase,
  GetAllSalesUseCase,
  ListSalesBySellerUseCase,
  UpdateSaleUseCase,
  DeleteSaleUseCase,
} from '../../../application/use-cases';

export class SaleController {
  constructor(
    private readonly saleRepository: SaleRepository,
    private readonly cardRepository: CardRepository
  ) {}

  getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const sales = await new GetAllSalesUseCase(this.saleRepository).execute();
      res.json(sales);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sale = await new CreateSaleUseCase(this.saleRepository, this.cardRepository).execute(req.body);
      res.status(201).json(sale);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sale = await new GetSaleUseCase(this.saleRepository).execute(String(req.params['id']));
      res.json(sale);
    } catch (err) {
      next(err);
    }
  };

  getBySeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sales = await new ListSalesBySellerUseCase(this.saleRepository).execute(String(req.params['userId']));
      res.json(sales);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.body.userId; // En un futuro esto vendría del JWT (req.user.id)
      const sale = await new UpdateSaleUseCase(this.saleRepository).execute(String(req.params['id']), req.body, userId);
      res.json(sale);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.body.userId; // En un futuro esto vendría del JWT
      await new DeleteSaleUseCase(this.saleRepository).execute(String(req.params['id']), userId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
