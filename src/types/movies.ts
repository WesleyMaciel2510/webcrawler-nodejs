export interface Movie {
  title: string;
  release_date: string;
  url?: string | null;
}

export interface MovieResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  resPerPage: number;
  totalPages: number;
  data: any[];
}

export interface ErrorResponse {
  success: boolean;
  error: string;
}
