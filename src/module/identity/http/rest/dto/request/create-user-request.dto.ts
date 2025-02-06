import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserRequestDto {
  @IsString({ message: 'Must be a string' })
  @IsNotEmpty()
  firstName: string;

  @IsString({ message: 'Must be a string' })
  @IsNotEmpty()
  lastName: string;

  @IsString({ message: 'Must be a string' })
  @IsNotEmpty()
  username: string;

  @IsString({ message: 'Must be a string' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString({ message: 'Must be a string' })
  @IsNotEmpty()
  password: string;
}
