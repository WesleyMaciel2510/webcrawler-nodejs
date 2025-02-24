import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

//const ELASTIC_URL = process.env.ELASTIC_URL as string;
//const ELASTIC_TOKEN = process.env.ELASTIC_TOKEN as string;
//const ELASTIC_INDEX = process.env.ELASTIC_INDEX as string;

// Configurações do Elasticsearch
const ELASTIC_URL = "https://elastic.nelk.easyjur.com";
const ELASTIC_TOKEN = "ZktTWDlwUUJXZXBpZ1lyOHMtSWs6VGpXX3Bsby1RTUd1MXVRbjJVRVRvUQ==";
const ELASTIC_INDEX = "search-juris-tst";

export class ReportersService {
  public async getReporters(): Promise<string[]> {
    try {
      // Fazendo uma requisição POST para o Elasticsearch
      const response = await axios.post(
        `${ELASTIC_URL}/${ELASTIC_INDEX}/_search`, // URL completa para a busca no índice
        {
          size: 10000, // Aumentar o tamanho para recuperar todos os relatores (ajuste conforme necessário)
          _source: ["reporter"], // Especificar o campo que queremos recuperar
          query: {
            match_all: {}, // Buscar todos os documentos no índice
          },
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
        console.log("Nenhum relator encontrado no índice.");
        return []; // Retorna um array vazio se não houver resultados
      }

      // Mapeando os resultados para extrair os nomes dos relatores
      const reporters: string[] = hits.map(
        (hit: any) => hit._source.reporter as string // Extrai o campo 'reporter' de cada documento
      );

      // Remover duplicatas e ordenar os relatores alfabeticamente
      const uniqueReporters = [...new Set(reporters)].sort();

      console.log("Relatores encontrados:", uniqueReporters); // Log para depuração
      return uniqueReporters; // Retorna a lista de relatores únicos e ordenados
    } catch (error: any) {
      console.error("Erro ao buscar relatores:", error.response?.data || error.message);
      throw new Error(`Erro ao buscar relatores: ${error.response?.data || error.message}`);
    }
  }
}

