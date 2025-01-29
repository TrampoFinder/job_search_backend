import { IsString, IsUrl } from 'class-validator';

export class CreateJobRequestDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  @IsUrl()
  url: string;
}
