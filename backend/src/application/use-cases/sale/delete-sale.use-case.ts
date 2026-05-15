import { SaleRepository } from "../../../domain/repositories/sale.repository";
import { CustomError } from "../../../domain/errors/custom.error";

export class DeleteSaleUseCase {
  constructor(private readonly saleRepository: SaleRepository) {}

  async execute(id: string, userId: string): Promise<void> {
    const sale = await this.saleRepository.findById(id);
    if (!sale) throw CustomError.notFound('Sale not found');

    if (sale.sellerId !== userId) {
      throw CustomError.forbidden('You can only delete your own sales');
    }

    await this.saleRepository.delete(id);
  }
}
