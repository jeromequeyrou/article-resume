import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorFormatInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorFormatInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(error => {
        if (error instanceof BadRequestException) {
          const response = error.getResponse() as any;
          
          this.logger.debug(`Error response in interceptor: ${JSON.stringify(response)}`);
          
          if (response && typeof response === 'object' && response.errors) {
            this.logger.debug(`Using existing structured error format`);
            return throwError(() => error);
          }
          
          if (response && response.message) {
            let formattedErrors: Record<string, string[]> = {};
            
            if (Array.isArray(response.message)) {
              formattedErrors = { general: response.message };
              this.logger.debug(`Formatted array message: ${JSON.stringify(formattedErrors)}`);
            } else if (typeof response.message === 'object') {
              formattedErrors = response.message;
              this.logger.debug(`Formatted object message: ${JSON.stringify(formattedErrors)}`);
            } else {
              formattedErrors = { general: [response.message] };
              this.logger.debug(`Formatted simple message: ${JSON.stringify(formattedErrors)}`);
            }
            
            const formattedError = new BadRequestException({
              message: 'Erreur de validation',
              errors: formattedErrors,
            });
            
            this.logger.debug(`Created formatted error: ${JSON.stringify(formattedError.getResponse())}`);
            return throwError(() => formattedError);
          }
        }
        
        return throwError(() => error);
      }),
    );
  }
} 