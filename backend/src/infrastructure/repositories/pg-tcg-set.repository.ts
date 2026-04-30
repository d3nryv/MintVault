import { db } from '../database/postgres/database';

export interface TcgSet {
  id: string;
  name: string;
  abbreviation: string;
  era: string;
}

export class PostgresTcgSetRepository {
  async getAll(): Promise<TcgSet[]> {
    const result = await db.query('SELECT id, name, abbreviation, era FROM tcg_sets ORDER BY name ASC');
    return result.rows;
  }

  async getByName(name: string): Promise<TcgSet | null> {
    const result = await db.query('SELECT id, name, abbreviation FROM tcg_sets WHERE name = $1', [name]);
    return result.rows[0] || null;
  }
}
