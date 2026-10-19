import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IHasher } from '../services/IHasher';
import { ITokenService } from '../services/ITokenService';
import { RegisterUserDTO, LoginDTO, AuthResponseDTO } from '../dtos';
import { ConflictError, InvalidCredentialsError, NotFoundError } from '../../domain/errors/DomainErrors';
import { UserPublic } from '../../domain/entities/UserEntity';

export class RegisterUserUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly hasher: IHasher,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(dto: RegisterUserDTO): Promise<AuthResponseDTO> {
    const existingEmail = await this.userRepo.findByEmail(dto.email);
    if (existingEmail) {
      throw new ConflictError('An account with this email already exists.');
    }

    const existingId = await this.userRepo.findByStudentOrEmployeeId(dto.studentOrEmployeeId);
    if (existingId) {
      throw new ConflictError('An account with this student or employee ID already exists.');
    }

    const passwordHash = await this.hasher.hash(dto.password);

    const user = await this.userRepo.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
      role: dto.role ?? 'STUDENT',
      studentOrEmployeeId: dto.studentOrEmployeeId,
      department: dto.department,
      avatarUrl: dto.avatarUrl,
    });

    const token = this.tokenService.sign({ userId: user.id, role: user.role });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        studentOrEmployeeId: user.studentOrEmployeeId,
        department: user.department,
        avatarUrl: user.avatarUrl,
      },
    };
  }
}

export class LoginUserUseCase {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly hasher: IHasher,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(dto: LoginDTO): Promise<AuthResponseDTO> {
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const valid = await this.hasher.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new InvalidCredentialsError();
    }

    const token = this.tokenService.sign({ userId: user.id, role: user.role });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        studentOrEmployeeId: user.studentOrEmployeeId,
        department: user.department,
        avatarUrl: user.avatarUrl,
      },
    };
  }
}

export class GetUserProfileUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(userId: string): Promise<UserPublic> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }
    const { passwordHash: _, ...publicProfile } = user;
    return publicProfile;
  }
}

export class UpdateUserProfileUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(
    userId: string,
    input: { name?: string; department?: string; avatarUrl?: string }
  ): Promise<UserPublic> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }
    const updated = await this.userRepo.update(userId, input);
    const { passwordHash: _, ...publicProfile } = updated;
    return publicProfile;
  }
}

