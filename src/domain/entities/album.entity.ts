export class AlbumEntity {
  constructor(
    public ownerId: string,
    public id: string,
    public name: string,
    public cover: string,
    public cards: string[],
    public height: number,
    public width: number,
    public pages: string[]
  ) {}
}
