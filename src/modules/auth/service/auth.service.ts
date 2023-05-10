import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { IUser } from 'src/modules/users/interface/user.interface';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async generateJWT(user: IUser) {
    const signInOptions = user.roles.includes('super_admin' || 'admin')
      ? { expiresIn: '365d' }
      : { expiresIn: '30d' };
    return await this.jwtService.signAsync({ user }, signInOptions);
  }

  async comparePasswords(newPassword: string, passwordHash: string) {
    return await bcrypt.compare(newPassword, passwordHash);
  }

  async hashPassword(password: string) {
    return await bcrypt.hash(password, 12);
  }
}
