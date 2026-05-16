import { db } from "../database/postgres/database";
import { CardEntity } from "../../domain/entities/card.entity";
import { CardRepository } from "../../domain/repositories/card.repository";
import { CardMapper } from "../mappers/card.mapper";

export class PostgresCardRepository implements CardRepository {

    async findAll(): Promise<CardEntity[]> {
        const query = 'SELECT * FROM cards';
        const { rows } = await db.query(query);
        return rows.map(row => CardMapper.toEntity(row));
    }

    async findByName(name: string): Promise<CardEntity[]> {
        const query = 'SELECT * FROM cards WHERE name ILIKE $1';
        const { rows } = await db.query(query, [`%${name}%`]);
        return rows.map(row => CardMapper.toEntity(row));
    }

    async findById(id: string): Promise<CardEntity | null> {
        const query = 'SELECT * FROM cards WHERE id = $1';
        const { rows } = await db.query(query, [id]);

        if (rows.length === 0) return null;
        return CardMapper.toEntity(rows[0]);
    }

    async create(card: Omit<CardEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<CardEntity> {
        const dbData = CardMapper.toDatabase(card);
        const keys = Object.keys(dbData);
        const values = Object.values(dbData);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

        const query = `
            INSERT INTO cards (${keys.join(', ')}) 
            VALUES (${placeholders}) 
            RETURNING *`;

        const { rows } = await db.query(query, values);
        return CardMapper.toEntity(rows[0]);
    }

    async update(id: string, card: Partial<CardEntity>): Promise<CardEntity> {
        const dbData = CardMapper.toDatabase(card);
        const keys = Object.keys(dbData);
        const values = Object.values(dbData);

        if (keys.length === 0) {
            const existing = await this.findById(id);
            if (!existing) throw new Error('Card not found');
            return existing;
        }

        const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
        const query = `UPDATE cards SET ${setClause} WHERE id = $1 RETURNING *`;

        const { rows } = await db.query(query, [id, ...values]);
        if (rows.length === 0) throw new Error('Card not found');
        return CardMapper.toEntity(rows[0]);
    }

    async delete(id: string): Promise<void> {
        const query = 'DELETE FROM cards WHERE id = $1';
        await db.query(query, [id]);
    }
}
