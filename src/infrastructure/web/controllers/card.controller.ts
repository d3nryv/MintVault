import { Request, Response, NextFunction } from 'express';
import { CardRepository } from '../../../domain/repositories/card.repository';
import { TcgRepository } from '../../../domain/repositories/tcg.repository';
import {
  GetAllCardsUseCase,
  GetCardByIdUseCase,
  CreateCardUseCase,
  UpdateCardUseCase,
  DeleteCardUseCase,
} from '../../../application/use-cases';

export class CardController {
  constructor(
    private readonly cardRepository: CardRepository,
    private readonly tcgRepository: TcgRepository
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
}
