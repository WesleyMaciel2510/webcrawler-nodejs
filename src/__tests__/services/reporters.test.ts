import axios from "axios";
import { ReportersService } from "../../services/reportersService";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("ReportersService", () => {
  let service: ReportersService;

  beforeEach(() => {
    service = new ReportersService();
  });

  it("deve retornar uma lista ordenada de reporters únicos", async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        hits: {
          hits: [
            { _source: { relator: "João" } }, // Campo correto: 'relator'
            { _source: { relator: "Maria" } }, // Campo correto: 'relator'
            { _source: { relator: "Ana" } }, // Campo correto: 'relator'
          ],
        },
      },
    } as unknown as { data: { hits: { hits: { _source: { relator: string } }[] } } });

    const result = await service.getReporters();

    expect(result).toEqual(["Ana", "João", "Maria"]); // Ordem alfabética e sem duplicatas
  });
});