import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Une erreur interne est survenue';
    let error = 'Internal Server Error';
    let errors = {};

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse() as any;
      
      this.logger.debug(`HttpException response: ${JSON.stringify(exceptionResponse)}`);
      
      message = exceptionResponse.message || exception.message;
      error = exceptionResponse.error || HttpException.name;
      
      if (exceptionResponse.errors) {
        errors = exceptionResponse.errors;
        this.logger.debug(`Detailed errors: ${JSON.stringify(errors)}`);
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
      
      this.logger.error(
        `${request.method} ${request.url}`,
        exception.stack,
        'HttpExceptionFilter',
      );
    } else {
      this.logger.error(
        `${request.method} ${request.url}`,
        JSON.stringify(exception),
        'HttpExceptionFilter',
      );
    }

    if (status === HttpStatus.INTERNAL_SERVER_ERROR && process.env.NODE_ENV === 'production') {
      message = 'Une erreur interne est survenue';
      errors = {};
    }

    response.status(status).json({
      statusCode: status,
      message,
      error,
      errors,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
} 