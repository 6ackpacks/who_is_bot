import { IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum LeaderboardTypeDto {
  GLOBAL_ACCURACY = 'global_accuracy',
  GLOBAL_JUDGMENTS = 'global_judgments',
  WEEKLY_ACCURACY = 'weekly_accuracy',
  WEEKLY_JUDGMENTS = 'weekly_judgments',
  MONTHLY_ACCURACY = 'monthly_accuracy',
  MONTHLY_JUDGMENTS = 'monthly_judgments',
  MAX_STREAK = 'max_streak',
  BOTS_BUSTED = 'bots_busted',
}

export class LeaderboardQueryDto {
  @IsOptional()
  @IsEnum(LeaderboardTypeDto)
  type?: LeaderboardTypeDto = LeaderboardTypeDto.GLOBAL_ACCURACY;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minJudgments?: number = 5;
}
