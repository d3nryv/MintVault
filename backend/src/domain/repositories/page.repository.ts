import { PageEntity } from "../entities/page.entity";

export abstract class PageRepository {
  abstract findByAlbum(albumId: string): Promise<PageEntity[]>;
  abstract findById(id: string): Promise<PageEntity | null>;
  abstract create(page: Omit<PageEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<PageEntity>;
  abstract update(id: string, page: Partial<PageEntity>): Promise<PageEntity>;
  abstract delete(id: string): Promise<void>;
}
