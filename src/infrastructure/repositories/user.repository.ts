import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../core/domain/entities/user.entity';
import { IUserRepository } from '../../core/domain/repositories/user.repository.interface';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findById(id: string): Promise<User> {
    const userEntity = await this.userRepository.findOne({ where: { id } });
    if (!userEntity) {
      throw new NotFoundException(`Utilisateur avec l'id ${id} non trouvé`);
    }
    return userEntity.toDomain();
  }

  async findAll(): Promise<User[]> {
    const userEntities = await this.userRepository.find();
    return userEntities.map(entity => entity.toDomain());
  }

  async save(user: User): Promise<User> {
    const userEntity = UserEntity.fromDomain(user);
    const savedEntity = await this.userRepository.save(userEntity);
    return savedEntity.toDomain();
  }

  async update(id: string, user: User): Promise<User> {
    await this.findById(id);
    
    const userEntity = UserEntity.fromDomain(user);
    await this.userRepository.update(id, userEntity);
    
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Utilisateur avec l'id ${id} non trouvé`);
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const userEntity = await this.userRepository.findOne({ where: { email } });
    return userEntity ? userEntity.toDomain() : null;
  }
} 