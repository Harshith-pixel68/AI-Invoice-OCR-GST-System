import { Invoice } from '../models.js';

export interface IInvoiceRepository {
  getAll(): Promise<Invoice[]>;
  getById(id: string): Promise<Invoice | null>;
  saveAll(invoices: Invoice[]): Promise<void>;
  add(invoice: Invoice): Promise<void>;
  update(id: string, invoice: Invoice): Promise<void>;
}
