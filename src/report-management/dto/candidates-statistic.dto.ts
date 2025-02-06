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
  notProcessing: number;
  @IsNumber()
  @Expose()
  applied: number;
  @IsNumber()
  @Expose()
  inProgress: number;
  @IsNumber()
  @Expose()
  approved: number;
  @IsNumber()
  @Expose()
  rejected: number;
  @IsNumber()
  @Expose()
  closed: number;
}
