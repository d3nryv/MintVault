import { TransactionRepository, MarketValueData } from "../../../domain/repositories/transaction.repository";
import { CardRepository } from "../../../domain/repositories/card.repository";
import { CustomError } from "../../../domain/errors/custom.error";

export class GetCardMarketValueUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly cardRepository: CardRepository
  ) {}

  async execute(cardId: string): Promise<MarketValueData | null> {
    // 1. Verify card exists (optional but good for error reporting)
    const card = await this.cardRepository.findById(cardId);
    if (!card) throw CustomError.notFound('Card not found');

    // 2. Get market value from repository
    return this.transactionRepository.getMarketValue(cardId);
  }
}
