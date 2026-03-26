export class CardEntity {
  constructor(
    public id: string,
    public ownerId: string | null,
    public source: string,
    public language: string | null,
    public isForSale: boolean = false,
    public saleId: string | null,
    public acquiredAt: string | null,
    public metadata: Record<string, any> | null
    
  ) {}
}

