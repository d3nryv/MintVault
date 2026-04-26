import { Request, Response, NextFunction } from 'express';
import { PageRepository } from '../../../domain/repositories';
import { CreatePageUseCase, DeletePageUseCase, GetAllPagesFromAlbumUseCase } from '../../../application/use-cases';

export class PageController {
    constructor(private readonly pageRepository: PageRepository) {}

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.body || Object.keys(req.body).length === 0) {
                return res.status(400).json({ error: 'Request body is required' });
            }
            const page = await new CreatePageUseCase(this.pageRepository).execute(req.body);
            res.status(201).json(page);
        } catch (error) {
            next(error);
        }
    }

    getByAlbum = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const albumId = req.params.albumId as string;
            const pages = await new GetAllPagesFromAlbumUseCase(this.pageRepository).execute(albumId);
            res.json(pages);
        } catch (error) {
            next(error);
        }
    }

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            await new DeletePageUseCase(this.pageRepository).execute(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
