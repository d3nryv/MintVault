import { SaleEntity, SaleStatus } from "../../domain/entities/sale.entity";

export class SaleMapper {
    static toEntity(row: any): SaleEntity {
        if (!row) throw new Error('Sale not found');

        return new SaleEntity(
            row.id,
            row.card_id,
            row.seller_id,
            Number(row.amount),
            Number(row.price),
            row.language,
            row.condition,
            row.observations,
            row.image_url,
            row.extras || {},
            row.status as SaleStatus,
            row.created_at,
            row.updated_at
        );
    }

    static toDatabase(sale: Partial<SaleEntity>): any {
        const dbFields: any = {};

        if (sale.cardId !== undefined) dbFields.card_id = sale.cardId;
        if (sale.sellerId !== undefined) dbFields.seller_id = sale.sellerId;
        if (sale.amount !== undefined) dbFields.amount = sale.amount;
        if (sale.price !== undefined) dbFields.price = sale.price;
        if (sale.language !== undefined) dbFields.language = sale.language;
        if (sale.condition !== undefined) dbFields.condition = sale.condition;
        if (sale.observations !== undefined) dbFields.observations = sale.observations;
        if (sale.imageUrl !== undefined) dbFields.image_url = sale.imageUrl;
        if (sale.extras !== undefined) dbFields.extras = JSON.stringify(sale.extras);
        if (sale.status !== undefined) dbFields.status = sale.status;

        return dbFields;
    }
}
