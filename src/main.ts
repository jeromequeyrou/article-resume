import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException, Logger } from '@nestjs/common';
import { ValidationExceptionFilter } from './infrastructure/filters/validation.exception.filter';
import { HttpExceptionFilter } from './infrastructure/filters/http-exception.filter';
import { ValidationError } from 'class-validator';
import { ErrorFormatInterceptor } from './infrastructure/interceptors/error-format.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  const logger = new Logger('Bootstrap');
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      stopAtFirstError: false,
      exceptionFactory: (errors: ValidationError[]) => {
        logger.debug(`Validation errors: ${JSON.stringify(errors)}`);
        
        const formattedErrors: Record<string, string[]> = {};
        
        errors.forEach(error => {
          const property = error.property;
          
          if (error.constraints) {
            formattedErrors[property] = Object.values(error.constraints);
            logger.debug(`Error for ${property}: ${JSON.stringify(error.constraints)}`);
          }
          
          if (error.children && error.children.length > 0) {
            processChildErrors(error.children, property, formattedErrors);
          }
        });
        
        logger.debug(`Formatted errors: ${JSON.stringify(formattedErrors)}`);
        
        return new BadRequestException({
          message: 'Erreur de validation',
          errors: formattedErrors,
        });
      },
    }),
  );
  
  app.useGlobalInterceptors(new ErrorFormatInterceptor());
  app.useGlobalFilters(
    new ValidationExceptionFilter(),
    new HttpExceptionFilter(),
  );
  
  await app.listen(3000, '0.0.0.0');
  logger.log(`Application started on port 3000`);
}

function processChildErrors(
  children: ValidationError[],
  parentProperty: string,
  result: Record<string, string[]>
): void {
  children.forEach(child => {
    const property = `${parentProperty}.${child.property}`;
    
    if (child.constraints) {
      result[property] = Object.values(child.constraints);
    }
    
    if (child.children && child.children.length > 0) {
      processChildErrors(child.children, property, result);
    }
  });
}

bootstrap(); 