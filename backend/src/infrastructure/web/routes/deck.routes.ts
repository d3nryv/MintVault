import { Router } from 'express';
import { DeckController } from '../controllers/deck.controller';
import { PostgresDeckRepository, PostgresUserRepository } from '../../repositories';

const router = Router();
const deckRepository = new PostgresDeckRepository();
const userRepository = new PostgresUserRepository();
const controller = new DeckController(deckRepository, userRepository);

router.get('/owner/:ownerId', controller.getByOwner);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export { router as deckRouter };
