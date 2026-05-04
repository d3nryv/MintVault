import { Request, Response, NextFunction } from 'express';
import { DeckRepository } from '../../../domain/repositories';
import { 
    CreateDeckUseCase, 
    UpdateDeckUseCase, 
    GetDecksByOwnerUseCase
} from '../../../application/use-cases';

export class DeckController {
    constructor(
        private readonly deckRepository: DeckRepository
    ) {}

    getByOwner = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const ownerId = req.params.ownerId as string;
            const decks = await new GetDecksByOwnerUseCase(this.deckRepository).execute(ownerId);
            res.json(decks);
        } catch (error) {
            next(error);
        }
    }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.body || Object.keys(req.body).length === 0) {
                return res.status(400).json({ error: 'Request body is required' });
            }
            const deck = await new CreateDeckUseCase(this.deckRepository).execute(req.body);
            res.status(201).json(deck);
        } catch (error) {
            next(error);
        }
    }

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.body || Object.keys(req.body).length === 0) {
                return res.status(400).json({ error: 'Request body is required' });
            }
            const id = req.params.id as string;
            const deck = await new UpdateDeckUseCase(this.deckRepository).execute(id, req.body);
            res.json(deck);
        } catch (error) {
            next(error);
        }
    }
}
