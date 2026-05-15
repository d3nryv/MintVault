import { TransactionEntity, TransactionStatus } from "../entities/transaction.entity";
import { DbClient } from "../interfaces/db-client.interface";

export interface MarketValueData {
    globalAverage: number;
    byCondition: { [condition: string]: number };
}

export interface TransactionRepository {
    create(transaction: Omit<TransactionEntity, 'id' | 'createdAt' | 'updatedAt'>, dbClient?: DbClient): Promise<TransactionEntity>;
    findById(id: string): Promise<TransactionEntity | null>;
    findAllByBuyer(buyerId: string): Promise<TransactionEntity[]>;
    findAllBySeller(sellerId: string): Promise<TransactionEntity[]>;
    updateStatus(id: string, status: TransactionStatus, dbClient?: DbClient): Promise<TransactionEntity>;
    getMarketValue(cardId: string): Promise<MarketValueData | null>;
    getMostPurchasedSets(limit: number, language?: string): Promise<any[]>;
    getMostPurchasedCards(limit: number, language?: string): Promise<any[]>;
    getMarketTrends(language?: string): Promise<{ rising: any[], falling: any[] }>;
    getPriceHistory(cardId: string): Promise<any[]>;
    getSellerStats(sellerId: string): Promise<{ salesCount: number, successRate: number }>;
}
