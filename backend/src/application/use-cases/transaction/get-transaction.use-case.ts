import { TransactionEntity } from "../../../domain/entities/transaction.entity";
import { TransactionRepository } from "../../../domain/repositories/transaction.repository";
import { CustomError } from "../../../domain/errors/custom.error";

export class GetTransactionUseCase {
    constructor(private readonly transactionRepository: TransactionRepository) {}
  
    async execute(id: string): Promise<TransactionEntity> {
      const transaction = await this.transactionRepository.findById(id);
      if (!transaction) throw CustomError.notFound('Transaction not found');
      return transaction;
    }
}
