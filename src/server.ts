import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MovieResponse, ErrorResponse } from "./types/movies";
import { MovieCrawlerService } from "./services/movieCrawler";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const movieCrawler = new MovieCrawlerService();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get(
  "/api/movies",
  async (req: Request, res: Response<MovieResponse | ErrorResponse>) => {
    try {
      const movies = await movieCrawler.crawlMovies();
      res.json({
        success: true,
        count: movies.length,
        data: movies,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Failed to fetch movies: ${(error as Error).message}`,
      });
    }
  }
);

// Health check endpoint
app.get("/health", (_: Request, res: Response) => {
  res.json({ status: "OK" });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Something broke!",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
