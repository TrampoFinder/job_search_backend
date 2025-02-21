import { Expose } from 'class-transformer';
import { IsNumber, IsString, IsUUID } from 'class-validator';

export class CandidatesStatisticDto {
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
