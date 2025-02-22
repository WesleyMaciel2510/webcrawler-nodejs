export interface Movie {
  title: string;
  release_date: string;
  rating?: string;
  director?: string;
  crawled_at: string;
}

export interface MovieResponse {
  success: boolean;
  count: number;
  data: Movie[];
}

export interface ErrorResponse {
  success: boolean;
  error: string;
}
