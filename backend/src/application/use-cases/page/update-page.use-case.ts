import { PageEntity } from "../../../domain/entities/page.entity";
import { PageRepository } from "../../../domain/repositories/page.repository";
import { UpdatePageDto } from "../../dtos/page.dto";
import { CustomError } from "../../../domain/errors/custom.error";

export class UpdatePageUseCase {
  constructor(private readonly pageRepository: PageRepository) {}

  async execute(id: string, dto: UpdatePageDto): Promise<PageEntity> {
    const existing = await this.pageRepository.findById(id);
    if (!existing) {
      throw CustomError.notFound('Page not found');
    }

    const updatedData: Partial<PageEntity> = {};
    if (dto.pageNumber !== undefined) updatedData.pageNumber = dto.pageNumber;
    if (dto.slots !== undefined) updatedData.slots = dto.slots;

    return this.pageRepository.update(id, updatedData);
  }
}
