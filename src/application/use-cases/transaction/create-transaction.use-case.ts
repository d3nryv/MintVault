import { TransactionEntity } from "../../../domain/entities/transaction.entity";
import { TransactionRepository } from "../../../domain/repositories/transaction.repository";
import { SaleRepository } from "../../../domain/repositories/sale.repository";
import { CustomError } from "../../../domain/errors/custom.error";

export interface CreateTransactionDto {
  saleId: string;
  buyerId: string;
  quantity: number;
  paymentMethod?: string;
  shippingAddress?: string;
}

export class CreateTransactionUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly saleRepository: SaleRepository
  ) {}

  async execute(dto: CreateTransactionDto): Promise<TransactionEntity> {
    // 1. Validar que la venta existe
    const sale = await this.saleRepository.findById(dto.saleId);
    if (!sale) throw CustomError.notFound('Sale not found');

    // 2. Validar que la venta está activa
    if (sale.status !== 'active') {
      throw CustomError.badRequest('This sale is no longer active');
    }

    // 3. Validar stock
    if (sale.amount < dto.quantity) {
      throw CustomError.badRequest(`Not enough stock. Available: ${sale.amount}`);
    }

    // 4. Evitar auto-compra
    if (sale.sellerId === dto.buyerId) {
      throw CustomError.badRequest('You cannot buy your own cards');
    }

    // 5. Calcular precio total
    const totalPrice = sale.price * dto.quantity;

    // 6. Crear la transacción
    const transaction = await this.transactionRepository.create({
      saleId: dto.saleId,
      buyerId: dto.buyerId,
      sellerId: sale.sellerId,
      quantity: dto.quantity,
      totalPrice: totalPrice,
      status: 'pending',
      paymentMethod: dto.paymentMethod || 'other',
      shippingAddress: dto.shippingAddress || null
    });

    // 7. Actualizar el stock de la venta
    const newAmount = sale.amount - dto.quantity;
    const newStatus = newAmount === 0 ? 'sold' : 'active';
    
    await this.saleRepository.update(dto.saleId, {
      amount: newAmount,
      status: newStatus
    });

    return transaction;
  }
}
