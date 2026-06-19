import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const { method, originalUrl } = request;
    const requestId = (request as Request & { requestId?: string }).requestId;
    const startedAt = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startedAt;
        const statusCode = response?.statusCode;
        this.logger.log(
          JSON.stringify({
            level: 'info',
            message: 'request.completed',
            method,
            path: originalUrl,
            statusCode,
            durationMs: duration,
            requestId,
          }),
        );
      }),
      catchError((error) => {
        const duration = Date.now() - startedAt;
        const statusCode = response?.statusCode;
        this.logger.error(
          JSON.stringify({
            level: 'error',
            message: 'request.failed',
            method,
            path: originalUrl,
            statusCode,
            durationMs: duration,
            requestId,
            error: error instanceof Error ? error.message : String(error),
          }),
        );
        throw error;
      }),
    );
  }
}
