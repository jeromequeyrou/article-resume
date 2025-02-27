import { User } from '../entities/user.entity';

export interface IUserRepository {
  findById(id: string): Promise<User>;
  findAll(): Promise<User[]>;
  save(user: User): Promise<User>;
  update(id: string, user: User): Promise<User>;
  delete(id: string): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
} 