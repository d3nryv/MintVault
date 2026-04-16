import { UserRepository } from "../../../domain/repositories/user.repository";
import { CustomError } from "../../../domain/errors/custom.error";

export class ToggleFavoritePokemonUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string, pokemonName: string): Promise<string[]> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw CustomError.notFound('User not found');

    let favorites = [...(user.favouritePokemon || [])];
    const index = favorites.indexOf(pokemonName);

    if (index > -1) {
      // Remove from favorites
      favorites.splice(index, 1);
    } else {
      // Add to favorites
      favorites.push(pokemonName);
    }

    await this.userRepository.update(userId, {
      favouritePokemon: favorites
    });

    return favorites;
  }
}
