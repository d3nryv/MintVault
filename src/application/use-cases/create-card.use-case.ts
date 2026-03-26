import { CardEntity } from '../../domain/entities/card.entity';
import { CardRepository } from '../../domain/repositories/card.repository';
import { CreateCardDto } from '../dtos/card.dto';

export class CreateCardUseCase {
  constructor(private readonly cardRepository: CardRepository) {}

  async execute(dto: CreateCardDto): Promise<CardEntity> {
    return this.cardRepository.create(dto);
  }
}
