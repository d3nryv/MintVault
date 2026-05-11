import { TransactionRepository } from "../../../domain/repositories/transaction.repository";
import { SaleRepository } from "../../../domain/repositories/sale.repository";

export class GetMarketStatisticsUseCase {
    constructor(
        private transactionRepository: TransactionRepository,
        private saleRepository: SaleRepository
    ) {}

    async execute(language?: string) {
        const [mostPurchasedSets, mostPurchasedCards, trends, recentListings] = await Promise.all([
            this.transactionRepository.getMostPurchasedSets(8, language),
            this.transactionRepository.getMostPurchasedCards(8, language),
            this.transactionRepository.getMarketTrends(language),
            this.saleRepository.findRecent(10)
        ]);

        return {
            mostPurchasedSets,
            mostPurchasedCards,
            trends,
            recentListings
        };
    }
}
