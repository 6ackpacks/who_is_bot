import { IsInt, Min, IsOptional } from 'class-validator';

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
}
