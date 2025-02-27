import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { 
    message: 'L\'adresse email fournie n\'est pas valide. Veuillez entrer une adresse email correcte (ex: utilisateur@domaine.com)' 
  })
  @IsNotEmpty({ 
    message: 'L\'email est obligatoire. Veuillez fournir une adresse email' 
  })
  readonly email: string;

  @IsString({ 
    message: 'Le nom doit être une chaîne de caractères' 
  })
  @IsNotEmpty({ 
    message: 'Le nom est obligatoire. Veuillez fournir un nom' 
  })
  @MinLength(2, { 
    message: 'Le nom doit contenir au moins 2 caractères. Votre saisie est trop courte' 
  })
  readonly name: string;
}

export class UpdateUserDto {
  @IsEmail({}, { 
    message: 'L\'adresse email fournie n\'est pas valide. Veuillez entrer une adresse email correcte (ex: utilisateur@domaine.com)' 
  })
  @IsOptional()
  readonly email?: string;

  @IsString({ 
    message: 'Le nom doit être une chaîne de caractères' 
  })
  @IsOptional()
  @MinLength(2, { 
    message: 'Le nom doit contenir au moins 2 caractères. Votre saisie est trop courte' 
  })
  readonly name?: string;
}

export class UserResponseDto {
  readonly id: string;
  readonly email: string;
  readonly name: string;

  constructor(id: string, email: string, name: string) {
    this.id = id;
    this.email = email;
    this.name = name;
  }

  static fromDomain(user: any): UserResponseDto {
    return new UserResponseDto(
      user.getId(),
      user.getEmail(),
      user.getName(),
    );
  }
} 