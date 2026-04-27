import { Router } from 'express';
import { PokedexController } from '../controllers/pokemon.controller';
import { PostgresPokemonRepository } from '../../repositories/pg-pokemon.repository';
import { PostgresUserRepository } from '../../repositories/pg-user.repository';
import { PokeApiService } from '../../services/pokeapi.service';

const router = Router();
const repository = new PostgresPokemonRepository();
const userRepository = new PostgresUserRepository();
const pokeApiService = new PokeApiService();
const controller = new PokedexController(repository, pokeApiService, userRepository);

router.get('/', controller.list);
router.get('/all', controller.getAll);
router.get('/:nameOrId', controller.getDetails);
router.post('/favorite', controller.toggleFavorite);

export { router as pokedexRouter };
