import { DeckEntity, DeckItemEntity } from "../../../domain/entities/deck.entity";
import { DeckRepository } from "../../../domain/repositories/deck.repository";

export class UpdateDeckUseCase {
    constructor(private readonly deckRepository: DeckRepository) {}

    async execute(id: string, data: { name?: string, cards?: DeckItemEntity[], strategy?: string }): Promise<DeckEntity> {
        return await this.deckRepository.update(id, data);
    }
}
