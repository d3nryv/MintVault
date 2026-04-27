import { PageRepository } from "../../../domain/repositories/page.repository";

export class DeletePageUseCase {
  constructor(private readonly pageRepository: PageRepository) {}

  async execute(id: string): Promise<void> {
    return this.pageRepository.delete(id);
  }
}
