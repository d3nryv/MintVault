import { PageEntity } from "../../domain/entities/page.entity";

export class PageMapper {

    static toEntity(row: any): PageEntity {
        if (!row) throw new Error('Page not found');
        
        return new PageEntity(
            row.id,
            row.album_id,
            row.page_number,
            row.slots || {},
            row.created_at,
            row.updated_at
        );
    }

    static toDatabase(page: Partial<PageEntity>): any {
        const dbFields: any = {};
        
        if (page.id !== undefined) dbFields.id = page.id;
        if (page.albumId !== undefined) dbFields.album_id = page.albumId;
        if (page.pageNumber !== undefined) dbFields.page_number = page.pageNumber;
        if (page.slots !== undefined) dbFields.slots = page.slots;
        
        return dbFields;
    }
}
