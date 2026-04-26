export class PageEntity {
  constructor(
    public id: string,
    public albumId: string,
    public pageNumber: number,
    public slots: Record<number, string | null>, // Index of slot => cardId or null
    public createdAt: Date,
    public updatedAt: Date
  ) {}
}
