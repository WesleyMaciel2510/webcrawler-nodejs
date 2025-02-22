// src/tests/movieCrawler.test.ts
import { describe, it, expect } from "@jest/globals";
import { MovieCrawlerService } from "../services/movieCrawler";

describe("MovieCrawlerService", () => {
  it("should fetch movies", async () => {
    const crawler = new MovieCrawlerService();
    const movies = await crawler.crawlMovies();
    expect(movies.length).toBeGreaterThan(0);
    expect(movies[0]).toHaveProperty("title");
    expect(movies[0]).toHaveProperty("release_date");
  });
});
