import { CardEntity } from '../../../domain/entities/card.entity';
import { CardRepository } from '../../../domain/repositories/card.repository';

export class GetAllCardsUseCase {
  constructor(private readonly cardRepository: CardRepository) {}

  async execute(): Promise<CardEntity[]> {
    return this.cardRepository.findAll();
  }
}
