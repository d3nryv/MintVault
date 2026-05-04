import { TcgPlayerInfo } from "../repositories/tcg.repository";

export interface DeckItemEntity {
    card: TcgPlayerInfo;
    count: number;
}

export class DeckEntity {
    constructor(
        public id: string,
        public ownerId: string,
        public name: string,
        public cards: DeckItemEntity[],
        public createdAt: Date,
        public updatedAt: Date,
        public strategy?: string
    ) {}
}
