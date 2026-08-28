import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { JwtSignOptions } from '@nestjs/jwt';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      global: true,
      useFactory: (configService: ConfigService) => {
        const signOptions: JwtSignOptions = {
          expiresIn:
            (configService.get<string>('JWT_EXPIRES_IN') as
              JwtSignOptions['expiresIn'] | undefined) ?? ('18h' as const),
        };
        return {
          secret:
            configService.get<string>('JWT_SECRET') ??
            'SECRET_KEY_FOR_LOCAL_DEV',
          signOptions,
        };
      },
    }),
  ],
  providers: [AuthService, JwtAuthGuard],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
