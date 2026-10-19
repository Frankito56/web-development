import bcrypt from 'bcryptjs';
import { IHasher } from '../../application/services/IHasher';

export class BcryptHasher implements IHasher {
  private readonly rounds: number;

  constructor(rounds = 10) {
    this.rounds = Number(process.env.BCRYPT_SALT_ROUNDS) || rounds;
  }

  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.rounds);
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed);
  }
}
