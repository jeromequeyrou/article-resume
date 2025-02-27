import { Injectable, Inject } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { INJECTION_TOKENS } from '../../../constants/injection-tokens';

@Injectable()
export class GetAllUsersUseCase {
  constructor(
    @Inject(INJECTION_TOKENS.USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(): Promise<User[]> {
    return this.userRepository.findAll();
  }
} 