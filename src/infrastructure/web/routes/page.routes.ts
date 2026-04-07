import { Router } from 'express';
import { PostgresPageRepository } from '../../repositories';
import { PageController } from '../controllers/page.controller';

const router = Router();
const pageRepository = new PostgresPageRepository();
const controller = new PageController(pageRepository);

router.post('/', controller.create);
router.get('/album/:albumId', controller.getByAlbum);
router.delete('/:id', controller.delete);

export const pageRouter = router;
