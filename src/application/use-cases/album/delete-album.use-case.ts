import { AlbumRepository } from "../../../domain/repositories/album.repository";

export class DeleteAlbumUseCase {
  constructor(private readonly albumRepository: AlbumRepository) {}

  async execute(id: string): Promise<void> {
    return this.albumRepository.delete(id);
  }
}
