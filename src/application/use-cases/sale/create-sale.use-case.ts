import { SaleEntity, SaleExtras } from "../../../domain/entities/sale.entity";
import { SaleRepository } from "../../../domain/repositories/sale.repository";
import { CardRepository } from "../../../domain/repositories/card.repository";
import { CustomError } from "../../../domain/errors/custom.error";

export interface CreateSaleDto {
  cardId: string;
  sellerId: string;
  amount: number;
  price: number;
  language: string;
  condition: string;
  observations?: string;
  imageUrl?: string;
  extras?: SaleExtras;
}

export class CreateSaleUseCase {
  constructor(
    private readonly saleRepository: SaleRepository,
    private readonly cardRepository: CardRepository
  ) {}

  async execute(dto: CreateSaleDto): Promise<SaleEntity> {
    // 1. Validar que la carta existe
    const card = await this.cardRepository.findById(dto.cardId);
    if (!card) throw CustomError.notFound('Card not found');

    // 2. Validar que la carta pertenece al vendedor
    if (card.ownerId !== dto.sellerId) {
      throw CustomError.forbidden('You do not own this card');
    }

    // 3. Crear la venta
    const sale = await this.saleRepository.create({
      cardId: dto.cardId,
      sellerId: dto.sellerId,
      amount: dto.amount,
      price: dto.price,
      language: dto.language,
      condition: dto.condition,
      observations: dto.observations || null,
      imageUrl: dto.imageUrl || null,
      extras: dto.extras || {},
      status: 'active'
    });

    // 4. Actualizar la carta (opcional: marcar como en venta)
    await this.cardRepository.update(dto.cardId, {
      isForSale: true,
      saleId: sale.id
    });

    return sale;
  }
}
