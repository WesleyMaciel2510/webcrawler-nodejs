import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { Mocked, mocked } from "jest-mock";
import axios from "axios";
import { MovieCrawlerService } from "../../services/movieCrawler";
import { Movie } from "../../types/movies";
import * as cheerio from "cheerio";

// Mock axios and cheerio
jest.mock("axios");

describe("MovieCrawlerService", () => {
  let crawler: MovieCrawlerService;

  beforeEach(() => {
    crawler = new MovieCrawlerService();
  });

  it("should fetch movies", async () => {
    const mockHtml = `
      <html>
        <body>
          <a href="/m/movie1"><span class="p--small">Movie 1</span><span class="smaller">2023-01-01</span></a>
          <a href="/m/movie2"><span class="p--small">Movie 2</span><span class="smaller">2023-02-01</span></a>
        </body>
      </html>
    `;
    mocked(axios.get).mockResolvedValue({ data: mockHtml });

    const movies = await crawler.crawlMovies();

    expect(movies.length).toBeGreaterThan(0);
    expect(movies[0]).toHaveProperty("title");
    expect(movies[0]).toHaveProperty("release_date");
    expect(movies[0]).toHaveProperty("url");
  });

  it("should handle network errors", async () => {
    (axios.get as jest.Mock).mockRejectedValue(new Error("Network Error") as never);

    await expect(crawler.crawlMovies()).rejects.toThrow("Network Error");
  });

  it("should format date correctly", () => {
    const validDate = "2023-01-01";
    const invalidDate = "invalid-date";
  
    expect(crawler["formatDate"](validDate)).toBe(new Date(validDate).toISOString());
  
    const currentDate = new Date().toISOString();
    expect(crawler["formatDate"](invalidDate)).toBe(currentDate);
  });

  it("should search movies by name and paginate results", async () => {
    const mockMovies: Movie[] = [
      { title: "Movie 1", release_date: "2023-01-01", url: "https://example.com/movie1" },
      { title: "Movie 2", release_date: "2023-02-01", url: "https://example.com/movie2" },
      { title: "Another Movie", release_date: "2023-03-01", url: "https://example.com/another" },
    ];

    // Mock crawlMovies to return mockMovies
    jest.spyOn(crawler, "crawlMovies").mockResolvedValue(mockMovies);

    const searchResult = await crawler.searchMoviesByName("Movie", 1, 2);

    expect(searchResult.length).toBe(2);
    expect(searchResult.movies).toEqual([mockMovies[0], mockMovies[1]]);
    expect(searchResult.total).toBe(3);
  });

  it("should handle empty search results", async () => {
    const mockMovies: Movie[] = [
      { title: "Movie 1", release_date: "2023-01-01", url: "https://example.com/movie1" },
      { title: "Movie 2", release_date: "2023-02-01", url: "https://example.com/movie2" },
    ];

    jest.spyOn(crawler, "crawlMovies").mockResolvedValue(mockMovies);

    const searchResult = await crawler.searchMoviesByName("NonExistent", 1, 2);

    expect(searchResult.length).toBe(0);
    expect(searchResult.movies).toEqual([]);
    expect(searchResult.total).toBe(0);
  });

  it("should handle pagination beyond available results", async () => {
    const mockMovies: Movie[] = [
      { title: "Movie 1", release_date: "2023-01-01", url: "https://example.com/movie1" },
      { title: "Movie 2", release_date: "2023-02-01", url: "https://example.com/movie2" },
    ];

    jest.spyOn(crawler, "crawlMovies").mockResolvedValue(mockMovies);

    const searchResult = await crawler.searchMoviesByName("Movie", 2, 2);

    expect(searchResult.length).toBe(0);
    expect(searchResult.movies).toEqual([]);
    expect(searchResult.total).toBe(2);
  });
});