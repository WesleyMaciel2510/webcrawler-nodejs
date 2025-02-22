import axios from "axios";
import { RelatoresService } from "../../services/relatoresService";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("RelatoresService", () => {
  let service: RelatoresService;

  beforeEach(() => {
    service = new RelatoresService();
  });

  it("should return a sorted list of unique relatores", async () => {
    mockedAxios.post.mockResolvedValue({
      data: {
        hits: {
          hits: [
            { _source: { relator: "João" } },
            { _source: { relator: "Maria" } },
            { _source: { relator: "João" } }, // Duplicado para testar remoção
            { _source: { relator: "Ana" } },
          ],
        },
      },
    } as unknown as { data: { hits: { hits: { _source: { relator: string } }[] } } });

    const result = await service.getRelatores();

    expect(result).toEqual(["Ana", "João", "Maria"]); // Ordem alfabética e sem duplicatas
  });
});
