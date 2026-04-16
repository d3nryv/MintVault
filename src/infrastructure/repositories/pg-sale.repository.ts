import { db } from "../database/postgres/database";
import { SaleEntity } from "../../domain/entities/sale.entity";
import { SaleRepository } from "../../domain/repositories/sale.repository";
import { SaleMapper } from "../mappers/sale.mapper";
import { DbClient } from "../../domain/interfaces/db-client.interface";

export class PostgresSaleRepository implements SaleRepository {

    async create(sale: Omit<SaleEntity, 'id' | 'createdAt' | 'updatedAt'>, dbClient?: DbClient): Promise<SaleEntity> {
        const connection = dbClient || db;
        const dbData = SaleMapper.toDatabase(sale);
        const keys = Object.keys(dbData);
        const values = Object.values(dbData);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        
        const query = `
            INSERT INTO sales (${keys.join(', ')}) 
            VALUES (${placeholders}) 
            RETURNING *`;
        
        const { rows } = await connection.query(query, values);
        return SaleMapper.toEntity(rows[0]);
    }

    async findById(id: string): Promise<SaleEntity | null> {
        const query = 'SELECT * FROM sales WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        
        if (rows.length === 0) return null;
        return SaleMapper.toEntity(rows[0]);
    }

    async findAll(): Promise<SaleEntity[]> {
        const query = 'SELECT * FROM sales ORDER BY created_at DESC';
        const { rows } = await db.query(query);
        return rows.map(row => SaleMapper.toEntity(row));
    }

    async findAllBySeller(sellerId: string): Promise<SaleEntity[]> {
        const query = 'SELECT * FROM sales WHERE seller_id = $1 ORDER BY created_at DESC';
        const { rows } = await db.query(query, [sellerId]);
        return rows.map(row => SaleMapper.toEntity(row));
    }

    async update(id: string, sale: Partial<SaleEntity>, dbClient?: DbClient): Promise<SaleEntity> {
        const connection = dbClient || db;
        const dbData = SaleMapper.toDatabase(sale);
        const keys = Object.keys(dbData);
        const values = Object.values(dbData);
        
        if (keys.length === 0) {
            const existing = await this.findById(id);
            if (!existing) throw new Error('Sale not found');
            return existing;
        }

        const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
        const query = `UPDATE sales SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`;
        
        const { rows } = await connection.query(query, [id, ...values]);
        if (rows.length === 0) throw new Error('Sale not found');
        return SaleMapper.toEntity(rows[0]);
    }

    async delete(id: string, dbClient?: DbClient): Promise<void> {
        const connection = dbClient || db;
        const query = 'DELETE FROM sales WHERE id = $1';
        await connection.query(query, [id]);
    }
}
