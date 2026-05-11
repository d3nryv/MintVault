import { TcgRepository, TcgPlayerInfo } from "../../../domain/repositories/tcg.repository";

export class SearchCardsUseCase {
    constructor(private tcgRepository: TcgRepository) {}

    async execute(filters: { name?: string; set?: string; number?: string }): Promise<TcgPlayerInfo[]> {
        return this.tcgRepository.searchCards(filters);
    }
}
