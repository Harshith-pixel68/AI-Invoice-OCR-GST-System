import { IVendorRepository } from '../core/ports/IVendorRepository.js';
import { IStorageProvider } from '../core/ports/IStorageProvider.js';
import { Vendor } from '../core/models.js';
import { recalculateVendors } from './mockData.js';

export class JsonVendorRepository implements IVendorRepository {
  private storage: IStorageProvider;
  private readonly storageKey = 'vendors';

  constructor(storageProvider: IStorageProvider) {
    this.storage = storageProvider;
  }

  async getAll(): Promise<Vendor[]> {
    let vendors = await this.storage.read<Vendor[]>(this.storageKey);
    if (!vendors) {
      const invoices = await this.storage.read<any[]>('invoices');
      if (invoices) {
        vendors = recalculateVendors(invoices);
        await this.saveAll(vendors);
      } else {
        vendors = [];
      }
    }
    return vendors;
  }

  async saveAll(vendors: Vendor[]): Promise<void> {
    await this.storage.write<Vendor[]>(this.storageKey, vendors);
  }
}
