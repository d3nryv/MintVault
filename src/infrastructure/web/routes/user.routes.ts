import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { PostgresUserRepository } from '../../repositories/pg-user.repository';

const router = Router();
const userRepository = new PostgresUserRepository();
const controller = new UserController(userRepository);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/login', controller.login);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export { router as userRouter };
