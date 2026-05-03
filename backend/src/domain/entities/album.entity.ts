export class AlbumEntity {
  constructor(
    public id: string,
    public ownerId: string,
    public name: string,
    public coverCardId: string | null,
    public coverUrl: string | null,
    public height: number, // Rows
    public width: number,  // Columns
    public pages: string[], // Array of page IDs
    public createdAt: Date,
    public updatedAt: Date,
    public metadata: any = {}
  ) {}
}
