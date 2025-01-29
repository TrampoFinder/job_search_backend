import { IsString, IsUrl } from 'class-validator';

export class CreateJobRequestDto {
  @IsString({ message: 'Must be a string' })
  title: string;

  @IsString({ message: 'Must be a string' })
  description: string;

  @IsUrl({ require_protocol: true }, { message: 'URL is not a valid.' })
  url: string;
}
