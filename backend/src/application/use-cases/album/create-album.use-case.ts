import { AlbumEntity } from "../../../domain/entities/album.entity";
import { AlbumRepository, CardRepository, PageRepository } from "../../../domain/repositories";
import { CreateAlbumDto } from "../../dtos/album.dto";
import { CustomError } from "../../../domain/errors/custom.error";

export class CreateAlbumUseCase {
  constructor(
    private readonly albumRepository: AlbumRepository,
    private readonly cardRepository: CardRepository,
    private readonly pageRepository: PageRepository
  ) {}

  async execute(dto: CreateAlbumDto): Promise<AlbumEntity> {
    let coverUrl: string | null = null;
    
    if (dto.coverCardId) {
        const card = await this.cardRepository.findById(dto.coverCardId);
        if (card && card.metadata && card.metadata.images) {
            coverUrl = card.metadata.images.large || card.metadata.images.small || null;
        }
    }

    const albumData: Omit<AlbumEntity, 'id' | 'createdAt' | 'updatedAt' | 'pages'> = {
        ownerId: dto.ownerId,
        name: dto.name,
        coverCardId: dto.coverCardId || null,
        coverUrl: coverUrl,
        height: dto.height || 3,
        width: dto.width || 3,
    };

    const album = await this.albumRepository.create(albumData);

    // 4. Crear páginas automáticamente llenando los slots SECUENCIALMENTE
    const cardsPerPage = album.height * album.width;
    const cards = dto.cards || [];
    const pagesNeeded = Math.max(1, Math.ceil(cards.length / cardsPerPage));

    for (let p = 0; p < pagesNeeded; p++) {
        const slots: Record<number, string> = {};
        
        // Coger las cartas de esta página
        const start = p * cardsPerPage;
        const end = Math.min(start + cardsPerPage, cards.length);
        
        for (let i = start; i < end; i++) {
            const slotIndex = i % cardsPerPage;
            slots[slotIndex] = cards[i];
        }

        await this.pageRepository.create({
            albumId: album.id,
            pageNumber: p + 1,
            slots: slots
        });
    }

    const finalAlbum = await this.albumRepository.findById(album.id);
    if (!finalAlbum) throw CustomError.internalServerError('Failed to retrieve created album');
    
    return finalAlbum;
  }
}
