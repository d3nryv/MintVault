import { Router } from 'express';
import { CardController } from '../controllers/card.controller';
import { CardRepositoryImpl } from '../../repositories/card.repository.impl';

const router = Router();
const controller = new CardController(new CardRepositoryImpl());

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export { router as cardRouter };
