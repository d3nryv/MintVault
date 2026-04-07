import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { 
    GetAllUsersUseCase, 
    GetUserByIdUseCase, 
    CreateUserUseCase, 
    UpdateUserUseCase, 
    DeleteUserUseCase 
} from '../../../application/use-cases';

export class UserController {
    constructor(private readonly userRepository: UserRepository) {}

    getAll = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const users = await new GetAllUsersUseCase(this.userRepository).execute();
            res.json(users);
        } catch (error) {
            next(error);
        }
    }

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const user = await new GetUserByIdUseCase(this.userRepository).execute(id);
            if (!user) return res.status(404).json({ error: 'User not found' });
            res.json(user);
        } catch (error) {
            next(error);
        }
    }

    create = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await new CreateUserUseCase(this.userRepository).execute(req.body);
            res.status(201).json(user);
        } catch (error) {
            next(error);
        }
    }

    update = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const user = await new UpdateUserUseCase(this.userRepository).execute(id, req.body);
            res.json(user);
        } catch (error) {
            next(error);
        }
    }

    delete = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            await new DeleteUserUseCase(this.userRepository).execute(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }
}
