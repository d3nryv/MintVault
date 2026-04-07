export interface CreateCardDto {
  name: string;
  type: string;
  rarity: string;
  description?: string;
  price: number;
  stock: number;
  ownerId?: string;
  source: string;
  language?: string;
  isForSale?: boolean;
  saleId?: string;
  acquiredAt?: string;
  metadata?: Record<string, any>;
}

export interface UpdateCardDto {
  name?: string;
  type?: string;
  rarity?: string;
  description?: string;
  price?: number;
  stock?: number;
  ownerId?: string;
  source?: string;
  language?: string;
  isForSale?: boolean;
  saleId?: string;
  acquiredAt?: string;
  metadata?: Record<string, any>;
}
