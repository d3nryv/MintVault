import { TcgPlayerInfo, TcgRepository } from '../../../domain/repositories/tcg.repository';

export class GetCardsByNameUseCase {
  constructor(private readonly tcgRepository: TcgRepository) {}

  async execute(name: string): Promise<TcgPlayerInfo[]> {
    if (!name || name.trim() === '') {
      return [];
    }
    return this.tcgRepository.findCardsByName(name);
  }
}
