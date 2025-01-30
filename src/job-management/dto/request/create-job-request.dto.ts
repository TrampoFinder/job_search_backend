import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateJobRequestDto {
  @IsNotEmpty()
  @IsString({ message: 'Must be a string' })
  title: string;

  @IsNotEmpty()
  @IsString({ message: 'Must be a string' })
  description: string;

  @IsNotEmpty()
  @IsUrl({ require_protocol: true }, { message: 'URL is not a valid.' })
  url: string;
}
