export class PaginatedResponseDTO<T> {
  readonly data: T[];
  readonly page: number;
  readonly limit: number;
  readonly total: number;

  constructor(page: number, limit: number, total: number, data: T[]) {
    this.data = data;
    this.page = page;
    this.limit = limit;
    this.total = total;
  }
}
