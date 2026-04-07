import { CardEntity } from '../../../domain/entities/card.entity';
import { CardRepository } from '../../../domain/repositories/card.repository';

export class GetCardByIdUseCase {
  constructor(private readonly cardRepository: CardRepository) {}

  async execute(id: string): Promise<CardEntity | null> {
    return this.cardRepository.findById(id);
  }
}
