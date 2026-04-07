import { Request, Response, NextFunction } from 'express';
import { AlbumRepository, CardRepository, PageRepository } from '../../../domain/repositories';
import { 
    GetAllAlbumsUseCase, 
    GetAlbumByIdUseCase, 
    CreateAlbumUseCase, 
    UpdateAlbumUseCase, 
    DeleteAlbumUseCase,
    MoveCardUseCase
} from '../../../application/use-cases';

export class AlbumController {
    constructor(
        private readonly albumRepository: AlbumRepository,
        private readonly cardRepository: CardRepository,
        private readonly pageRepository: PageRepository
    ) {}

    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const albums = await new GetAllAlbumsUseCase(this.albumRepository).execute();
            res.json(albums);
        } catch (error) {
            next(error);
        }
    }

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const album = await new GetAlbumByIdUseCase(this.albumRepository).execute(id);
            if (!album) return res.status(404).json({ error: 'Album not found' });
            res.json(album);
        } catch (error) {
            next(error);
        }
    }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.body || Object.keys(req.body).length === 0) {
                return res.status(400).json({ error: 'Request body is required' });
            }
            const album = await new CreateAlbumUseCase(this.albumRepository, this.cardRepository, this.pageRepository).execute(req.body);
            res.status(201).json(album);
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
            const album = await new UpdateAlbumUseCase(this.albumRepository, this.cardRepository).execute(id, req.body);
            res.json(album);
        } catch (error) {
            next(error);
        }
    }

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            await new DeleteAlbumUseCase(this.albumRepository).execute(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    moveCard = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.body || Object.keys(req.body).length === 0) {
                return res.status(400).json({ error: 'Request body is required' });
            }
            await new MoveCardUseCase(this.albumRepository, this.pageRepository).execute(req.body);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
