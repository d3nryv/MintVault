import { AlbumEntity } from "../../../domain/entities/album.entity";
import { AlbumRepository } from "../../../domain/repositories/album.repository";
import { CardRepository } from "../../../domain/repositories/card.repository";
import { UpdateAlbumDto } from "../../dtos/album.dto";
import { CustomError } from "../../../domain/errors/custom.error";

export class UpdateAlbumUseCase {
  constructor(
    private readonly albumRepository: AlbumRepository,
    private readonly cardRepository: CardRepository
  ) {}

  async execute(id: string, dto: UpdateAlbumDto): Promise<AlbumEntity> {
    const album = await this.albumRepository.findById(id);
    if (!album) throw CustomError.notFound('Album not found');

    let coverUrl = album.coverUrl;
    
    if (dto.coverCardId && dto.coverCardId !== album.coverCardId) {
        const card = await this.cardRepository.findById(dto.coverCardId);
        if (card && card.metadata && card.metadata.images) {
            coverUrl = card.metadata.images.large || card.metadata.images.small || null;
        }
    }

    const updatedAlbum: Partial<AlbumEntity> = {
        ...dto,
        coverUrl
    };

    return this.albumRepository.update(id, updatedAlbum);
  }
}
