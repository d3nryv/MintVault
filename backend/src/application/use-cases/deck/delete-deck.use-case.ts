import { DeckRepository } from "../../../domain/repositories/deck.repository";

export class DeleteDeckUseCase {
    constructor(private readonly deckRepository: DeckRepository) {}

    async execute(id: string): Promise<void> {
        return await this.deckRepository.delete(id);
    }
}
