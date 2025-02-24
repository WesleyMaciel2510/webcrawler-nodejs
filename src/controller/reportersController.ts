import { Request, Response } from "express";
import { ReportersService } from "../services/reportersService";

export class ReportersController {
  private reportersService: ReportersService = new ReportersService();

  constructor() {
    this.reportersService = new ReportersService();
  }

  public getReporters = async (req: Request, res: Response): Promise<void> => {
    try {
      const reporters = await this.reportersService.getReporters();
      res.json({
        success: true,
        count: reporters.length,
        data: reporters,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: `Error fetching reporters: ${error.message}`,	
      });
    }
  };
}

export const reportersController = new ReportersController();
