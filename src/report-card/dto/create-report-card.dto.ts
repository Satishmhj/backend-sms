import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class SubjectMarksDto {
  @ApiProperty({ example: 'Mathematics', description: 'Subject name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 85, minimum: 0, maximum: 100 })
  @IsInt()
  @Min(0)
  @Max(100)
  marks: number;
}

export class CreateReportCardDto {
  @ApiProperty({ example: '64b8f...', description: 'Student user ID' })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ example: '10-A' })
  @IsString()
  @IsNotEmpty()
  className: string;

  @ApiProperty({ example: 'First Term' })
  @IsString()
  @IsNotEmpty()
  term: string;

  @ApiProperty({ example: '2025-2026' })
  @IsString()
  @IsNotEmpty()
  academicYear: string;

  @ApiProperty({
    type: [SubjectMarksDto],
    description: 'List of subjects and marks',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SubjectMarksDto)
  subjects: SubjectMarksDto[];

  @ApiPropertyOptional({ example: 'Excellent performance. Keep it up!' })
  @IsOptional()
  @IsString()
  remarks?: string;
}
