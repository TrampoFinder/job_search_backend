import { JobApplicationProcessType } from '@jobManagementModule/core/model/job-application.model';
import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateJobApplicationRequestDto {
  @IsNotEmpty()
  @IsString({ message: 'Must be a string' })
  // @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
  title: string;

  @IsNotEmpty()
  @IsUrl({ require_protocol: true }, { message: 'URL is not a valid.' })
  // @Transform(({ value }) => value.replace(/[^a-zA-Z0-9\s.,!?@()=_/-]/g, ''))
  url: string;

  @IsOptional()
  @IsString({ message: 'Must be a string' })
  // @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
  status: JobApplicationProcessType | null;

  @IsOptional()
  @IsString({ message: 'Must be a string' })
  // @Transform((params: TransformFnParams) => sanitizeHtml(params.value))
  note: string | null;
}
