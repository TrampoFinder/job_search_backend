import { JobApplicationProcessType } from '@jobManagementModule/core/model/job-application.model';
import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateJobApplicationRequestDto {
  @IsOptional()
  @IsString({ message: 'Must be a string' })
  // @Transform(({ value }) => value.toUpperCase())
  // @IsIn(Object.values(JobApplicationProcessType))
  status: JobApplicationProcessType;

  @IsOptional()
  @IsString({ message: 'Must be a string' })
  note: string | null;
}
