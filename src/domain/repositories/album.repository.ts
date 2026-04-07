import { AlbumEntity } from "../entities/album.entity";

export abstract class AlbumRepository {
    abstract findAll(): Promise<AlbumEntity[]>;
    abstract findById(id: string): Promise<AlbumEntity | null>;
    abstract create(album: Omit<AlbumEntity, 'id' | 'createdAt' | 'updatedAt' | 'pages'>): Promise<AlbumEntity>;
    abstract update(id: string, album: Partial<AlbumEntity>): Promise<AlbumEntity>;
    abstract delete(id: string): Promise<void>;
    abstract findByOwner(ownerId: string): Promise<AlbumEntity[]>;
}
