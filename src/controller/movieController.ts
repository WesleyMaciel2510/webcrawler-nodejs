import { Request, Response } from "express";
import { MovieCrawlerService } from "../services/movieCrawler";
import { MovieResponse, ErrorResponse } from "../types/movies";

export class MovieController {
  private movieService: MovieCrawlerService;

  constructor() {
    this.movieService = new MovieCrawlerService();
  }

  public getMovies = async (
    req: Request,
    res: Response<MovieResponse | ErrorResponse>
  ): Promise<void> => {
    try {
      console.log("Fetching movies...");

      // Get pagination parameters from query, with default values
      const page = parseInt(req.query.page as string, 10) || 1;
      const resPerPage = parseInt(req.query.resPerPage as string, 10) || 30;

      if (page < 1 || resPerPage < 1) {
        res.status(400).json({
          success: false,
          error: "Page and resPerPage must be positive integers.",
        });
        return;
      }

      // Fetch all movies
      const movies = await this.movieService.crawlMovies();

      // Calculate pagination
      const startIndex = (page - 1) * resPerPage;
      const paginatedMovies = movies.slice(startIndex, startIndex + resPerPage);

      res.json({
        success: true,
        count: paginatedMovies.length,
        total: movies.length,
        page,
        resPerPage,
        totalPages: Math.ceil(movies.length / resPerPage),
        data: paginatedMovies,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Failed to fetch movies: ${(error as Error).message}`,
      });
    }
  };

  public getMoviesByName = async (
    req: Request,
    res: Response<MovieResponse | ErrorResponse>
  ): Promise<void> => {
    try {
      const { name } = req.query;
      const page = parseInt(req.query.page as string, 10) || 1;
      const resPerPage = parseInt(req.query.resPerPage as string, 10) || 30;

      if (!name || typeof name !== "string") {
        res.status(400).json({
          success: false,
          error: "Missing or invalid 'name' query parameter",
        });
        return;
      }

      const movies = await this.movieService.searchMoviesByName(
        name,
        page,
        resPerPage
      );
      res.json({
        success: true,
        count: movies.length,
        total: movies.length,
        page: 1,
        resPerPage: movies.length,
        totalPages: 1,
        data: movies.movies,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Failed to search movies: ${(error as Error).message}`,
      });
    }
  };
}

export const movieController = new MovieController();
