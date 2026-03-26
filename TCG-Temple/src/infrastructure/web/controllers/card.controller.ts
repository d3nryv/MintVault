import { Request, Response, NextFunction } from 'express';
import { CardRepository } from '../../../domain/repositories/card.repository';
import {
  GetAllCardsUseCase,
  GetCardByIdUseCase,
  CreateCardUseCase,
  UpdateCardUseCase,
  DeleteCardUseCase,
} from '../../../application/use-cases';

export class CardController {
  constructor(private readonly cardRepository: CardRepository) {}

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
      const card = await new GetCardByIdUseCase(this.cardRepository).execute(String(req.params['id']));
      res.json(card);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const card = await new CreateCardUseCase(this.cardRepository).execute(req.body);
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
