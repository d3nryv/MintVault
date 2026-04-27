export class CardEntity {
  constructor(
    public id: string,
    public ownerId: string | null,
    public name: string,
    public type: string,
    public rarity: string,
    public description: string | null,
    public price: number,
    public stock: number,
    public source: string,
    public language: string | null,
    public isForSale: boolean = false,
    public saleId: string | null,
    public acquiredAt: string | null,
    public createdAt: Date,
    public updatedAt: Date,
    public metadata: Record<string, any> | null
  ) {}
}
