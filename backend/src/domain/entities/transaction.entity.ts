export type TransactionStatus = 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';

export class TransactionEntity {
  constructor(
    public id: string,
    public saleId: string,
    public buyerId: string,
    public sellerId: string,
    public quantity: number,
    public totalPrice: number,
    public status: TransactionStatus,
    public paymentMethod: string,
    public shippingAddress: string | null = null,
    public reportedUndelivered: boolean = false,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {}

  static create(props: {
    id: string;
    saleId: string;
    buyerId: string;
    sellerId: string;
    quantity: number;
    totalPrice: number;
    status?: TransactionStatus;
    paymentMethod?: string;
    shippingAddress?: string;
    reportedUndelivered?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }): TransactionEntity {
    return new TransactionEntity(
      props.id,
      props.saleId,
      props.buyerId,
      props.sellerId,
      props.quantity,
      props.totalPrice,
      props.status || 'pending',
      props.paymentMethod || 'other',
      props.shippingAddress || null,
      props.reportedUndelivered || false,
      props.createdAt || new Date(),
      props.updatedAt || new Date()
    );
  }
}
