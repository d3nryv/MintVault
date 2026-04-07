import { Router } from 'express';
import { CardController } from '../controllers/card.controller';
import { PostgresCardRepository } from '../../repositories';

const router = Router();
const controller = new CardController(new PostgresCardRepository());

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export { router as cardRouter };
