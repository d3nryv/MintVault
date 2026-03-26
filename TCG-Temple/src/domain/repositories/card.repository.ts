import { CardEntity } from '../entities/card.entity';

export abstract class CardRepository {
  abstract findAll(): Promise<CardEntity[]>;
  abstract findById(id: string): Promise<CardEntity | null>;
  abstract create(card: Omit<CardEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<CardEntity>;
  abstract update(id: string, card: Partial<CardEntity>): Promise<CardEntity>;
  abstract delete(id: string): Promise<void>;
}
