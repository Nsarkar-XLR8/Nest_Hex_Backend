import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { DomainException } from '../exceptions/domain.exception';

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof DomainException) {
      const problem = {
        type: exception.type,
        title: exception.title,
        status: exception.status,
        detail: exception.detail ?? exception.message,
        instance: request.originalUrl,
        ...(exception.meta ? { meta: exception.meta } : {}),
      };

      response
        .status(exception.status)
        .setHeader('Content-Type', 'application/problem+json')
        .json(problem);
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const responseBody = exception.getResponse() as {
        message?: string[] | string;
        error?: string;
      };
      const validationErrors =
        Array.isArray(responseBody?.message) ? responseBody.message : undefined;
      const detail =
        typeof responseBody?.message === 'string'
          ? responseBody.message
          : exception.message;

      const problem = {
        type: 'about:blank',
        title: responseBody?.error ?? exception.name,
        status,
        detail,
        instance: request.originalUrl,
        ...(validationErrors ? { meta: { errors: validationErrors } } : {}),
      };

      response
        .status(status)
        .setHeader('Content-Type', 'application/problem+json')
        .json(problem);
      return;
    }

    this.logger.error('Unhandled exception', exception as Error);
    response
      .status(500)
      .setHeader('Content-Type', 'application/problem+json')
      .json({
        type: 'about:blank',
        title: 'Internal Server Error',
        status: 500,
        detail: 'An unexpected error occurred',
        instance: request.originalUrl,
      });
  }
}
