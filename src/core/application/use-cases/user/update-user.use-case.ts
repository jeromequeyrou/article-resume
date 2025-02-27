import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { UpdateUserDto } from '../../dtos/user.dto';
import { INJECTION_TOKENS } from '../../../constants/injection-tokens';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(INJECTION_TOKENS.USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findById(id);
    
    if (updateUserDto.email) {
      const userWithEmail = await this.userRepository.findByEmail(updateUserDto.email);
      if (userWithEmail && userWithEmail.getId() !== id) {
        throw new ConflictException(`Un utilisateur avec l'email ${updateUserDto.email} existe déjà`);
      }
    }

    const updatedUser = new User(
      id,
      updateUserDto.email || existingUser.getEmail(),
      updateUserDto.name || existingUser.getName(),
    );

    return this.userRepository.update(id, updatedUser);
  }
} 