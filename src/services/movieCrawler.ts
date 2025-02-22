import axios from "axios";
import * as cheerio from "cheerio";
import { Movie } from "../types/movies";

export class MovieCrawlerService {
  private readonly baseUrl =
    "https://www.rottentomatoes.com/browse/movies_at_home";

  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toISOString();
    } catch (error) {
      //console.error("Error formatting date:", dateString, error);
      return new Date().toISOString();
    }
  }

  public async crawlMovies(): Promise<Movie[]> {
    try {
      //console.log("Fetching movies from:", this.baseUrl);

      const response = await axios.get(this.baseUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          "Sec-Ch-Ua":
            '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
          "Sec-Ch-Ua-Mobile": "?0",
          "Sec-Ch-Ua-Platform": '"Windows"',
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Sec-Fetch-User": "?1",
        },
      });

      if (!response.data) {
        throw new Error("No data received from Rotten Tomatoes");
      }

      //console.log("Response received, parsing HTML...");

      const $ = cheerio.load(response.data);
      const movies: Movie[] = [];

      $('a[href^="/m/"]')
        .slice(0, 20)
        .each((_, element) => {
          try {
            const movieElement = $(element);

            const title =
              movieElement.find("span.p--small").text().trim() ||
              "Unknown Title";

            let releaseDate = movieElement.find("span.smaller").text().trim();
            releaseDate = releaseDate ? this.formatDate(releaseDate) : "N/A";

            const relativeUrl = movieElement.attr("href");
            const url = relativeUrl
              ? `https://www.rottentomatoes.com${relativeUrl}`
              : null;
            if (title !== "Unknown Title") {
              movies.push({
                title,
                release_date: releaseDate,
                url,
              });
            }
          } catch (error) {
            //console.error("Error parsing movie element:", error);
          }
        });

      if (movies.length === 0) {
        throw new Error("No movies found on the page");
      }

      //console.log(`Successfully parsed ${movies.length} movies`);
      return movies;
    } catch (error) {
      //console.error("Error crawling Rotten Tomatoes:", error);
      if (axios.isAxiosError(error)) {
        throw new Error(`Network error: ${error.message}`);
      }
      throw error;
    }
  }

  public async searchMoviesByName(
    searchName: string,
    page: number,
    resPerPage: number
  ): Promise<{
    length: number;
    movies: Movie[];
    total: number;
  }> {
    try {
      //console.log(`Searching for movies with name containing: ${searchName}`);
      const allMovies = await this.crawlMovies();

      const filteredMovies = allMovies.filter((movie) =>
        movie.title.toLowerCase().includes(searchName.toLowerCase())
      );

      const total = filteredMovies.length;
      const startIndex = (page - 1) * resPerPage;
      const paginatedMovies = filteredMovies.slice(
        startIndex,
        startIndex + resPerPage
      );

      return { length: paginatedMovies.length, movies: paginatedMovies, total };
    } catch (error) {
      //console.error("Error searching movies by name:", error);
      throw new Error(`Failed to search movies: ${(error as Error).message}`);
    }
  }
}
