import { DeckEntity, DeckItemEntity } from "../../../domain/entities/deck.entity";
import { DeckRepository } from "../../../domain/repositories/deck.repository";
import { UserRepository } from "../../../domain/repositories/user.repository";

export class CreateDeckUseCase {
    constructor(
        private readonly deckRepository: DeckRepository,
        private readonly userRepository: UserRepository
    ) {}

    async execute(data: { ownerId: string, name: string, cards: DeckItemEntity[], strategy?: string }): Promise<DeckEntity> {
        const deck = await this.deckRepository.create({
            ownerId: data.ownerId,
            name: data.name,
            cards: data.cards,
            strategy: data.strategy
        });

        // Actualizar la lista de ownedDecks del usuario
        const user = await this.userRepository.findById(data.ownerId);
        if (user) {
            const ownedDecks = user.ownedDecks || [];
            if (!ownedDecks.includes(deck.id)) {
                await this.userRepository.update(data.ownerId, {
                    ownedDecks: [...ownedDecks, deck.id]
                });
            }
        }

        return deck;
    }
}
