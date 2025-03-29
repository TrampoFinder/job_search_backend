import { IsString, IsNotEmpty } from 'class-validator';

export class RecoveryPasswordDto {
  @IsString()
  @IsNotEmpty()
  email: string;
}
