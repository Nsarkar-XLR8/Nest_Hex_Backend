export interface DomainExceptionOptions {
  type: string;
  title: string;
  status: number;
  detail?: string;
  meta?: Record<string, unknown>;
}

export class DomainException extends Error {
  readonly type: string;
  readonly title: string;
  readonly status: number;
  readonly detail?: string;
  readonly meta?: Record<string, unknown>;

  constructor(options: DomainExceptionOptions) {
    super(options.detail ?? options.title);
    this.type = options.type;
    this.title = options.title;
    this.status = options.status;
    this.detail = options.detail;
    this.meta = options.meta;
  }
}
