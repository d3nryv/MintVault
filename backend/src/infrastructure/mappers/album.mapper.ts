import { AlbumEntity } from "../../domain/entities/album.entity";

export class AlbumMapper {

    static toEntity(row: any): AlbumEntity {
        if (!row) throw new Error('Album not found');
        
        return new AlbumEntity(
            row.id,
            row.owner_id,
            row.name,
            row.cover_card_id || null,
            row.cover_url || null,
            row.height || 3,
            row.width || 3,
            row.pages || [],
            row.created_at,
            row.updated_at
        );
    }

    static toDatabase(album: Partial<AlbumEntity>): any {
        const dbFields: any = {};
        
        if (album.id !== undefined) dbFields.id = album.id;
        if (album.ownerId !== undefined) dbFields.owner_id = album.ownerId;
        if (album.name !== undefined) dbFields.name = album.name;
        if (album.coverCardId !== undefined) dbFields.cover_card_id = album.coverCardId;
        if (album.coverUrl !== undefined) dbFields.cover_url = album.coverUrl;
        if (album.height !== undefined) dbFields.height = album.height;
        if (album.width !== undefined) dbFields.width = album.width;
        
        return dbFields;
    }
}
