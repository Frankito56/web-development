import { Request, Response } from 'express';
import {
  GetBooksUseCase,
  GetBookByIdUseCase,
  ImportBookUseCase,
  UpdateBookInventoryUseCase,
} from '../../application/use-cases/BookUseCases';
import { AvailabilityStatus } from '../../domain/types';

export class BookController {
  constructor(
    private readonly getBooksUseCase: GetBooksUseCase,
    private readonly getBookByIdUseCase: GetBookByIdUseCase,
    private readonly importBookUseCase: ImportBookUseCase,
    private readonly updateInventoryUseCase: UpdateBookInventoryUseCase,
  ) {}

  getAll = async (req: Request, res: Response): Promise<void> => {
    const { search, subject, availabilityStatus, page, limit, sortBy, sortDir } = req.query;

    const result = await this.getBooksUseCase.execute({
      search: search ? String(search) : undefined,
      subject: subject ? String(subject) : undefined,
      availabilityStatus: availabilityStatus ? (String(availabilityStatus) as AvailabilityStatus) : undefined,
      page: page ? parseInt(String(page), 10) : undefined,
      limit: limit ? parseInt(String(limit), 10) : undefined,
      sortBy: (sortBy as 'title' | 'publishYear' | 'authors') || undefined,
      sortDir: (sortDir as 'asc' | 'desc') || undefined,
    });

    res.json({ success: true, data: result });
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    const book = await this.getBookByIdUseCase.execute(String(req.params.id));
    res.json({ success: true, data: book });
  };

  importFromOpenLibrary = async (req: Request, res: Response): Promise<void> => {
    const book = await this.importBookUseCase.execute(req.body);
    res.status(201).json({ success: true, data: book });
  };

  updateInventory = async (req: Request, res: Response): Promise<void> => {
    const book = await this.updateInventoryUseCase.execute(String(req.params.id), req.body);
    res.json({ success: true, data: book });
  };
}
