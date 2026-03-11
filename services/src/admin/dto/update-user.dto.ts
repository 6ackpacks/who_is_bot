import { IsOptional, IsString, IsInt, IsNumber, Min, Max } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  level?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  totalJudged?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  correctCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  accuracy?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  streak?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxStreak?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  totalBotsBusted?: number;
}
