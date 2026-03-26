type SaleType = "fixed" | "auction";
type SaleStatus = "draft" | "active" | "sold" | "cancelled" | "expired" | "completed";

type SaleBid = { bidderId: string; amount: number; placedAt: string };

type SaleExtras = Record<string, boolean | string | number | null>;

type ShippingDetails = {
  originCountry?: string;
  shippingCost?: number;
  estimatedDays?: number;
};

export class SaleEntity {
  constructor(
    public id: string,
    public cardId: string,
    public sellerId: string,
    public type: SaleType,
    public status: SaleStatus,
    public createdAt: string,
    public updatedAt: string,
    public quantity: number = 1,
    public language?: string,
    public condition?: string,
    public notes?: string,
    public imageUrl?: string,
    public extras?: SaleExtras,
    public price?: number,
    public currency?: string,
    public startingBid?: number,
    public currentBid?: number,
    public buyoutPrice?: number,
    public bids?: SaleBid[],
    public postedAt?: string,
    public expiresAt?: string,
    public reservedForId?: string,
    public shippingIncluded?: boolean,
    public shippingDetails?: ShippingDetails,
    public metadata?: Record<string, any>
  ) {}
}
