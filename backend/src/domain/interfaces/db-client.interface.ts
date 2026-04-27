export interface DbClient {
  query: (text: string, params?: any[]) => Promise<any>;
}
