import { Router } from 'express';
import { PostgresAlbumRepository, PostgresCardRepository, PostgresPageRepository, PostgresUserRepository } from '../../repositories';
import { AlbumController } from '../controllers/album.controller';

const router = Router();
const albumRepository = new PostgresAlbumRepository();
const cardRepository = new PostgresCardRepository();
const pageRepository = new PostgresPageRepository();
const userRepository = new PostgresUserRepository();
const controller = new AlbumController(albumRepository, cardRepository, pageRepository, userRepository);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
router.post('/move-card', controller.moveCard);

export const albumRouter = router;
