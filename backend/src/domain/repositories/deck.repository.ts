import { DeckEntity } from "../entities/deck.entity";

export abstract class DeckRepository {
    abstract findAll(): Promise<DeckEntity[]>;
    abstract findById(id: string): Promise<DeckEntity | null>;
    abstract findByOwner(ownerId: string): Promise<DeckEntity[]>;
    abstract create(deck: Omit<DeckEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<DeckEntity>;
    abstract update(id: string, deck: Partial<DeckEntity>): Promise<DeckEntity>;
    abstract delete(id: string): Promise<void>;
}
