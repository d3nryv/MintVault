import { Router } from 'express';
import { SaleController } from '../controllers/sale.controller';
import { PostgresSaleRepository } from '../../repositories/pg-sale.repository';
import { PostgresCardRepository } from '../../repositories/pg-card.repository';

const router = Router();
const saleRepository = new PostgresSaleRepository();
const cardRepository = new PostgresCardRepository();
const controller = new SaleController(saleRepository, cardRepository);

router.get('/', controller.getAll);
router.post('/', controller.create);
router.get('/:id', controller.getById);
router.get('/user/:userId', controller.getBySeller);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export { router as saleRouter };
