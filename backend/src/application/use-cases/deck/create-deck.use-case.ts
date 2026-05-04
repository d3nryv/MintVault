import { DeckEntity, DeckItemEntity } from "../../../domain/entities/deck.entity";
import { DeckRepository } from "../../../domain/repositories/deck.repository";

export class CreateDeckUseCase {
    constructor(private readonly deckRepository: DeckRepository) {}

    async execute(data: { ownerId: string, name: string, cards: DeckItemEntity[], strategy?: string }): Promise<DeckEntity> {
        return await this.deckRepository.create({
            ownerId: data.ownerId,
            name: data.name,
            cards: data.cards,
            strategy: data.strategy
        });
    }
}
