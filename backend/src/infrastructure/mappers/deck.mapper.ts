import { DeckEntity } from "../../domain/entities/deck.entity";

export class DeckMapper {
    static toEntity(row: any): DeckEntity {
        if (!row) throw new Error('Deck not found');
        return new DeckEntity(
            row.id,
            row.owner_id,
            row.name,
            row.cards || [],
            row.created_at,
            row.updated_at,
            row.strategy
        );
    }

    static toDatabase(deck: Partial<DeckEntity>): any {
        const dbFields: any = {};
        if (deck.id !== undefined) dbFields.id = deck.id;
        if (deck.ownerId !== undefined) dbFields.owner_id = deck.ownerId;
        if (deck.name !== undefined) dbFields.name = deck.name;
        if (deck.cards !== undefined) dbFields.cards = JSON.stringify(deck.cards);
        if (deck.strategy !== undefined) dbFields.strategy = deck.strategy;
        if (deck.createdAt !== undefined) dbFields.created_at = deck.createdAt;
        if (deck.updatedAt !== undefined) dbFields.updated_at = deck.updatedAt;
        return dbFields;
    }
}
