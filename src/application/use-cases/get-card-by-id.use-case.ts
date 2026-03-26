import { CardEntity } from '../../domain/entities/card.entity';
import { CardRepository } from '../../domain/repositories/card.repository';
import { CustomError } from '../../domain/errors/custom.error';

export class GetCardByIdUseCase {
  constructor(private readonly cardRepository: CardRepository) {}

  async execute(id: string): Promise<CardEntity> {
    const card = await this.cardRepository.findById(id);
    if (!card) throw CustomError.notFound(`Card with id '${id}' not found`);
    return card;
  }
}
