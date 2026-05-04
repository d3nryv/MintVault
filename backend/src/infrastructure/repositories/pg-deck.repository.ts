import { db } from "../database/postgres/database";
import { DeckEntity } from "../../domain/entities/deck.entity";
import { DeckRepository } from "../../domain/repositories/deck.repository";
import { DeckMapper } from "../mappers/deck.mapper";

export class PostgresDeckRepository implements DeckRepository {

    async findAll(): Promise<DeckEntity[]> {
        const query = 'SELECT * FROM decks';
        const { rows } = await db.query(query);
        return rows.map(row => DeckMapper.toEntity(row));
    }

    async findById(id: string): Promise<DeckEntity | null> {
        const query = 'SELECT * FROM decks WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        
        if (rows.length === 0) return null;
        return DeckMapper.toEntity(rows[0]);
    }

    async findByOwner(ownerId: string): Promise<DeckEntity[]> {
        const query = 'SELECT * FROM decks WHERE owner_id = $1';
        const { rows } = await db.query(query, [ownerId]);
        return rows.map(row => DeckMapper.toEntity(row));
    }

    async create(deck: Omit<DeckEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<DeckEntity> {
        const dbData = DeckMapper.toDatabase(deck);
        const keys = Object.keys(dbData);
        const values = Object.values(dbData);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        
        const query = `
            INSERT INTO decks (${keys.join(', ')}) 
            VALUES (${placeholders}) 
            RETURNING *`;
        
        const { rows } = await db.query(query, values);
        return DeckMapper.toEntity(rows[0]);
    }

    async update(id: string, deck: Partial<DeckEntity>): Promise<DeckEntity> {
        const dbData = DeckMapper.toDatabase(deck);
        const keys = Object.keys(dbData);
        const values = Object.values(dbData);
        
        if (keys.length === 0) {
            const existing = await this.findById(id);
            if (!existing) throw new Error('Deck not found');
            return existing;
        }

        const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
        const query = `UPDATE decks SET ${setClause} WHERE id = $1 RETURNING *`;
        
        const { rows } = await db.query(query, [id, ...values]);
        if (rows.length === 0) throw new Error('Deck not found');
        return DeckMapper.toEntity(rows[0]);
    }

    async delete(id: string): Promise<void> {
        const query = 'DELETE FROM decks WHERE id = $1';
        await db.query(query, [id]);
    }
}
