import { CardEntity } from '../../../domain/entities/card.entity';
import { CardRepository } from '../../../domain/repositories/card.repository';
import { CustomError } from '../../../domain/errors/custom.error';
import { UpdateCardDto } from '../../dtos/card.dto';

export class UpdateCardUseCase {
  constructor(private readonly cardRepository: CardRepository) {}

  async execute(id: string, dto: UpdateCardDto): Promise<CardEntity> {
    const card = await this.cardRepository.findById(id);
    if (!card) throw CustomError.notFound(`Card with id '${id}' not found`);
    return this.cardRepository.update(id, dto);
  }
}
