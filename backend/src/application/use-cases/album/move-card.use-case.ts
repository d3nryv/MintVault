import { AlbumRepository, PageRepository } from "../../../domain/repositories";
import { MoveCardDto } from "../../dtos/album.dto";
import { CustomError } from "../../../domain/errors/custom.error";

export class MoveCardUseCase {
  constructor(
    private readonly albumRepository: AlbumRepository,
    private readonly pageRepository: PageRepository
  ) {}

  async execute(dto: MoveCardDto): Promise<void> {
    const { fromPageId, fromSlot, toPageId, toSlot } = dto;

    const fromPage = await this.pageRepository.findById(fromPageId);
    const toPage = await this.pageRepository.findById(toPageId);

    if (!fromPage || !toPage) throw CustomError.notFound('Page not found');
    
    // 1. Obtener cartas de cada slot
    const fromCardId = fromPage.slots[fromSlot] || null;
    const toCardId = toPage.slots[toSlot] || null;

    if (!fromCardId && !toCardId) {
        throw CustomError.badRequest('Both source and destination slots are empty');
    }

    // INTERCAMBIAR
    const newFromSlots = { ...fromPage.slots };
    const newToSlots = { ...toPage.slots };

    // Si es la MISMA página
    if (fromPageId === toPageId) {
        newFromSlots[fromSlot] = toCardId;
        newFromSlots[toSlot] = fromCardId;
        
        // Limpiamos nulos si existían
        if (newFromSlots[fromSlot] === null) delete newFromSlots[fromSlot];
        if (newFromSlots[toSlot] === null) delete newFromSlots[toSlot];
        
        await this.pageRepository.update(fromPageId, { slots: newFromSlots });
    } else {
        // En Páginas DISTINTAS
        newFromSlots[fromSlot] = toCardId;
        newToSlots[toSlot] = fromCardId;
        
        // Limpiamos
        if (newFromSlots[fromSlot] === null) delete newFromSlots[fromSlot];
        if (newToSlots[toSlot] === null) delete newToSlots[toSlot];

        await this.pageRepository.update(fromPageId, { slots: newFromSlots });
        await this.pageRepository.update(toPageId, { slots: newToSlots });
    }
  }
}
