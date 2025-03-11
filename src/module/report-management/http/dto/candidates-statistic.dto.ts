import { DefaultPaginationDto } from '@sharedModule/integration/http/rest/controller/dto/default-pagination.dto';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class CandidatesStatisticList {
  @IsString()
  @Expose()
  userId: string;
  @IsString()
  @Expose()
  fullName: string;
  @IsString()
  @Expose()
  notProcessing: string;
  @IsString()
  @Expose()
  applied: string;
  @IsString()
  @Expose()
  inProgress: string;
  @IsString()
  @Expose()
  approved: string;
  @IsString()
  @Expose()
  rejected: string;
  @IsString()
  @Expose()
  closed: string;
}

export class CandidatesStatisticDto extends DefaultPaginationDto {
  @Expose()
  data: CandidatesStatisticList[];
}
