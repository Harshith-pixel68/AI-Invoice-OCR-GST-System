import { IInvoiceRepository } from '../core/ports/IInvoiceRepository.js';
import { IStorageProvider } from '../core/ports/IStorageProvider.js';
import { Invoice } from '../core/models.js';
import { generateMockInvoices, recalculateVendors } from './mockData.js';

export class JsonInvoiceRepository implements IInvoiceRepository {
  private storage: IStorageProvider;
  private readonly storageKey = 'invoices';

  constructor(storageProvider: IStorageProvider) {
    this.storage = storageProvider;
  }

  async getAll(): Promise<Invoice[]> {
    let invoices = await this.storage.read<Invoice[]>(this.storageKey);
    if (!invoices) {
      // Seed with mock data
      invoices = generateMockInvoices();
      await this.saveAll(invoices);
    }
    return invoices;
  }

  async getById(id: string): Promise<Invoice | null> {
    const invoices = await this.getAll();
    return invoices.find(inv => inv.id === id) || null;
  }

  async saveAll(invoices: Invoice[]): Promise<void> {
    await this.storage.write<Invoice[]>(this.storageKey, invoices);
    // Auto-recalculate and save vendors in storage to keep synced
    const vendors = recalculateVendors(invoices);
    await this.storage.write('vendors', vendors);
  }

  async add(invoice: Invoice): Promise<void> {
    const invoices = await this.getAll();
    invoices.unshift(invoice);
    await this.saveAll(invoices);
  }

  async update(id: string, invoice: Invoice): Promise<void> {
    const invoices = await this.getAll();
    const idx = invoices.findIndex(inv => inv.id === id);
    if (idx !== -1) {
      invoices[idx] = invoice;
      await this.saveAll(invoices);
    }
  }
}
