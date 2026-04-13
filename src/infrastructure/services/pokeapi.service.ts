import { PokemonEntity } from "../../domain/entities/pokemon.entity";

export class PokeApiService {
  private readonly baseUrl = 'https://pokeapi.co/api/v2/pokemon';

  async fetchPokemon(nameOrId: string | number): Promise<PokemonEntity | null> {
    try {
      const response = await fetch(`${this.baseUrl}/${String(nameOrId).toLowerCase()}`);
      
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`External API error: ${response.statusText}`);
      }

      const data = await response.json();

      // Map PokéAPI response to our Domain Entity
      const stats: Record<string, number> = {};
      data.stats.forEach((s: any) => {
        stats[s.stat.name] = s.base_stat;
      });

      return PokemonEntity.create({
        id: data.id,
        name: data.name,
        types: data.types.map((t: any) => t.type.name),
        stats: stats,
        artworkUrl: data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default,
      });
    } catch (error) {
      console.error('Error fetching from PokéAPI:', error);
      throw error;
    }
  }

  async listPokemon(offset: number, limit: number): Promise<{ name: string; url: string }[]> {
    const response = await fetch(`${this.baseUrl}?offset=${offset}&limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch Pokémon list');
    const data = await response.json();
    return data.results;
  }
}
