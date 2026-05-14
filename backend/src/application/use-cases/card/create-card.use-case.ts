import { CardEntity } from '../../../domain/entities/card.entity';
import { CardRepository } from '../../../domain/repositories/card.repository';
import { TcgRepository } from '../../../domain/repositories/tcg.repository';
import { CreateCardDto } from '../../dtos/card.dto';
import { CustomError } from '../../../domain/errors/custom.error';

export class CreateCardUseCase {
  constructor(
    private readonly cardRepository: CardRepository,
    private readonly tcgRepository: TcgRepository
  ) {}

  async execute(dto: CreateCardDto): Promise<CardEntity> {
    if (!dto || !dto.tcgId) {
      throw CustomError.badRequest('tcgId is required');
    }
    const tcgCard = await this.tcgRepository.getCardById(dto.tcgId);
    if (!tcgCard) {
      throw CustomError.notFound(`Card with TCG ID '${dto.tcgId}' not found in External SDK`);
    }

    const cardData: Omit<CardEntity, 'id' | 'createdAt' | 'updatedAt'> = {
        name: tcgCard.name,
        type: tcgCard.supertype,
        rarity: tcgCard.rarity || 'Common',
        price: dto.price ?? 0,
        stock: dto.stock ?? 1,
        source: tcgCard.set.name,
        description: `Set: ${tcgCard.set.name} (${tcgCard.set.series})`,
        ownerId: dto.ownerId ?? null,
        language: dto.language ?? 'English',
        isForSale: dto.isForSale ?? false,
        saleId: null,
        acquiredAt: new Date().toISOString(),
        metadata: {
            tcg_id: tcgCard.id,
            hp: tcgCard.hp,
            types: tcgCard.types,
            subtypes: tcgCard.subtypes,
            abilities: tcgCard.abilities,
            attacks: tcgCard.attacks,
            weaknesses: tcgCard.weaknesses,
            resistances: tcgCard.resistances,
            retreatCost: tcgCard.retreatCost,
            flavorText: tcgCard.flavorText,
            images: tcgCard.images,
            set: tcgCard.set
        },
        tcgId: tcgCard.id
    };

    return this.cardRepository.create(cardData);
  }
}
