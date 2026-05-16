import { SaleRepository } from "../../../domain/repositories/sale.repository";
import { CardRepository } from "../../../domain/repositories/card.repository";
import { CustomError } from "../../../domain/errors/custom.error";

export class DeleteSaleUseCase {
  constructor(
    private readonly saleRepository: SaleRepository,
    private readonly cardRepository: CardRepository
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    const sale = await this.saleRepository.findById(id);
    if (!sale) throw CustomError.notFound('Sale not found');

    if (sale.sellerId !== userId) {
      throw CustomError.forbidden('You can only delete your own sales');
    }

    // Actualizar la carta asociada para que ya no figure como "en venta"
    const card = await this.cardRepository.findById(sale.cardId);
    if (card) {
      await this.cardRepository.update(card.id, {
        isForSale: false,
        saleId: null
      });
    }

    await this.saleRepository.delete(id);
  }
}
