export class User {
  constructor(
    private readonly id: string,
    private readonly email: string,
    private readonly name: string,
  ) {}

  getId(): string {
    return this.id;
  }

  getEmail(): string {
    return this.email;
  }

  getName(): string {
    return this.name;
  }
} 