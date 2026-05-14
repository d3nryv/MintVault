import { SaleRepository } from "../../../domain/repositories/sale.repository";
import { CardRepository } from "../../../domain/repositories/card.repository";
import { UserRepository } from "../../../domain/repositories/user.repository";
import { SaleResponseDto } from "../../dtos/sale.dto";

export class ListSalesBySellerUseCase {
  constructor(
    private readonly saleRepository: SaleRepository,
    private readonly cardRepository: CardRepository,
    private readonly userRepository: UserRepository
  ) { }

  async execute(sellerId: string): Promise<SaleResponseDto[]> {
    const sales = await this.saleRepository.findAllBySeller(sellerId);

    const salesWithDetails = await Promise.all(
      sales.map(async (sale) => {
        const card = await this.cardRepository.findById(sale.cardId);
        const seller = await this.userRepository.findById(sale.sellerId);

        return {
          ...sale,
          cardName: card?.name || 'Unknown Card',
          cardSet: card?.source || 'Unknown Set',
          cardImage: card?.metadata?.['images']?.['small'] || '',
          sellerName: seller?.username || 'Unknown Seller',
          tcgId: card?.tcgId
        } as SaleResponseDto;
      })
    );

    return salesWithDetails;
  }
}
