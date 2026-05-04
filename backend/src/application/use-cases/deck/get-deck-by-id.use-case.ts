import { DeckEntity } from "../../../domain/entities/deck.entity";
import { DeckRepository } from "../../../domain/repositories/deck.repository";

export class GetDeckByIdUseCase {
    constructor(private readonly deckRepository: DeckRepository) {}

    async execute(id: string): Promise<DeckEntity | null> {
        return await this.deckRepository.findById(id);
    }
}
