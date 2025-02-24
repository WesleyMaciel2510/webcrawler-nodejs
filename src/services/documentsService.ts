import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const ELASTIC_TOKEN = process.env.ELASTIC_TOKEN as string;
const ELASTIC_DOCUMENTS_URL = process.env.ELASTIC_DOCUMENTS_URL as string;

export class DocumentsService {
  public async searchDocuments(term: string): Promise<any[]> {
    try {
      // Fazendo uma requisição POST para o Elasticsearch
      const response = await axios.post(
        ELASTIC_DOCUMENTS_URL, // Usando a URL completa do .env
        {
          size: 10, // Limitar a 10 resultados
          _source: ["ementa", "data_julgamento"], // Buscar apenas os campos relevantes
          query: {
            match: { ementa: term }, // Buscar por "ementa"
          },
          sort: [{ data_julgamento: { order: "desc" } }], // Ordenar por data_julgamento (mais recente primeiro)
        },
        {
          headers: {
            Authorization: `ApiKey ${ELASTIC_TOKEN}`, // Token de autenticação
            "Content-Type": "application/json", // Definir o tipo de conteúdo como JSON
          },
        }
      );

      // Verificando se a resposta contém dados
      const hits = response.data.hits.hits;

      if (!hits || hits.length === 0) {
        console.log("Nenhum documento encontrado.");
        return []; // Retorna um array vazio se não houver resultados
      }

      // Mapeando os resultados para extrair os campos relevantes
      const documents = hits.map((hit: any) => ({
        ementa: hit._source.ementa,
        data_julgamento: hit._source.data_julgamento,
      }));

      console.log("Documentos encontrados:", documents); // Log para depuração
      return documents; // Retorna a lista de documentos
    } catch (error: any) {
      console.error("Erro ao buscar documentos:", error.response?.data || error.message);
      throw new Error(`Erro ao buscar documentos: ${error.response?.data || error.message}`);
    }
  }
}
