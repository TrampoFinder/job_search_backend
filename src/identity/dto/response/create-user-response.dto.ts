import { Expose } from 'class-transformer';
import { IsBoolean, IsDate, IsEmail, IsString, IsUUID } from 'class-validator';

export class CreateUserRequestDto {
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
  @Expose()
  username: string;

  @IsString({ message: 'Must be a string' })
  @IsEmail()
  @Expose()
  email: string;

  @IsString({ message: 'Must be a string' })
  @Expose()
  password: string;

  @IsBoolean({ message: 'Must be a boolean' })
  @Expose()
  isActive: boolean;

  @IsBoolean({ message: 'Must be a boolean' })
  @Expose()
  role: string;

  @IsDate({ message: 'Must be a date' })
  @Expose()
  createdAt: Date;

  @IsDate({ message: 'Must be a date' })
  @Expose()
  updatedAt: Date;
}
