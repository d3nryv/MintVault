import { SaleEntity } from "../../domain/entities/sale.entity";

export interface SaleResponseDto extends SaleEntity {
  cardName: string;
  cardSet: string;
  cardImage: string;
  sellerName: string;
  sellerSalesCount?: number;
  sellerSuccessRate?: number;
  tcgId?: string;
}
