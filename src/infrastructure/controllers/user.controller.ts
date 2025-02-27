import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Param, 
  Body, 
  NotFoundException, 
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { GetUserUseCase } from '../../core/application/use-cases/user/get-user.use-case';
import { GetAllUsersUseCase } from '../../core/application/use-cases/user/get-all-users.use-case';
import { CreateUserUseCase } from '../../core/application/use-cases/user/create-user.use-case';
import { UpdateUserUseCase } from '../../core/application/use-cases/user/update-user.use-case';
import { DeleteUserUseCase } from '../../core/application/use-cases/user/delete-user.use-case';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from '../../core/application/dtos/user.dto';

@Controller('users')
export class UserController {
  constructor(
    private readonly getUserUseCase: GetUserUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase
  ) {}

  @Get()
  async getAllUsers(): Promise<UserResponseDto[]> {
    const users = await this.getAllUsersUseCase.execute();
    return users.map(user => UserResponseDto.fromDomain(user));
  }

  @Get(':id')
  async getUser(@Param('id') id: string): Promise<UserResponseDto> {
    try {
      const user = await this.getUserUseCase.execute(id);
      return UserResponseDto.fromDomain(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new NotFoundException(`Utilisateur avec l'id ${id} non trouvé`);
    }
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.createUserUseCase.execute(createUserDto);
    return UserResponseDto.fromDomain(user);
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string, 
    @Body() updateUserDto: UpdateUserDto
  ): Promise<UserResponseDto> {
    const user = await this.updateUserUseCase.execute(id, updateUserDto);
    return UserResponseDto.fromDomain(user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string): Promise<void> {
    await this.deleteUserUseCase.execute(id);
  }
} 