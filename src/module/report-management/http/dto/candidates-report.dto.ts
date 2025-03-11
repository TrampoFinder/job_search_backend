import { DefaultPaginationDto } from '@sharedModule/integration/http/rest/controller/dto/default-pagination.dto';
import { Expose, Type } from 'class-transformer';
import { IsNumber, IsString, ValidateNested } from 'class-validator';

export class JobApplicationStatusDto {
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

class CandidateReportDto {
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

export class CandidatesReportDto extends DefaultPaginationDto {
  @Expose()
  data: CandidateReportDto[];
}
