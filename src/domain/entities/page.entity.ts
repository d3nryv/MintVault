export class PageEntity {
  constructor(
    public id: string,
    public albumId: string,
    public pageNumber: number,
    public cardIds: string[]
  ) {}
}

