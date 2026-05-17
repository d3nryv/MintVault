import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { PostgresUserRepository } from '../../repositories/pg-user.repository';

const router = Router();
const userRepository = new PostgresUserRepository();
const controller = new UserController(userRepository);

router.get('/', controller.getAll);
router.get('/search', controller.search);
router.get('/:id', controller.getById);
router.post('/login', controller.login);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
router.post('/:id/follow', controller.follow);
router.post('/:id/unfollow', controller.unfollow);
router.post('/:id/accept-follow', controller.acceptFollow);
router.post('/:id/reject-follow', controller.rejectFollow);
router.delete('/:id/cart', controller.emptyCart);
router.delete('/:id/cart/vendor/:vendorId', controller.removeVendorFromCart);

export { router as userRouter };
