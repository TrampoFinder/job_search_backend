import { Transform, TransformFnParams } from 'class-transformer';
import { IsNotEmpty, IsString, IsUrl } from 'class-validator';
import sanitizeHtml from 'sanitize-html';

export class CreateJobRequestDto {
  @IsNotEmpty()
  @IsString({ message: 'Must be a string' })
  title: string;

  @IsNotEmpty()
  @IsString({ message: 'Must be a string' })
  company: string;

  @IsNotEmpty()
  @IsUrl({ require_protocol: true }, { message: 'URL is not a valid.' })
  url: string;

  @IsNotEmpty()
  @IsString({ message: 'Must be a string' })
  location: string;
}
