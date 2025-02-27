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
          
          // Log pour déboguer
          this.logger.debug(`Error response in interceptor: ${JSON.stringify(response)}`);
          
          // Si l'erreur contient déjà un format structuré, ne pas la modifier
          if (response && typeof response === 'object' && response.errors) {
            this.logger.debug(`Using existing structured error format`);
            return throwError(() => error);
          }
          
          // Formater les erreurs de validation
          if (response && response.message) {
            let formattedErrors: Record<string, string[]> = {};
            
            if (Array.isArray(response.message)) {
              // Format standard de NestJS pour les erreurs de validation
              formattedErrors = { general: response.message };
              this.logger.debug(`Formatted array message: ${JSON.stringify(formattedErrors)}`);
            } else if (typeof response.message === 'object') {
              // Format personnalisé
              formattedErrors = response.message;
              this.logger.debug(`Formatted object message: ${JSON.stringify(formattedErrors)}`);
            } else {
              // Message simple
              formattedErrors = { general: [response.message] };
              this.logger.debug(`Formatted simple message: ${JSON.stringify(formattedErrors)}`);
            }
            
            // Créer une nouvelle exception avec le format d'erreur structuré
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