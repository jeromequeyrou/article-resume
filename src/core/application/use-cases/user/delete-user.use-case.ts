import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { INJECTION_TOKENS } from '../../../constants/injection-tokens';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(INJECTION_TOKENS.USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string): Promise<void> {
    await this.userRepository.findById(id);
    
    await this.userRepository.delete(id);
  }
} 