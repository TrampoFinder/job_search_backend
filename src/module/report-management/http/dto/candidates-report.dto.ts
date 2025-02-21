import { Expose, Type } from 'class-transformer';
import { IsNumber, IsString, ValidateNested } from 'class-validator';

class JobApplicationStatusDto {
  @Expose()
  @IsNumber()
  IN_PROGRESS: number;
  @Expose()
  @IsNumber()
  APPROVED: number;
  @Expose()
  @IsNumber()
  APPLIED: number;
  @Expose()
  @IsNumber()
  REJECTED: number;
  @Expose()
  @IsNumber()
  CLOSED: number;
  @Expose()
  @IsNumber()
  NOT_PROCESSING: number;
}

export class CandidatesReportDto {
  @Expose()
  @IsString()
  userId: string;
  @Expose()
  @IsString()
  fullName: string;
  @Expose()
  @IsNumber()
  totalApplications: number;
  @Expose()
  @IsNumber()
  activeProcessCount: number;
  @Expose()
  @ValidateNested()
  @Type(() => JobApplicationStatusDto)
  statusCount: JobApplicationStatusDto;
}
