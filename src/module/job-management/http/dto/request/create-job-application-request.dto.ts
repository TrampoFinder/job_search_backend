import { JobApplicationProcessType } from '@jobManagementModule/core/model/job-application.model';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateJobApplicationRequestDto {
  @IsNotEmpty()
  @IsString({ message: 'Must be a string' })
  title: string;

  @IsNotEmpty()
  @IsUrl({ require_protocol: true }, { message: 'URL is not a valid.' })
  url: string;

  @IsOptional()
  @IsString({ message: 'Must be a string' })
  status: JobApplicationProcessType | null;

  @IsOptional()
  @IsString({ message: 'Must be a string' })
  note: string | null;
}
