import { Request, Response, NextFunction } from 'express';
import { PokemonRepository } from '../../../domain/repositories/pokemon.repository';
import { PokeApiService } from '../../../infrastructure/services/pokeapi.service';
import { UserRepository } from '../../../domain/repositories/user.repository';
import { 
  GetPokemonDetailsUseCase, 
  ListPokemonsUseCase,
  ToggleFavoritePokemonUseCase 
} from '../../../application/use-cases';

export class PokedexController {
  constructor(
    private readonly pokemonRepository: PokemonRepository,
    private readonly pokeApiService: PokeApiService,
    private readonly userRepository: UserRepository
  ) {}

  getDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { nameOrId } = req.params;
      if (!nameOrId) throw new Error('nameOrId is required');

      const pokemon = await new GetPokemonDetailsUseCase(
          this.pokemonRepository, 
          this.pokeApiService
      ).execute(String(nameOrId));
      res.json(pokemon);
    } catch (err) {
      next(err);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { offset, limit, source, search } = req.query;
      const pokemons = await new ListPokemonsUseCase(
          this.pokemonRepository, 
          this.pokeApiService
      ).execute({
        offset: offset ? Number(offset) : undefined,
        limit: limit ? Number(limit) : undefined,
        source: source as 'local' | 'external',
        search: search as string
      });
      res.json(pokemons);
    } catch (err) {
      next(err);
    }
  };

  toggleFavorite = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { pokemonName, userId } = req.body;
      if (!pokemonName || !userId) throw new Error('pokemonName and userId are required');

      const favorites = await new ToggleFavoritePokemonUseCase(this.userRepository)
        .execute(userId, pokemonName);
      
      res.json({ message: 'Favorites updated', favorites });
    } catch (err) {
      next(err);
    }
  };
}
