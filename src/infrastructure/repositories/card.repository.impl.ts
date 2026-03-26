import { CardEntity } from '../../domain/entities/card.entity';
import { CardRepository } from '../../domain/repositories/card.repository';
import { v4 as uuidv4 } from 'uuid';

// In-memory implementation — swap for a real DB datasource
export class CardRepositoryImpl extends CardRepository {
  private cards: CardEntity[] = [];

  async findAll(): Promise<CardEntity[]> {
    return this.cards;
  }

  async findById(id: string): Promise<CardEntity | null> {
    return this.cards.find((c) => c.id === id) ?? null;
  }

  async create(
    card: Omit<CardEntity, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<CardEntity> {
    const newCard = new CardEntity(
      uuidv4(),
      card.name,
      card.type,
      card.rarity,
      card.description,
      card.price,
      card.stock,
      new Date(),
      new Date()
    );
    this.cards.push(newCard);
    return newCard;
  }

  async update(id: string, data: Partial<CardEntity>): Promise<CardEntity> {
    const index = this.cards.findIndex((c) => c.id === id);
    const existing = this.cards[index]!;
    const updated = new CardEntity(
      existing.id,
      data.name ?? existing.name,
      data.type ?? existing.type,
      data.rarity ?? existing.rarity,
      data.description ?? existing.description,
      data.price ?? existing.price,
      data.stock ?? existing.stock,
      existing.createdAt,
      new Date()
    );
    this.cards[index] = updated;
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.cards = this.cards.filter((c) => c.id !== id);
  }
}
