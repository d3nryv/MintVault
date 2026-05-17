import { AlbumRepository } from "../../../domain/repositories/album.repository";
import { UserRepository } from "../../../domain/repositories/user.repository";

export class DeleteAlbumUseCase {
  constructor(
    private readonly albumRepository: AlbumRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(id: string): Promise<void> {
    try {
        const album = await this.albumRepository.findById(id);
        if (album) {
            const user = await this.userRepository.findById(album.ownerId);
            if (user) {
                const updatedAlbums = user.albums.filter(aid => aid !== id);
                await this.userRepository.update(user.id, { albums: updatedAlbums });
            }
        }
    } catch (err) {
        console.error("Failed to unsync album from user's albums array:", err);
    }
    return this.albumRepository.delete(id);
  }
}
