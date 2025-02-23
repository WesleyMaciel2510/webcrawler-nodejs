import axios from "axios";
import dotenv from "dotenv";
import * as d3 from "d3";
import { JSDOM } from "jsdom";
import * as fs from "fs";

dotenv.config();

const ELASTIC_URL = process.env.ELASTIC_URL as string;
const ELASTIC_TOKEN = process.env.ELASTIC_TOKEN as string;
const INDEX = "search-juris-tst";

export class DocumentsService {
  // Método para buscar documentos por um termo de pesquisa (ementa)
  public async searchDocuments(term: string): Promise<any[]> {
    try {
      // Fazendo uma requisição POST para o Elasticsearch
      const response = await axios.post(
        ELASTIC_URL,
        {
          size: 10, // Limitando os resultados para os 10 documentos mais relevantes
          _source: ["ementa", "data_julgamento"], // Inclui tanto a ementa quanto a data de julgamento
          query: {
            match: { ementa: term }, // Filtra os documentos com base na pesquisa pela ementa
          },
          sort: [{ data_julgamento: { order: "desc" } }], // Ordena os documentos pela data de julgamento mais recente
        },
        {
          headers: {
            Authorization: `ApiKey ${ELASTIC_TOKEN}`, // Inclui o token de autenticação na requisição
            "Content-Type": "application/json", // Define o tipo de conteúdo da requisição
          },
        }
      );

      const documents = response.data.hits.hits.map((hit: any) => hit._source);

      // Retorna diretamente os documentos conforme a estrutura necessária, sem a extração manual
      return documents;
    } catch (error) {
      // Em caso de erro, loga o erro e lança uma exceção
      console.error("Error fetching documents:", error);
      throw new Error("Failed to fetch documents");
    }
  }

  // Método para criar um histograma utilizando D3.js
  public async createHistogram(term: string): Promise<void> {
    // Example data (replace with real search data)
    const frequencies = [10, 20, 30, 40, 50]; // Example frequency data for the histogram

    // Fetching documents based on the term
    const documents: any[] = await this.searchDocuments(term);

    // Extract dates of judgment and convert them to Date objects
    const data = documents
      .map((doc: any) => new Date(doc.data_julgamento))
      .filter((date) => !isNaN(date.getTime())); // Filter out invalid dates

    // Simulated DOM using jsdom
    const dom = new JSDOM(`<html><body><svg></svg></body></html>`);
    const document = dom.window.document;

    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3
      .select(document.querySelector("svg"))
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleTime()
      .domain([d3.min(data) as Date, d3.max(data) as Date])
      .range([0, width]);

    const timestamps = data.map((d: Date) => d.getTime());

    const bins = d3
      .histogram()
      .value((d: number) => d)
      .domain([d3.min(timestamps) ?? 0, d3.max(timestamps) ?? 0])
      .thresholds(x.ticks(d3.timeMonth).map((d) => d.getTime()))(timestamps);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(bins, (bin) => bin.length) ?? 0])
      .range([height, 0]);

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    svg.append("g").call(d3.axisLeft(y));

    svg
      .selectAll(".bar")
      .data(bins)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.x0 ?? 0))
      .attr("y", (d) => y(d.length))
      .attr("width", (d) => x(d.x1 ?? 0) - x(d.x0 ?? 0) - 1)
      .attr("height", (d) => height - y(d.length))
      .attr("fill", "steelblue");

    svg
      .selectAll(".label")
      .data(bins)
      .enter()
      .append("text")
      .attr("x", (d) => x(d.x0 ?? 0) + (x(d.x1 ?? 0) - x(d.x0 ?? 0)) / 2)
      .attr("y", (d) => y(d.length) - 5)
      .attr("text-anchor", "middle")
      .text((d) => d.length);

    // Convert the SVG content to a string
    const svgContent = dom.window.document.querySelector("svg")?.outerHTML;

    if (svgContent) {
      // Write the SVG content to a file
      fs.writeFileSync("histogram.svg", svgContent); // Save to the current directory with the name 'histogram.svg'
      console.log("SVG file saved as 'histogram.svg'");
    } else {
      console.error("Failed to generate SVG content");
    }
  }
}
