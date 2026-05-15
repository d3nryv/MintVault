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
                AVG(t.total_price / NULLIF(t.quantity, 0)) as avg_price
            FROM transactions t
            JOIN sales s ON t.sale_id = s.id
            WHERE s.card_id = $1 AND t.status = 'completed'
            GROUP BY s.condition
        `;

        const globalQuery = `
            SELECT AVG(t.total_price / NULLIF(t.quantity, 0)) as global_avg
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

    async getMostPurchasedSets(limit: number, language?: string): Promise<any[]> {
        const query = `
            SELECT 
                c.metadata->'set'->>'name' as name,
                COUNT(*) as sales,
                c.metadata->'set'->>'series' as series
            FROM transactions t
            JOIN sales s ON t.sale_id = s.id
            JOIN cards c ON s.card_id = c.id
            WHERE t.status = 'completed'
            ${language ? 'AND s.language = $2' : ''}
            GROUP BY c.metadata->'set'->>'name', c.metadata->'set'->>'series'
            ORDER BY sales DESC
            LIMIT $1
        `;
        const params = language ? [limit, language] : [limit];
        const { rows } = await db.query(query, params);
        return rows;
    }

    async getMostPurchasedCards(limit: number, language?: string): Promise<any[]> {
        const query = `
            SELECT 
                c.id as id,
                c.name as name,
                c.metadata->'set'->>'name' as "cardSet",
                c.metadata->'images'->>'small' as image,
                COUNT(*) as sales,
                (SELECT MIN(price) FROM sales WHERE card_id = s.card_id AND amount > 0 ${language ? 'AND language = $2' : ''}) as "minPrice"
            FROM transactions t
            JOIN sales s ON t.sale_id = s.id
            JOIN cards c ON s.card_id = c.id
            WHERE t.status = 'completed'
            ${language ? 'AND s.language = $2' : ''}
            GROUP BY c.id, c.name, c.metadata->'set'->>'name', c.metadata->'images'->>'small', s.card_id
            ORDER BY sales DESC
            LIMIT $1
        `;
        const params = language ? [limit, language] : [limit];
        const { rows } = await db.query(query, params);
        return rows;
    }

    async getMarketTrends(language?: string): Promise<{ rising: any[], falling: any[] }> {
        const trendsQuery = `
            WITH recent_stats AS (
                SELECT 
                    c.id as card_id,
                    c.name as card_name,
                    c.metadata->'images'->>'small' as card_image,
                    c.metadata->'set'->>'name' as card_set,
                    AVG(CASE WHEN t.created_at >= NOW() - INTERVAL '7 days' THEN t.total_price / NULLIF(t.quantity, 0) END) as current_avg,
                    AVG(CASE WHEN t.created_at < NOW() - INTERVAL '7 days' AND t.created_at >= NOW() - INTERVAL '14 days' THEN t.total_price / NULLIF(t.quantity, 0) END) as previous_avg
                FROM transactions t
                JOIN sales s ON t.sale_id = s.id
                JOIN cards c ON s.card_id = c.id
                WHERE t.status = 'completed'
                ${language ? 'AND s.language = $1' : ''}
                GROUP BY c.id, c.name, c.metadata->'images'->>'small', c.metadata->'set'->>'name'
            )
            SELECT *, 
                   ((current_avg - previous_avg) / NULLIF(previous_avg, 0) * 100) as change_percent,
                   (SELECT MIN(price) FROM sales WHERE card_id = recent_stats.card_id AND amount > 0 ${language ? 'AND language = $1' : ''}) as "minPrice"
            FROM recent_stats
            WHERE previous_avg IS NOT NULL AND current_avg IS NOT NULL
        `;

        const params = language ? [language] : [];
        const { rows } = await db.query(trendsQuery, params);

        const rising = rows
            .filter(r => parseFloat(r.change_percent) > 0)
            .sort((a, b) => b.change_percent - a.change_percent)
            .slice(0, 5);

        const falling = rows
            .filter(r => parseFloat(r.change_percent) < 0)
            .sort((a, b) => a.change_percent - b.change_percent)
            .slice(0, 5);

        return { rising, falling };
    }

    async getPriceHistory(cardId: string): Promise<any[]> {
        const query = `
            SELECT 
                TO_CHAR(t.created_at, 'YYYY-MM-DD') as date,
                AVG(t.total_price / NULLIF(t.quantity, 0)) as price,
                SUM(t.quantity) as sales
            FROM transactions t
            JOIN sales s ON t.sale_id = s.id
            WHERE s.card_id = $1 AND t.status = 'completed'
            GROUP BY TO_CHAR(t.created_at, 'YYYY-MM-DD')
            ORDER BY date ASC
        `;
        const { rows } = await db.query(query, [cardId]);
        return rows.map(row => ({
            date: row.date,
            price: parseFloat(row.price),
            sales: parseInt(row.sales)
        }));
    }

    async getSellerStats(sellerId: string): Promise<{ salesCount: number, successRate: number }> {
        const query = `
            SELECT 
                COUNT(*) as total_sales,
                COUNT(*) FILTER (WHERE reported_undelivered = TRUE) as undelivered_count
            FROM transactions
            WHERE seller_id = $1 AND status IN ('shipped', 'completed')
        `;
        const { rows } = await db.query(query, [sellerId]);
        
        if (rows.length === 0) return { salesCount: 0, successRate: 100 };
        
        const totalSales = parseInt(rows[0].total_sales);
        const undeliveredCount = parseInt(rows[0].undelivered_count);
        
        const successRate = totalSales > 0 
            ? ((totalSales - undeliveredCount) / totalSales) * 100 
            : 100;
            
        return {
            salesCount: totalSales,
            successRate: Math.round(successRate)
        };
    }
}
