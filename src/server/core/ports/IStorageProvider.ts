export interface IStorageProvider {
  read<T>(key: string): Promise<T | null>;
  write<T>(key: string, data: T): Promise<void>;
  clear(key: string): Promise<void>;
}
