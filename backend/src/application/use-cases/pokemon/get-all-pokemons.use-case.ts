import { PokeApiService } from "../../../infrastructure/services/pokeapi.service";

export class GetAllPokemonsUseCase {
  constructor(private readonly pokeApiService: PokeApiService) {}

  async execute() {
    // Fetching all 1025 released Pokémon names and IDs in one go
    // We use a large limit to get the full list as the frontend was doing
    const limit = 1025;
    const externalList = await this.pokeApiService.listPokemon(0, limit);
    
    return externalList.map((item, index) => {
      const id = index + 1;
      return {
        id,
        name: item.name.charAt(0).toUpperCase() + item.name.slice(1),
        number: id.toString().padStart(3, '0'),
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
      };
    });
  }
}
