import { SaleEntity } from "../../../domain/entities/sale.entity";
import { SaleRepository } from "../../../domain/repositories/sale.repository";
import { CustomError } from "../../../domain/errors/custom.error";

export class UpdateSaleUseCase {
  constructor(private readonly saleRepository: SaleRepository) {}

  async execute(id: string, dto: Partial<SaleEntity>, userId: string): Promise<SaleEntity> {
    if (Object.keys(dto).length === 0) {
      throw CustomError.badRequest('At least one field must be provided for update');
    }

    const sale = await this.saleRepository.findById(id);
    if (!sale) throw CustomError.notFound('Sale not found');

    if (sale.sellerId !== userId) {
      throw CustomError.forbidden('You can only update your own sales');
    }

    return await this.saleRepository.update(id, dto);
  }
}

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
