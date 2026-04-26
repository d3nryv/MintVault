import { db } from "../database/postgres/database";
import { AlbumEntity } from "../../domain/entities/album.entity";
import { AlbumRepository } from "../../domain/repositories/album.repository";
import { AlbumMapper } from "../mappers/album.mapper";

export class PostgresAlbumRepository implements AlbumRepository {

    async findAll(): Promise<AlbumEntity[]> {
        const query = `
            SELECT a.*, COALESCE(array_agg(p.id) FILTER (WHERE p.id IS NOT NULL), '{}') as pages 
            FROM albums a 
            LEFT JOIN pages p ON a.id = p.album_id 
            GROUP BY a.id`;
        const { rows } = await db.query(query);
        return rows.map(row => AlbumMapper.toEntity(row));
    }

    async findById(id: string): Promise<AlbumEntity | null> {
        const query = `
            SELECT a.*, COALESCE(array_agg(p.id) FILTER (WHERE p.id IS NOT NULL), '{}') as pages 
            FROM albums a 
            LEFT JOIN pages p ON a.id = p.album_id 
            WHERE a.id = $1 
            GROUP BY a.id`;
        const { rows } = await db.query(query, [id]);
        
        if (rows.length === 0) return null;
        return AlbumMapper.toEntity(rows[0]);
    }

    async create(album: Omit<AlbumEntity, 'id' | 'createdAt' | 'updatedAt' | 'pages'>): Promise<AlbumEntity> {
        const dbData = AlbumMapper.toDatabase(album);
        const keys = Object.keys(dbData);
        const values = Object.values(dbData);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        
        const query = `
            INSERT INTO albums (${keys.join(', ')}) 
            VALUES (${placeholders}) 
            RETURNING *`;
        
        const { rows } = await db.query(query, values);
        return AlbumMapper.toEntity(rows[0]);
    }

    async update(id: string, album: Partial<AlbumEntity>): Promise<AlbumEntity> {
        const dbData = AlbumMapper.toDatabase(album);
        const keys = Object.keys(dbData);
        const values = Object.values(dbData);
        
        if (keys.length === 0) {
            const existing = await this.findById(id);
            if (!existing) throw new Error('Album not found');
            return existing;
        }

        const setClause = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
        const query = `UPDATE albums SET ${setClause} WHERE id = $1 RETURNING *`;
        
        const { rows } = await db.query(query, [id, ...values]);
        if (rows.length === 0) throw new Error('Album not found');
        return AlbumMapper.toEntity(rows[0]);
    }

    async delete(id: string): Promise<void> {
        const query = 'DELETE FROM albums WHERE id = $1';
        await db.query(query, [id]);
    }

    async findByOwner(ownerId: string): Promise<AlbumEntity[]> {
        const query = `
            SELECT a.*, COALESCE(array_agg(p.id) FILTER (WHERE p.id IS NOT NULL), '{}') as pages 
            FROM albums a 
            LEFT JOIN pages p ON a.id = p.album_id 
            WHERE a.owner_id = $1 
            GROUP BY a.id`;
        const { rows } = await db.query(query, [ownerId]);
        return rows.map(row => AlbumMapper.toEntity(row));
    }
}
