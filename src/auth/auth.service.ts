import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import type {
  ILoginParams,
  ISignupParams,
  IAuthResponse,
} from './Interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async signup(payload: ISignupParams): Promise<IAuthResponse> {
    const user = await this.userService.create(payload);
    const token = await this.jwtService.signAsync({
      sub: String(user._id),
      email: user.email,
      role: user.role,
    });
    return {
      access_token: token,
      user: {
        _id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        class: user.class,
        rollNumber: user.rollNumber,
        subjects: user.subjects,
        department: user.department,
      },
    };
  }

  async login(body: ILoginParams): Promise<IAuthResponse> {
    const user = await this.userService.validateCredentials(
      body.email,
      body.password,
    );
    const token = await this.jwtService.signAsync({
      sub: String(user._id),
      email: user.email,
      role: user.role,
    });
    return {
      access_token: token,
      user: {
        _id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        class: user.class,
        rollNumber: user.rollNumber,
        subjects: user.subjects,
        department: user.department,
      },
    };
  }
}
