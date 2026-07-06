import { Vendor } from '../models.js';

export interface IVendorRepository {
  getAll(): Promise<Vendor[]>;
  saveAll(vendors: Vendor[]): Promise<void>;
}
