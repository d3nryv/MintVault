import { Router } from 'express';
import { CardController } from '../controllers/card.controller';
import { PostgresCardRepository, PostgresTransactionRepository } from '../../repositories';
import { TcgSdkRepository } from '../../repositories/tcg-sdk.repository';

const router = Router();
const cardRepository = new PostgresCardRepository();
const transactionRepository = new PostgresTransactionRepository();
const tcgRepository = new TcgSdkRepository();
const controller = new CardController(cardRepository, tcgRepository, transactionRepository);

router.get('/', controller.getAll);
router.get('/search', controller.getByName);
router.get('/search/:name', controller.getByName);
router.get('/:id', controller.getById);
router.get('/:id/market-value', controller.getMarketValue);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

export { router as cardRouter };
