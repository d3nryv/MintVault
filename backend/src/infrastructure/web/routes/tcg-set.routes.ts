import { Router } from 'express';
import { TcgSetController } from '../controllers/tcg-set.controller';
import { PostgresTcgSetRepository } from '../../repositories/pg-tcg-set.repository';

const router = Router();
const repository = new PostgresTcgSetRepository();
const controller = new TcgSetController(repository);

router.get('/', controller.getAll);

export { router as tcgSetRouter };
