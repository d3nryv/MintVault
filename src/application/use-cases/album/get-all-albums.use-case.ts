import { AlbumEntity } from "../../../domain/entities/album.entity";
import { AlbumRepository } from "../../../domain/repositories/album.repository";

export class GetAllAlbumsUseCase {
  constructor(private readonly albumRepository: AlbumRepository) {}

  async execute(): Promise<AlbumEntity[]> {
    return this.albumRepository.findAll();
  }
}
