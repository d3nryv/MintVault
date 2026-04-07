import { Router } from 'express';
import { CardController } from '../controllers/card.controller';
import { PostgresCardRepository } from '../../repositories';
import { TcgSdkRepository } from '../../repositories/tcg-sdk.repository';

const router = Router();
const cardRepository = new PostgresCardRepository();
const tcgRepository = new TcgSdkRepository();
const controller = new CardController(cardRepository, tcgRepository);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export { router as cardRouter };
