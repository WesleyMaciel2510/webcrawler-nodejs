import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const ELASTIC_URL = process.env.ELASTIC_URL as string;
const ELASTIC_TOKEN = process.env.ELASTIC_TOKEN as string;

export class RelatoresService {
  public async getRelatores(): Promise<string[]> {
    try {
      const response = await axios.post(
        ELASTIC_URL,
        {
          size: 1000,
          _source: ["relator"], // Pegando apenas o campo "relator"
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
      const relatores: string[] = hits.map(
        (hit: any) => hit._source.relator as string
      );

      // Remover duplicatas e ordenar
      return [...new Set(relatores)].sort();
    } catch (error) {
      //console.error("Erro ao buscar relatores:", error);
      throw new Error("Erro ao buscar relatores");
    }
  }
}
