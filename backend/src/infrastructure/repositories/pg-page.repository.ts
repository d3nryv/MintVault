import { db } from "../database/postgres/database";
import { PageEntity } from "../../domain/entities/page.entity";
import { PageRepository } from "../../domain/repositories/page.repository";
import { PageMapper } from "../mappers/page.mapper";

export class PostgresPageRepository implements PageRepository {

    async findByAlbum(albumId: string): Promise<PageEntity[]> {
        const query = 'SELECT * FROM pages WHERE album_id = $1 ORDER BY page_number ASC';
        const { rows } = await db.query(query, [albumId]);
        return rows.map(row => PageMapper.toEntity(row));
    }

    async findById(id: string): Promise<PageEntity | null> {
        const query = 'SELECT * FROM pages WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        
        if (rows.length === 0) return null;
        return PageMapper.toEntity(rows[0]);
    }

    async create(page: Omit<PageEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<PageEntity> {
        const dbData = PageMapper.toDatabase(page);
        const keys = Object.keys(dbData);
        const values = Object.values(dbData);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        
        const query = `
            INSERT INTO pages (${keys.join(', ')}) 
            VALUES (${placeholders}) 
            RETURNING *`;
        
        const { rows } = await db.query(query, values);
        return PageMapper.toEntity(rows[0]);
    }

    async update(id: string, page: Partial<PageEntity>): Promise<PageEntity> {
        const dbData = PageMapper.toDatabase(page);
        const keys = Object.keys(dbData);
        const values = Object.values(dbData);
        
        if (keys.length === 0) {
            const existing = await this.findById(id);
            if (!existing) throw new Error('Page not found');
            return existing;
        }

        const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
        const query = `UPDATE pages SET ${setClause} WHERE id = $1 RETURNING *`;
        
        const { rows } = await db.query(query, [id, ...values]);
        if (rows.length === 0) throw new Error('Page not found');
        return PageMapper.toEntity(rows[0]);
    }

    async delete(id: string): Promise<void> {
        const query = 'DELETE FROM pages WHERE id = $1';
        await db.query(query, [id]);
    }
}
