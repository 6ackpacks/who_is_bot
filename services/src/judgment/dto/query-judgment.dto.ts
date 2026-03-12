import { IsOptional, IsString, IsInt, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryJudgmentDto {
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
  userId?: string;

  @IsOptional()
  @IsString()
  contentId?: string;

  @IsOptional()
  @IsIn(['ai', 'human'])
  userChoice?: 'ai' | 'human';

  @IsOptional()
  @IsIn(['true', 'false'])
  isCorrect?: string;

  @IsOptional()
  @IsIn(['created_at', 'user_choice'])
  sortBy?: string = 'created_at';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
