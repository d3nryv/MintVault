import { PageEntity } from "../../../domain/entities/page.entity";
import { PageRepository } from "../../../domain/repositories/page.repository";
import { CreatePageDto } from "../../dtos/page.dto";

export class CreatePageUseCase {
  constructor(private readonly pageRepository: PageRepository) {}

  async execute(dto: CreatePageDto): Promise<PageEntity> {
    const pageData: Omit<PageEntity, 'id' | 'createdAt' | 'updatedAt'> = {
        albumId: dto.albumId,
        pageNumber: dto.pageNumber,
        slots: {}
    };
    return this.pageRepository.create(pageData);
  }
}
