import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller';
import { PostgresTransactionRepository } from '../../repositories/pg-transaction.repository';
import { PostgresSaleRepository } from '../../repositories/pg-sale.repository';

const router = Router();
const transactionRepository = new PostgresTransactionRepository();
const saleRepository = new PostgresSaleRepository();
const controller = new TransactionController(transactionRepository, saleRepository);

router.post('/', controller.create);
router.get('/:id', controller.getById);
router.get('/buyer/:userId', controller.getByBuyer);
router.get('/seller/:userId', controller.getBySeller);
router.patch('/:id/status', controller.updateStatus);
router.get('/card/:cardId/history', controller.getPriceHistory);

export { router as transactionRouter };
