import { TransactionEntity, TransactionStatus } from "../entities/transaction.entity";

export interface TransactionRepository {
    create(transaction: Omit<TransactionEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<TransactionEntity>;
    findById(id: string): Promise<TransactionEntity | null>;
    findAllByBuyer(buyerId: string): Promise<TransactionEntity[]>;
    findAllBySeller(sellerId: string): Promise<TransactionEntity[]>;
    updateStatus(id: string, status: TransactionStatus): Promise<TransactionEntity>;
}
