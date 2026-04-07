import { CardEntity } from "../../domain/entities/card.entity";

export class CardMapper {

    static toEntity(row: any): CardEntity {
        if (!row) throw new Error('Card not found');
        
        return new CardEntity(
            row.id,
            row.owner_id || null,
            row.name,
            row.type,
            row.rarity,
            row.description || null,
            row.price,
            row.stock,
            row.source,
            row.language || null,
            row.is_for_sale || false,
            row.sale_id || null,
            row.acquired_at || null,
            row.created_at,
            row.updated_at,
            row.metadata || {}
        );
    }

    static toDatabase(card: Partial<CardEntity>): any {
        const dbFields: any = {};
        
        if (card.ownerId !== undefined) dbFields.owner_id = card.ownerId;
        if (card.name !== undefined) dbFields.name = card.name;
        if (card.type !== undefined) dbFields.type = card.type;
        if (card.rarity !== undefined) dbFields.rarity = card.rarity;
        if (card.description !== undefined) dbFields.description = card.description;
        if (card.price !== undefined) dbFields.price = card.price;
        if (card.stock !== undefined) dbFields.stock = card.stock;
        if (card.source !== undefined) dbFields.source = card.source;
        if (card.language !== undefined) dbFields.language = card.language;
        if (card.isForSale !== undefined) dbFields.is_for_sale = card.isForSale;
        if (card.saleId !== undefined) dbFields.sale_id = card.saleId;
        if (card.acquiredAt !== undefined) dbFields.acquired_at = card.acquiredAt;
        if (card.metadata !== undefined) dbFields.metadata = card.metadata;
        
        // Timestamps usually handled by SQL but we can map them if needed
        if (card.createdAt !== undefined) dbFields.created_at = card.createdAt;
        if (card.updatedAt !== undefined) dbFields.updated_at = card.updatedAt;
        
        return dbFields;
    }
}
