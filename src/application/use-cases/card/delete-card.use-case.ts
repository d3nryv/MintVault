import { CardRepository } from '../../../domain/repositories/card.repository';

export class DeleteCardUseCase {
  constructor(private readonly cardRepository: CardRepository) {}

  async execute(id: string): Promise<void> {
    await this.cardRepository.delete(id);
  }
}
