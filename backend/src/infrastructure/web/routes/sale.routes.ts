import { Router } from 'express';
import { SaleController } from '../controllers/sale.controller';
import { PostgresSaleRepository, PostgresCardRepository, PostgresUserRepository, PostgresTransactionRepository } from '../../repositories';

const router = Router();
const saleRepository = new PostgresSaleRepository();
const cardRepository = new PostgresCardRepository();
const userRepository = new PostgresUserRepository();
const transactionRepository = new PostgresTransactionRepository();
const controller = new SaleController(saleRepository, cardRepository, userRepository, transactionRepository);

router.get('/', controller.getAll);
router.post('/', controller.create);
router.get('/:id', controller.getById);
router.get('/user/:userId', controller.getBySeller);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export { router as saleRouter };
