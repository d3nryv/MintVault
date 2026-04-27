import { CardEntity } from '../../../domain/entities/card.entity';
import { CardRepository } from '../../../domain/repositories/card.repository';
import { TcgRepository } from '../../../domain/repositories/tcg.repository';

export class GetCardByIdUseCase {
  constructor(
    private readonly cardRepository: CardRepository,
    private readonly tcgRepository: TcgRepository
  ) {}

  async execute(id: string): Promise<CardEntity | null> {
    // 1. Intentar buscar en la base de datos local si el ID parece un UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isUuid) {
      const localCard = await this.cardRepository.findById(id);
      if (localCard) return localCard;
    }

    // 2. Si no está localmente, buscar en el SDK externo (datos puros de la carta)
    const tcgCard = await this.tcgRepository.getCardById(id);
    if (!tcgCard) return null;

    // 3. Devolver una "Entidad Virtual" de la carta (sin propietario ni precio)
    return new CardEntity(
        tcgCard.id, // Usamos el ID del TCG como ID identificador
        null,       // Sin dueño
        tcgCard.name,
        tcgCard.supertype,
        tcgCard.rarity || 'Common',
        `Set: ${tcgCard.set.name} (${tcgCard.set.series})`,
        0,          // Sin precio (0 es el valor por defecto)
        0,          // Sin stock (0 es el valor por defecto)
        'TCG_SDK',
        'English',
        false,      // No está a la venta por defecto
        null,
        null,
        new Date(), // Fecha de creación virtual (ahora)
        new Date(),
        {
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
        }
    );
  }
}
