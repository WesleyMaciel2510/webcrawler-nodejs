import { Request, Response } from "express";
import { RelatoresService } from "../services/relatoresService";

export class RelatoresController {
  private relatoresService: RelatoresService = new RelatoresService();

  constructor() {
    this.relatoresService = new RelatoresService();
  }

  public getRelatores = async (req: Request, res: Response): Promise<void> => {
    try {
      const relatores = await this.relatoresService.getRelatores();
      res.json({
        success: true,
        count: relatores.length,
        data: relatores,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Erro ao buscar relatores",
      });
    }
  };
}

export const relatoresController = new RelatoresController();
