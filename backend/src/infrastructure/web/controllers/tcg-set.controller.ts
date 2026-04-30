import { Request, Response } from 'express';
import { PostgresTcgSetRepository } from '../../repositories/pg-tcg-set.repository';

export class TcgSetController {
  constructor(private readonly repository: PostgresTcgSetRepository) {}

  getAll = async (req: Request, res: Response) => {
    try {
      const sets = await this.repository.getAll();
      res.json(sets);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching TCG sets' });
    }
  };
}
