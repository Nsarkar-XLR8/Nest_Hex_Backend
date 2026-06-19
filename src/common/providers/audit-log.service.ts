import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger('Audit');

  log(event: string, meta: Record<string, unknown>): void {
    this.logger.log(JSON.stringify({ event, ...meta }));
  }
}
