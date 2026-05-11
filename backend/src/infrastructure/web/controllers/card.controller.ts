import { Request, Response, NextFunction } from 'express';
import { CardRepository } from '../../../domain/repositories/card.repository';
import { TcgRepository } from '../../../domain/repositories/tcg.repository';
import { TransactionRepository } from '../../../domain/repositories/transaction.repository';
import {
  GetAllCardsUseCase,
  GetCardByIdUseCase,
  CreateCardUseCase,
  UpdateCardUseCase,
  DeleteCardUseCase,
  GetCardMarketValueUseCase,
  GetCardsByNameUseCase,
  SearchCardsUseCase
} from '../../../application/use-cases';

export class CardController {
  constructor(
    private readonly cardRepository: CardRepository,
    private readonly tcgRepository: TcgRepository,
    private readonly transactionRepository: TransactionRepository
  ) {}

  getAll = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const cards = await new GetAllCardsUseCase(this.cardRepository).execute();
      res.json(cards);
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const card = await new GetCardByIdUseCase(this.cardRepository, this.tcgRepository).execute(String(req.params['id']));
      res.json(card);
    } catch (err) {
      next(err);
    }
  };

  getByName = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const name = String(req.query.name || req.params.name || '');
      const cards = await new GetCardsByNameUseCase(this.tcgRepository).execute(name);
      res.json(cards);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ error: 'Request body is required' });
      }
      const card = await new CreateCardUseCase(this.cardRepository, this.tcgRepository).execute(req.body);
      res.status(201).json(card);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const card = await new UpdateCardUseCase(this.cardRepository).execute(
        String(req.params['id']),
        req.body
      );
      res.json(card);
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await new DeleteCardUseCase(this.cardRepository).execute(String(req.params['id']));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  getMarketValue = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await new GetCardMarketValueUseCase(
        this.transactionRepository,
        this.cardRepository
      ).execute(String(req.params['id']));
      
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filters = {
        name: req.query.name as string,
        set: req.query.set as string,
        number: req.query.number as string
      };
      const cards = await new SearchCardsUseCase(this.tcgRepository).execute(filters);
      res.json(cards);
    } catch (err) {
      next(err);
    }
  };
}
