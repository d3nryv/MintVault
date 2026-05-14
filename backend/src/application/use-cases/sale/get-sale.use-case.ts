import { SaleRepository } from "../../../domain/repositories/sale.repository";
import { CardRepository } from "../../../domain/repositories/card.repository";
import { UserRepository } from "../../../domain/repositories/user.repository";
import { CustomError } from "../../../domain/errors/custom.error";
import { SaleResponseDto } from "../../dtos/sale.dto";

export class GetSaleUseCase {
  constructor(
    private readonly saleRepository: SaleRepository,
    private readonly cardRepository: CardRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(id: string): Promise<SaleResponseDto> {
    const sale = await this.saleRepository.findById(id);
    if (!sale) throw CustomError.notFound('Sale not found');

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
  }
}
