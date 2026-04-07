import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../../../domain/repositories/user.repository';

export class UserController {
    constructor(private readonly userRepository: UserRepository) {}

    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const users = await this.userRepository.findAll();
            res.json(users);
        } catch (error) {
            next(error);
        }
    }

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const user = await this.userRepository.findById(id);
            if (!user) return res.status(404).json({ error: 'User not found' });
            res.json(user);
        } catch (error) {
            next(error);
        }
    }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await this.userRepository.create(req.body);
            res.status(201).json(user);
        } catch (error) {
            next(error);
        }
    }

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const user = await this.userRepository.update(id, req.body);
            res.json(user);
        } catch (error) {
            next(error);
        }
    }

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            await this.userRepository.delete(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
