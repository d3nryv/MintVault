import { SaleEntity } from "../../../domain/entities/sale.entity";
import { SaleRepository } from "../../../domain/repositories/sale.repository";
import { CustomError } from "../../../domain/errors/custom.error";

export class GetSaleUseCase {
  constructor(private readonly saleRepository: SaleRepository) {}

  async execute(id: string): Promise<SaleEntity> {
    const sale = await this.saleRepository.findById(id);
    if (!sale) throw CustomError.notFound('Sale not found');
    return sale;
  }
}

export class GetAllSalesUseCase {
  constructor(private readonly saleRepository: SaleRepository) {}

  async execute(): Promise<SaleEntity[]> {
    return await this.saleRepository.findAll();
  }
}

export class ListSalesBySellerUseCase {
  constructor(private readonly saleRepository: SaleRepository) {}

  async execute(sellerId: string): Promise<SaleEntity[]> {
    return await this.saleRepository.findAllBySeller(sellerId);
  }
}
