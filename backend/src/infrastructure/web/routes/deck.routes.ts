import { Router } from 'express';
import { DeckController } from '../controllers/deck.controller';
import { PostgresDeckRepository } from '../../repositories';

const router = Router();
const deckRepository = new PostgresDeckRepository();
const controller = new DeckController(deckRepository);

router.get('/owner/:ownerId', controller.getByOwner);
router.post('/', controller.create);
router.put('/:id', controller.update);

export { router as deckRouter };
