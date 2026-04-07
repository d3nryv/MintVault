export interface CreateCardDto {
  tcgId: string; // The ID from Pokemon TCG SDK (e.g., 'swsh1-1')
  ownerId: string | null;
  language?: string;
  isForSale?: boolean;
  price?: number;
  stock?: number;
}

export interface UpdateCardDto {
  ownerId?: string | null;
  language?: string;
  isForSale?: boolean;
  price?: number;
  stock?: number;
}
