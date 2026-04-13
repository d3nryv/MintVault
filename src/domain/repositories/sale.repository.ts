import { SaleEntity } from "../entities/sale.entity";

export interface SaleRepository {
    create(sale: Omit<SaleEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<SaleEntity>;
    findById(id: string): Promise<SaleEntity | null>;
    findAll(): Promise<SaleEntity[]>;
    findAllBySeller(sellerId: string): Promise<SaleEntity[]>;
    update(id: string, sale: Partial<SaleEntity>): Promise<SaleEntity>;
    delete(id: string): Promise<void>;
}
