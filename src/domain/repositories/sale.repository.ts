import { SaleEntity } from "../entities/sale.entity";
import { DbClient } from "../interfaces/db-client.interface";

export interface SaleRepository {
    create(sale: Omit<SaleEntity, 'id' | 'createdAt' | 'updatedAt'>, dbClient?: DbClient): Promise<SaleEntity>;
    findById(id: string): Promise<SaleEntity | null>;
    findAll(): Promise<SaleEntity[]>;
    findAllBySeller(sellerId: string): Promise<SaleEntity[]>;
    update(id: string, sale: Partial<SaleEntity>, dbClient?: DbClient): Promise<SaleEntity>;
    delete(id: string, dbClient?: DbClient): Promise<void>;
}
