import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User as DomainUser } from '../../core/domain/entities/user.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  toDomain(): DomainUser {
    return new DomainUser(this.id, this.email, this.name);
  }

  static fromDomain(user: DomainUser): UserEntity {
    const entity = new UserEntity();
    entity.id = user.getId();
    entity.email = user.getEmail();
    entity.name = user.getName();
    return entity;
  }
} 