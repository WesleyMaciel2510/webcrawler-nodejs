import { Request, Response } from "express";
import { DocumentsService } from "../services/documentsService";

export class DocumentsController {
  private documentService: DocumentsService;

  constructor() {
    this.documentService = new DocumentsService();
  }

  public searchDocuments = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { searchTerm } = req.query;

      if (!searchTerm || typeof searchTerm !== "string") {
        res.status(400).json({
          success: false,
          error: "Missing or invalid 'searchTerm' query parameter",
        });
        return;
      }

      const documents = await this.documentService.searchDocuments(searchTerm);

      res.json({
        success: true,
        count: documents.length,
        data: documents,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: `Failed to search documents: ${(error as Error).message}`,
      });
    }
  };
}
export const documentsController = new DocumentsController();
