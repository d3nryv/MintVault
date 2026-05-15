import { TransactionEntity, TransactionStatus } from "../../domain/entities/transaction.entity";

export class TransactionMapper {
    static toEntity(row: any): TransactionEntity {
        if (!row) throw new Error('Transaction not found');

        return new TransactionEntity(
            row.id,
            row.sale_id,
            row.buyer_id,
            row.seller_id,
            Number(row.quantity),
            Number(row.total_price),
            row.status as TransactionStatus,
            row.payment_method,
            row.shipping_address,
            row.reported_undelivered,
            row.created_at,
            row.updated_at
        );
    }

    static toDatabase(transaction: Partial<TransactionEntity>): any {
        const dbFields: any = {};

        if (transaction.saleId !== undefined) dbFields.sale_id = transaction.saleId;
        if (transaction.buyerId !== undefined) dbFields.buyer_id = transaction.buyerId;
        if (transaction.sellerId !== undefined) dbFields.seller_id = transaction.sellerId;
        if (transaction.quantity !== undefined) dbFields.quantity = transaction.quantity;
        if (transaction.totalPrice !== undefined) dbFields.total_price = transaction.totalPrice;
        if (transaction.status !== undefined) dbFields.status = transaction.status;
        if (transaction.paymentMethod !== undefined) dbFields.payment_method = transaction.paymentMethod;
        if (transaction.shippingAddress !== undefined) dbFields.shipping_address = transaction.shippingAddress;
        if (transaction.reportedUndelivered !== undefined) dbFields.reported_undelivered = transaction.reportedUndelivered;

        return dbFields;
    }
}
