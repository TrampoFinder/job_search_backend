import { Expose } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class DefaultPaginationDto {
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
