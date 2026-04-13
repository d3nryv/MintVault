import { Router } from 'express';
import { PokemonController } from '../controllers/pokemon.controller';
import { PostgresPokemonRepository } from '../../repositories/pg-pokemon.repository';
import { PokeApiService } from '../../services/pokeapi.service';

const router = Router();
const repository = new PostgresPokemonRepository();
const pokeApiService = new PokeApiService();
const controller = new PokemonController(repository, pokeApiService);

router.get('/', controller.list);
router.get('/:nameOrId', controller.getDetails);

export { router as pokemonRouter };
