import { DbClient } from "./db-client.interface";

export interface TransactionManager {
  transactional<T>(callback: (client: DbClient) => Promise<T>): Promise<T>;
}
