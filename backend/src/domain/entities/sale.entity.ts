export type SaleStatus = "active" | "sold" | "cancelled" | "expired";

export interface SaleExtras {
  signed?: boolean;
  altered?: boolean;
  reverseHolo?: boolean;
  firstEdition?: boolean;
  [key: string]: boolean | string | number | undefined;
}

export class SaleEntity {
  constructor(
    public id: string,
    public cardId: string,
    public sellerId: string,
    public amount: number,
    public price: number,
    public language: string,
    public condition: string,
    public observations: string | null = null,
    public imageUrl: string | null = null,
    public extras: SaleExtras = {},
    public status: SaleStatus = "active",
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  static create(props: {
    id: string;
    cardId: string;
    sellerId: string;
    amount: number;
    price: number;
    language: string;
    condition: string;
    observations?: string;
    imageUrl?: string;
    extras?: SaleExtras;
    status?: SaleStatus;
    createdAt?: Date;
    updatedAt?: Date;
  }): SaleEntity {
    return new SaleEntity(
      props.id,
      props.cardId,
      props.sellerId,
      props.amount,
      props.price,
      props.language,
      props.condition,
      props.observations,
      props.imageUrl,
      props.extras,
      props.status,
      props.createdAt,
      props.updatedAt
    );
  }
}
