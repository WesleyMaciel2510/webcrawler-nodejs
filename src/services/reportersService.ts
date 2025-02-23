import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const ELASTIC_URL = process.env.ELASTIC_URL as string;
const ELASTIC_TOKEN = process.env.ELASTIC_TOKEN as string;

export class ReportersService {
  public async getReporters(): Promise<string[]> {
    try {
      const response = await axios.post(
        ELASTIC_URL,
        {
          size: 1000,
          _source: ["reporter"], // Pegando apenas o campo "reporter"
          query: {
            match_all: {}, // Retorna todos os documentos
          },
        },
        {
          headers: {
            Authorization: `ApiKey ${ELASTIC_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      const hits = response.data.hits.hits;
      const reporters: string[] = hits.map(
        (hit: any) => hit._source.reporter as string // Extraindo o valor do campo "reporter"
      );

      // Remover duplicatas e ordenar
      return [...new Set(reporters)].sort();
    } catch (error) {
      //console.error("Erro ao buscar reporters:", error);
      throw new Error("Erro ao buscar reporters");
    }
  }
}
