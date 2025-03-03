import { Expose } from 'class-transformer';
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CandidatesStatisticList {
  @IsUUID(4)
  @Expose()
  userId: string;
  @IsString()
  @Expose()
  fullName: string;
  @IsNumber()
  @Expose()
  notProcessing: string;
  @IsNumber()
  @Expose()
  applied: string;
  @IsNumber()
  @Expose()
  inProgress: string;
  @IsNumber()
  @Expose()
  approved: string;
  @IsNumber()
  @Expose()
  rejected: string;
  @IsNumber()
  @Expose()
  closed: string;
}

export class CandidatesStatisticDto {
  @Expose()
  data: CandidatesStatisticList[];
  @Expose()
  @IsNumber()
  @IsOptional()
  total?: number;

  @Expose()
  @IsNumber()
  @IsOptional()
  totalPages?: number;

  @Expose()
  @IsNumber()
  @IsOptional()
  previousPage?: number | null;

  @Expose()
  @IsNumber()
  @IsOptional()
  nextPage?: number | null;
}
