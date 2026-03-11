import { IsOptional, IsInt, Min, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryContentDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  type?: string; // 'text' | 'image' | 'video'

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isAi?: boolean;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: string; // 'createdAt' | 'totalVotes' | 'accuracy'

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC';
}
