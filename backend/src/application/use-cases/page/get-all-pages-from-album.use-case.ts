import { PageEntity } from "../../../domain/entities/page.entity";
import { PageRepository } from "../../../domain/repositories/page.repository";

export class GetAllPagesFromAlbumUseCase {
  constructor(private readonly pageRepository: PageRepository) {}

  async execute(albumId: string): Promise<PageEntity[]> {
    return this.pageRepository.findByAlbum(albumId);
  }
}
