import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { UserRole } from '../../user/schemas/user.schema';

export class SignupDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'john@school.com', description: 'User email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Password' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.STUDENT,
    description: 'Role of the user',
  })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;

  @ApiPropertyOptional({
    example: '10-A',
    description: 'Class (students only)',
  })
  @IsOptional()
  @IsString()
  class?: string;

  @ApiPropertyOptional({
    example: '101',
    description: 'Roll number (students)',
  })
  @IsOptional()
  @IsString()
  rollNumber?: string;

  @ApiPropertyOptional({
    example: ['Math', 'Science'],
    description: 'Subjects (teachers only)',
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subjects?: string[];

  @ApiPropertyOptional({
    example: 'Mathematics',
    description: 'Department (teachers only)',
  })
  @IsOptional()
  @IsString()
  department?: string;
}
