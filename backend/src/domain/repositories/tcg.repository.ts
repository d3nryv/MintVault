export interface TcgPlayerInfo {
  id: string;
  name: string;
  supertype: string;
  subtypes: string[];
  hp?: string;
  types?: string[];
  evolvesFrom?: string;
  abilities?: any[];
  attacks?: any[];
  weaknesses?: any[];
  resistances?: any[];
  retreatCost?: string[];
  flavorText?: string;
  rarity?: string;
  images: {
    small: string;
    large: string;
  };
  set: {
    id: string;
    name: string;
    series: string;
    ptcgoCode?: string;
  };
}

export abstract class TcgRepository {
  abstract getCardById(id: string): Promise<TcgPlayerInfo | null>;
  abstract findCardsByName(name: string): Promise<TcgPlayerInfo[]>;
}
