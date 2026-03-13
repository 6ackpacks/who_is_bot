import { IsInt, Min, IsOptional, IsIn, IsNumber, Max } from 'class-validator';

export class UpdateContentStatsDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  totalVotes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  aiVotes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  humanVotes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  correctVotes?: number;

  @IsOptional()
  @IsIn(['manual', 'real'])
  statsSource?: 'manual' | 'real';

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  manualAiPercent?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  manualHumanPercent?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  manualTotalVotes?: number;
}
