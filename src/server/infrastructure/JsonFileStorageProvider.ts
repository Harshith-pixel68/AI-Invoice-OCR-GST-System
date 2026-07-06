import fs from 'fs';
import path from 'path';
import { IStorageProvider } from '../core/ports/IStorageProvider.js';

export class JsonFileStorageProvider implements IStorageProvider {
  private filePath: string;
  private cache: Record<string, any> | null = null;

  constructor(filePath?: string) {
    this.filePath = filePath || path.join(process.cwd(), 'data', 'db.json');
    this.ensureDirectory();
  }

  private ensureDirectory() {
    const dir = path.dirname(this.filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private async load(): Promise<Record<string, any>> {
    if (this.cache) return this.cache;

    try {
      if (fs.existsSync(this.filePath)) {
        const content = await fs.promises.readFile(this.filePath, 'utf-8');
        this.cache = JSON.parse(content);
      } else {
        this.cache = {};
      }
    } catch (e) {
      console.error('Failed to read database file, initializing empty state:', e);
      this.cache = {};
    }
    return this.cache!;
  }

  private async save(): Promise<void> {
    if (!this.cache) return;
    try {
      this.ensureDirectory();
      await fs.promises.writeFile(this.filePath, JSON.stringify(this.cache, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write database file:', e);
      throw e;
    }
  }

  async read<T>(key: string): Promise<T | null> {
    const data = await this.load();
    return (data[key] as T) || null;
  }

  async write<T>(key: string, data: T): Promise<void> {
    const root = await this.load();
    root[key] = data;
    await this.save();
  }

  async clear(key: string): Promise<void> {
    const root = await this.load();
    delete root[key];
    await this.save();
  }

  // Force cache clearing (useful during DB reset)
  clearCache() {
    this.cache = null;
  }
}
export const defaultStorageProvider = new JsonFileStorageProvider();
