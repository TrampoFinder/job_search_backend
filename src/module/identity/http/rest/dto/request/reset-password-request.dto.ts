import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsString({ message: 'Must be a string' })
  password: string;
  @IsNotEmpty()
  @IsString({ message: 'Must be a string' })
  recoveryCode: string;
}
