export interface UnitOfWorkContext {
  getSession(): unknown;
}

export interface UnitOfWorkPort {
  withTransaction<T>(work: (context: UnitOfWorkContext) => Promise<T>): Promise<T>;
}
