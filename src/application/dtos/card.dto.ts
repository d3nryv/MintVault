export interface CreateCardDto {
  name: string;
  type: string;
  rarity: string;
  description: string;
  price: number;
  stock: number;
}

export interface UpdateCardDto {
  name?: string;
  type?: string;
  rarity?: string;
  description?: string;
  price?: number;
  stock?: number;
}
