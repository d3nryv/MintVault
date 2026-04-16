import { TransactionEntity, TransactionStatus } from "../entities/transaction.entity";
import { DbClient } from "../interfaces/db-client.interface";

export interface TransactionRepository {
    create(transaction: Omit<TransactionEntity, 'id' | 'createdAt' | 'updatedAt'>, dbClient?: DbClient): Promise<TransactionEntity>;
    findById(id: string): Promise<TransactionEntity | null>;
    findAllByBuyer(buyerId: string): Promise<TransactionEntity[]>;
    findAllBySeller(sellerId: string): Promise<TransactionEntity[]>;
    updateStatus(id: string, status: TransactionStatus, dbClient?: DbClient): Promise<TransactionEntity>;
}
