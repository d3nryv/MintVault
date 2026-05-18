export interface CreatePageDto {
  albumId: string;
  pageNumber: number;
}

export interface UpdatePageDto {
  pageNumber?: number;
  slots?: Record<number, string | null>;
}
