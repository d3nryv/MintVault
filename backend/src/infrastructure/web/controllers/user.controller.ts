import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { 
    GetAllUsersUseCase, 
    GetUserByIdUseCase, 
    CreateUserUseCase, 
    UpdateUserUseCase, 
    DeleteUserUseCase,
    LoginUserUseCase,
    FollowUserUseCase,
    UnfollowUserUseCase,
    AcceptFollowRequestUseCase,
    RejectFollowRequestUseCase,
    EmptyCartUseCase,
    RemoveVendorFromCartUseCase,
    SearchUsersUseCase
} from '../../../application/use-cases';

export class UserController {
    constructor(private readonly userRepository: UserRepository) {}

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user = await new LoginUserUseCase(this.userRepository).execute(req.body);
            res.json(user);
        } catch (error) {
            next(error);
        }
    }

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
            if (!req.body || Object.keys(req.body).length === 0) {
                return res.status(400).json({ error: 'Request body is required' });
            }
            const user = await new CreateUserUseCase(this.userRepository).execute(req.body);
            res.status(201).json(user);
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

    follow = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { followerId } = req.body;
            const followingId = req.params.id as string;
            await new FollowUserUseCase(this.userRepository).execute(followerId as string, followingId);
            res.status(200).json({ message: 'User followed successfully' });
        } catch (error) {
            next(error);
        }
    }

    unfollow = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { followerId } = req.body;
            const followingId = req.params.id as string;
            await new UnfollowUserUseCase(this.userRepository).execute(followerId as string, followingId);
            res.status(200).json({ message: 'User unfollowed successfully' });
        } catch (error) {
            next(error);
        }
    }

    acceptFollow = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { followerId } = req.body;
            const followingId = req.params.id as string;
            await new AcceptFollowRequestUseCase(this.userRepository).execute(followerId as string, followingId);
            res.status(200).json({ message: 'Follow request accepted successfully' });
        } catch (error) {
            next(error);
        }
    }

    rejectFollow = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { followerId } = req.body;
            const followingId = req.params.id as string;
            await new RejectFollowRequestUseCase(this.userRepository).execute(followerId as string, followingId);
            res.status(200).json({ message: 'Follow request rejected successfully' });
        } catch (error) {
            next(error);
        }
    }

    emptyCart = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            await new EmptyCartUseCase(this.userRepository).execute(id);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    removeVendorFromCart = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const id = req.params.id as string;
            const vendorId = req.params.vendorId as string;
            await new RemoveVendorFromCartUseCase(this.userRepository).execute(id, vendorId);
            res.status(204).send();
        } catch (error) {
            next(error);
        }
    }

    search = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const query = req.query.q as string;
            if (!query) return res.json([]);
            const users = await new SearchUsersUseCase(this.userRepository).execute(query);
            res.json(users);
        } catch (error) {
            next(error);
        }
    }
}
