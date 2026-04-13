import { TransactionEntity, TransactionStatus } from "../../../domain/entities/transaction.entity";
import { TransactionRepository } from "../../../domain/repositories/transaction.repository";
import { SaleRepository } from "../../../domain/repositories/sale.repository";
import { CustomError } from "../../../domain/errors/custom.error";

export class UpdateTransactionStatusUseCase {
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly saleRepository: SaleRepository
  ) {}

  async execute(id: string, newStatus: TransactionStatus, userId: string): Promise<TransactionEntity> {
    const transaction = await this.transactionRepository.findById(id);
    if (!transaction) throw CustomError.notFound('Transaction not found');

    // 1. Validar que el usuario tiene derecho a estar aquí (es comprador o vendedor)
    const isBuyer = transaction.buyerId === userId;
    const isSeller = transaction.sellerId === userId;

    if (!isBuyer && !isSeller) {
      throw CustomError.forbidden('You are not authorized to update this transaction');
    }

    // 2. Validar qué puede hacer cada uno
    if (newStatus === 'shipped' && !isSeller) {
      throw CustomError.forbidden('Only the seller can mark the transaction as shipped');
    }

    if (newStatus === 'completed' && !isBuyer) {
      throw CustomError.forbidden('Only the buyer can mark the transaction as completed');
    }

    const oldStatus = transaction.status;

    // Si la transacción ya estaba cancelada o completada, no se puede cambiar (simplificación)
    if (oldStatus === 'cancelled' || oldStatus === 'completed') {
      throw CustomError.badRequest('Cannot change status of a finished transaction');
    }

    // 1. Actualizar el estado de la transacción
    const updatedTransaction = await this.transactionRepository.updateStatus(id, newStatus);

    // 2. Lógica de devolución de stock si se cancela
    if (newStatus === 'cancelled') {
        const sale = await this.saleRepository.findById(transaction.saleId);
        if (sale) {
            const newAmount = sale.amount + transaction.quantity;
            // Al devolver stock, si la venta estaba 'sold' vuelve a ser 'active'
            await this.saleRepository.update(sale.id, {
                amount: newAmount,
                status: 'active'
            });
        }
    }

    return updatedTransaction;
  }
}

export class GetTransactionUseCase {
    constructor(private readonly transactionRepository: TransactionRepository) {}
  
    async execute(id: string): Promise<TransactionEntity> {
      const transaction = await this.transactionRepository.findById(id);
      if (!transaction) throw CustomError.notFound('Transaction not found');
      return transaction;
    }
}

export class ListTransactionsUseCase {
    constructor(private readonly transactionRepository: TransactionRepository) {}
  
    async execute(userId: string, type: 'buyer' | 'seller'): Promise<TransactionEntity[]> {
      if (type === 'buyer') {
          return await this.transactionRepository.findAllByBuyer(userId);
      }
      return await this.transactionRepository.findAllBySeller(userId);
    }
}
