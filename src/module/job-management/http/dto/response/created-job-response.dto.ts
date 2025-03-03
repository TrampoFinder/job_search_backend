import { Expose } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateJobResponseDto {
  @Expose()
  @IsNotEmpty()
  @IsString({ message: 'Must be a string' })
  title: string;

  @Expose()
  @IsNotEmpty()
  @IsString({ message: 'Must be a string' })
  company: string;

  @Expose()
  @IsNotEmpty()
  @IsUrl({ require_protocol: true }, { message: 'URL is not a valid.' })
  url: string;

  @Expose()
  @IsNotEmpty()
  @IsString({ message: 'Must be a string' })
  location: string;

  @Expose()
  @IsNotEmpty()
  @IsString({ message: 'Must be a string' })
  status: string;

  @Expose()
  @IsDate()
  createdAt: Date;

  @Expose()
  @IsDate()
  updatedAt: Date;

  @Expose()
  @IsOptional()
  @IsDate()
  deletedAt: Date | null;
}
