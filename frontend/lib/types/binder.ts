export type BinderSize = '2x2' | '3x3' | '4x3' | '4x4';

export interface BinderCard {
  id: string;
  name: string;
  image: string;
  number: string;
  set: string;
  rarity?: string;
}

export interface Binder {
  id: string | number;
  name: string;
  spineColor: string;
  spineTextColor: string;
  coverType: 'color' | 'gradient' | 'image' | 'rainbow';
  coverValue: string;
  size: BinderSize;
  cards: (BinderCard | null)[];
  ownedCards?: Record<number, boolean>;
}
