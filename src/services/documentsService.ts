import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const ELASTIC_URL = process.env.ELASTIC_URL as string;
const ELASTIC_TOKEN = process.env.ELASTIC_TOKEN as string;
const INDEX = "search-juris-tst";

export class DocumentsService {
  public async searchDocuments(term: string): Promise<any[]> {
    try {
      const response = await axios.post(
        ELASTIC_URL,
        {
          size: 10, // Limit to 10 results
          _source: ["ementa", "data_julgamento"], // Fetch only relevant fields
          query: {
            match: { ementa: term }, // Search by ementa
          },
          sort: [{ data_julgamento: { order: "desc" } }], // Sort by most recent
        },
        {
          headers: {
            Authorization: `ApiKey ${ELASTIC_TOKEN}`,
            "Content-Type": "application/json",
          },
        }
      );

      const hits = response.data.hits.hits;
      return hits.map((hit: any) => ({
        ementa: hit._source.ementa,
        data_julgamento: hit._source.data_julgamento,
      }));
    } catch (error) {
      console.error("Error fetching documents:", error);
      throw new Error("Failed to fetch documents");
    }
  }
}
