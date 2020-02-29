export type IInMemoryRepository<T> = {
  get: (partId: string) => T | undefined;
  set: (value: T, key?: string) => void;
}