import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { User } from '../../../domain/entities/user.entity';
import { IUserRepository } from '../../../domain/repositories/user.repository.interface';
import { CreateUserDto } from '../../dtos/user.dto';
import { INJECTION_TOKENS } from '../../../constants/injection-tokens';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(INJECTION_TOKENS.USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(createUserDto: CreateUserDto): Promise<User> {
    const { email, name } = createUserDto;

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictException(`Un utilisateur avec l'email ${email} existe déjà`);
    }

    const id = uuidv4();
    const user = new User(id, email, name);

    return this.userRepository.save(user);
  }
} 