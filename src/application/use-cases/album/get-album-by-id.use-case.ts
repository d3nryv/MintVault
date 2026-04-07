import { AlbumEntity } from "../../../domain/entities/album.entity";
import { AlbumRepository } from "../../../domain/repositories/album.repository";

export class GetAlbumByIdUseCase {
  constructor(private readonly albumRepository: AlbumRepository) {}

  async execute(id: string): Promise<AlbumEntity | null> {
    return this.albumRepository.findById(id);
  }
}
