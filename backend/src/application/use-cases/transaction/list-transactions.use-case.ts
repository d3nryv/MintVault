import { TransactionEntity } from "../../../domain/entities/transaction.entity";
import { TransactionRepository } from "../../../domain/repositories/transaction.repository";

export class ListTransactionsUseCase {
    constructor(private readonly transactionRepository: TransactionRepository) {}
  
    async execute(userId: string, type: 'buyer' | 'seller'): Promise<TransactionEntity[]> {
      if (type === 'buyer') {
          return await this.transactionRepository.findAllByBuyer(userId);
      }
      return await this.transactionRepository.findAllBySeller(userId);
    }
}
