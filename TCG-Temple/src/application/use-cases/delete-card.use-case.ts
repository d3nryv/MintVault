import { CardRepository } from '../../domain/repositories/card.repository';
import { CustomError } from '../../domain/errors/custom.error';

export class DeleteCardUseCase {
  constructor(private readonly cardRepository: CardRepository) {}

  async execute(id: string): Promise<void> {
    const card = await this.cardRepository.findById(id);
    if (!card) throw CustomError.notFound(`Card with id '${id}' not found`);
    await this.cardRepository.delete(id);
  }
}
