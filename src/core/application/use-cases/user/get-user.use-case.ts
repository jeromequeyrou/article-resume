import { Injectable, Inject } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';

@Injectable()
export class GetUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string): Promise<User> {
    return this.userRepository.findById(id);
  }
} 