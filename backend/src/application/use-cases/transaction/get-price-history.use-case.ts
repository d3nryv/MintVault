import { TransactionRepository } from "../../../domain/repositories/transaction.repository";

export class GetPriceHistoryUseCase {
    constructor(private readonly transactionRepository: TransactionRepository) {}

    async execute(cardId: string): Promise<any[]> {
        return await this.transactionRepository.getPriceHistory(cardId);
    }
}
