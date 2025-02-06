import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInRequestDto {
  @IsString({ message: 'Must be a string' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString({ message: 'Must be a string' })
  @IsNotEmpty()
  password: string;
}
