import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class DefaultFindAllRequest {
  @ApiPropertyOptional({})
  @IsOptional()
  @IsString()
  readonly search?: string;

  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  readonly limit?: number;

  @ApiPropertyOptional({ default: 0, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  readonly offset?: number;
}

export class PaginationMeta {
  @ApiProperty()
  readonly total: number;

  @ApiProperty()
  readonly limit: number;

  @ApiProperty()
  readonly offset: number;

  @ApiProperty()
  readonly currentPage: number;

  @ApiProperty()
  readonly totalPages: number;
}

export function buildPagination(
  total: number,
  limit: number,
  offset: number,
): PaginationMeta {
  const safeLimit = limit > 0 ? limit : 1;

  return {
    total,
    limit: safeLimit,
    offset,
    currentPage: Math.floor(offset / safeLimit) + 1,
    totalPages: Math.ceil(total / safeLimit),
  };
}
