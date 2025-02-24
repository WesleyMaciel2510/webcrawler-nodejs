import { Router } from "express";
import { movieController } from "../controller/movieController";
import { reportersController } from "../controller/reportersController";
import { documentsController } from "../controller/documentsController";

const router = Router();

// Rotas relacionadas a busca de filmes no Rotten Tomatoes
router.get("/movies", movieController.getMovies);
router.get("/movies/searchByName", movieController.getMoviesByName);

// Rotas relacionadas a busca de Relatores no Elastic Search
router.get("/reporters", reportersController.getReporters);

// Rotas relacionadas a busca de Documentos no Elastic Search
router.post("/documents", documentsController.searchDocuments);

export default router;
