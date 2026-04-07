export interface CreateAlbumDto {
  ownerId: string;
  name: string;
  coverCardId?: string;
  cards?: string[]; // Automated placement for new albums
  height: number;   // Rows (integer)
  width: number;    // Columns (integer)
}

export interface UpdateAlbumDto {
  name?: string;
  coverCardId?: string;
  height?: number;
  width?: number;
}

export interface MoveCardDto {
    fromPageId: string;
    fromSlot: number;
    toPageId: string;
    toSlot: number;
}
