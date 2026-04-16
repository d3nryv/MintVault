import { db } from "../database/postgres/database";
import { TransactionEntity, TransactionStatus } from "../../domain/entities/transaction.entity";
import { TransactionRepository, MarketValueData } from "../../domain/repositories/transaction.repository";
import { TransactionMapper } from "../mappers/transaction.mapper";
import { DbClient } from "../../domain/interfaces/db-client.interface";

export class PostgresTransactionRepository implements TransactionRepository {

    async create(transaction: Omit<TransactionEntity, 'id' | 'createdAt' | 'updatedAt'>, dbClient?: DbClient): Promise<TransactionEntity> {
        const connection = dbClient || db;
        const dbData = TransactionMapper.toDatabase(transaction);
        const keys = Object.keys(dbData);
        const values = Object.values(dbData);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        
        const query = `
            INSERT INTO transactions (${keys.join(', ')}) 
            VALUES (${placeholders}) 
            RETURNING *`;
        
        const { rows } = await connection.query(query, values);
        return TransactionMapper.toEntity(rows[0]);
    }

    async findById(id: string): Promise<TransactionEntity | null> {
        const query = 'SELECT * FROM transactions WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        
        if (rows.length === 0) return null;
        return TransactionMapper.toEntity(rows[0]);
    }

    async findAllByBuyer(buyerId: string): Promise<TransactionEntity[]> {
        const query = 'SELECT * FROM transactions WHERE buyer_id = $1 ORDER BY created_at DESC';
        const { rows } = await db.query(query, [buyerId]);
        return rows.map(row => TransactionMapper.toEntity(row));
    }

    async findAllBySeller(sellerId: string): Promise<TransactionEntity[]> {
        const query = 'SELECT * FROM transactions WHERE seller_id = $1 ORDER BY created_at DESC';
        const { rows } = await db.query(query, [sellerId]);
        return rows.map(row => TransactionMapper.toEntity(row));
    }

    async updateStatus(id: string, status: TransactionStatus, dbClient?: DbClient): Promise<TransactionEntity> {
        const connection = dbClient || db;
        const query = `
            UPDATE transactions 
            SET status = $2, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $1 
            RETURNING *`;
        
        const { rows } = await connection.query(query, [id, status]);
        if (rows.length === 0) throw new Error('Transaction not found');
        return TransactionMapper.toEntity(rows[0]);
    }

    async getMarketValue(cardId: string): Promise<MarketValueData | null> {
        const conditionQuery = `
            SELECT 
                s.condition, 
                AVG(t.total_price / t.quantity) as avg_price
            FROM transactions t
            JOIN sales s ON t.sale_id = s.id
            WHERE s.card_id = $1 AND t.status = 'completed'
            GROUP BY s.condition
        `;

        const globalQuery = `
            SELECT AVG(t.total_price / t.quantity) as global_avg
            FROM transactions t
            JOIN sales s ON t.sale_id = s.id
            WHERE s.card_id = $1 AND t.status = 'completed'
        `;

        const [conditionResult, globalResult] = await Promise.all([
            db.query(conditionQuery, [cardId]),
            db.query(globalQuery, [cardId])
        ]);

        if (conditionResult.rows.length === 0) return null;

        const byCondition: { [condition: string]: number } = {};
        conditionResult.rows.forEach(row => {
            byCondition[row.condition] = parseFloat(row.avg_price);
        });

        const globalAverage = parseFloat(globalResult.rows[0].global_avg);

        return {
            globalAverage,
            byCondition
        };
    }
}
