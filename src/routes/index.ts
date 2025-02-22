import { Router } from "express";
import { movieController } from "../controller/movieController";
import { relatoresController } from "../controller/relatoresController";

const router = Router();

// Rotas relacionadas a busca de filmes no Rotten Tomatoes
router.get("/movies", movieController.getMovies);
router.get("/movies/searchByName", movieController.getMoviesByName);

// Rotas relacionadas a busca de Relatores no Elastic Search
router.get("/relatores", relatoresController.getRelatores);

export default router;
