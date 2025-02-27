import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ValidationError } from 'class-validator';

@Catch(BadRequestException)
export class ValidationExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ValidationExceptionFilter.name);

  catch(exception: BadRequestException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    this.logger.debug(`Exception response: ${JSON.stringify(exceptionResponse)}`);

    const responseBody = {
      statusCode: status,
      message: 'Erreur de validation',
      error: 'Bad Request',
      errors: {},
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    if (exceptionResponse && exceptionResponse.errors) {
      this.logger.debug(`Structured errors: ${JSON.stringify(exceptionResponse.errors)}`);
      responseBody.errors = exceptionResponse.errors;
    } else if (
      exceptionResponse &&
      (exceptionResponse.message instanceof Array || 
       (exceptionResponse.message && typeof exceptionResponse.message === 'object'))
    ) {
      const validationErrors = this.formatValidationErrors(exceptionResponse.message);
      this.logger.debug(`Formatted validation errors: ${JSON.stringify(validationErrors)}`);
      responseBody.errors = validationErrors;
    } else if (exceptionResponse && typeof exceptionResponse === 'object') {
      responseBody.message = exceptionResponse.message || 'Erreur de validation';
      if (exceptionResponse.error) {
        responseBody.error = exceptionResponse.error;
      }
    }

    return response.status(status).json(responseBody);
  }

  private formatValidationErrors(errors: any): Record<string, string[]> {
    if (errors instanceof Array && errors[0] instanceof ValidationError) {
      return this.formatValidationErrorArray(errors);
    }

    if (errors instanceof Array) {
      return { general: errors };
    }

    if (typeof errors === 'object') {
      return errors;
    }

    return { general: [errors.toString()] };
  }

  private formatValidationErrorArray(errors: ValidationError[]): Record<string, string[]> {
    const result: Record<string, string[]> = {};

    errors.forEach(error => {
      const property = error.property;
      const constraints = error.constraints;

      if (constraints) {
        result[property] = Object.values(constraints);
        this.logger.debug(`Validation error for property ${property}: ${JSON.stringify(constraints)}`);
      }

      if (error.children && error.children.length > 0) {
        const childErrors = this.formatValidationErrorArray(error.children);
        Object.keys(childErrors).forEach(key => {
          result[`${property}.${key}`] = childErrors[key];
        });
      }
    });

    return result;
  }
} 