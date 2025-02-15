import { Expose } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UserResponseDto {
  @IsUUID(4)
  @Expose()
  id: string;

  @IsString({ message: 'Must be a string' })
  @Expose()
  firstName: string;

  @IsString({ message: 'Must be a string' })
  @Expose()
  lastName: string;

  @IsString({ message: 'Must be a string' })
  @IsEmail()
  @Expose()
  email: string;

  @IsBoolean({ message: 'Must be a boolean' })
  @Expose()
  isActive: boolean;

  @IsString({ message: 'Must be a string' })
  @Expose()
  role: string;

  @IsDate({ message: 'Must be a date' })
  @Expose()
  createdAt: Date;

  @IsDate({ message: 'Must be a date' })
  @Expose()
  updatedAt: Date;

  @IsOptional()
  @IsDate({ message: 'Must be a date' })
  @Expose()
  deletedAt: Date | null;
}
