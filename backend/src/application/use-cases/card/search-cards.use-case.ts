import { TcgRepository, TcgPlayerInfo } from "../../../domain/repositories/tcg.repository";
import { SaleRepository } from "../../../domain/repositories/sale.repository";

export class SearchCardsUseCase {
    constructor(
        private tcgRepository: TcgRepository,
        private saleRepository: SaleRepository
    ) {}

    async execute(filters: { name?: string; set?: string; number?: string; language?: string }): Promise<any[]> {
        const tcgCards = await this.tcgRepository.searchCards(filters);
        
        if (tcgCards.length === 0) return [];

        const tcgIds = tcgCards.map(c => c.id);
        const lowestPrices = await this.saleRepository.findLowestPricesByTcgIds(tcgIds, filters.language);

        return tcgCards.map(card => ({
            ...card,
            price: lowestPrices[card.id] || null
        }));
    }
}
