export class CardEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly type: string,
    public readonly rarity: string,
    public readonly description: string,
    public readonly price: number,
    public readonly stock: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}
