import { Request, Response, NextFunction } from 'express';
import { PokemonRepository } from '../../../domain/repositories/pokemon.repository';
import { PokeApiService } from '../../../infrastructure/services/pokeapi.service';
import { GetPokemonDetailsUseCase, ListPokemonsUseCase } from '../../../application/use-cases';

export class PokemonController {
  constructor(
    private readonly pokemonRepository: PokemonRepository,
    private readonly pokeApiService: PokeApiService
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
      const { offset, limit, source } = req.query;
      const pokemons = await new ListPokemonsUseCase(
          this.pokemonRepository, 
          this.pokeApiService
      ).execute({
        offset: offset ? Number(offset) : undefined,
        limit: limit ? Number(limit) : undefined,
        source: source as 'local' | 'external'
      });
      res.json(pokemons);
    } catch (err) {
      next(err);
    }
  };
}
