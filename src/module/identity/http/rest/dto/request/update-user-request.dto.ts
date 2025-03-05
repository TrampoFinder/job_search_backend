import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserRequestDto {
  @IsString({ message: 'Must be a string' })
  @IsOptional()
  firstName: string;

  @IsString({ message: 'Must be a string' })
  @IsOptional()
  lastName: string;

  @IsString({ message: 'Must be a string' })
  @IsEmail()
  @IsOptional()
  email: string;

  @IsString({ message: 'Must be a string' })
  @IsOptional()
  password: string;
}
