import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserController } from './infrastructure/controllers/user.controller';
import { UserRepository } from './infrastructure/repositories/user.repository';
import { GetUserUseCase } from './core/application/use-cases/user/get-user.use-case';
import { GetAllUsersUseCase } from './core/application/use-cases/user/get-all-users.use-case';
import { CreateUserUseCase } from './core/application/use-cases/user/create-user.use-case';
import { UpdateUserUseCase } from './core/application/use-cases/user/update-user.use-case';
import { DeleteUserUseCase } from './core/application/use-cases/user/delete-user.use-case';
import { INJECTION_TOKENS } from './core/constants/injection-tokens';
import { UserEntity } from './infrastructure/entities/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB'),
        entities: [UserEntity],
        migrations: ['dist/infrastructure/migrations/*.js'],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([UserEntity]),
  ],
  controllers: [UserController],
  providers: [
    GetUserUseCase,
    GetAllUsersUseCase,
    CreateUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    {
      provide: INJECTION_TOKENS.USER_REPOSITORY,
      useClass: UserRepository,
    },
  ],
})
export class AppModule {} 