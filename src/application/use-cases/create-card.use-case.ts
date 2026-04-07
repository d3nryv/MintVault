import { CardEntity } from '../../domain/entities/card.entity';
import { CardRepository } from '../../domain/repositories/card.repository';
import { CreateCardDto } from '../dtos/card.dto';

export class CreateCardUseCase {
  constructor(private readonly cardRepository: CardRepository) {}

  async execute(dto: CreateCardDto): Promise<CardEntity> {
    const cardData: Omit<CardEntity, 'id' | 'createdAt' | 'updatedAt'> = {
        name: dto.name,
        type: dto.type,
        rarity: dto.rarity,
        price: dto.price,
        stock: dto.stock,
        source: dto.source,
        description: dto.description ?? null,
        ownerId: dto.ownerId ?? null,
        language: dto.language ?? null,
        isForSale: dto.isForSale ?? false,
        saleId: dto.saleId ?? null,
        acquiredAt: dto.acquiredAt ?? null,
        metadata: dto.metadata ?? null,
    };
    return this.cardRepository.create(cardData);
  }
}
