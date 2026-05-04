import { DeckEntity } from "../../../domain/entities/deck.entity";
import { DeckRepository } from "../../../domain/repositories/deck.repository";

export class GetDecksByOwnerUseCase {
    constructor(private readonly deckRepository: DeckRepository) {}

    async execute(ownerId: string): Promise<DeckEntity[]> {
        return await this.deckRepository.findByOwner(ownerId);
    }
}
