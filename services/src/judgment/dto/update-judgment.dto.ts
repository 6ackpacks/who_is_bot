import { IsBoolean, IsOptional, IsIn, IsString } from 'class-validator';

export class UpdateJudgmentDto {
  @IsOptional()
  @IsString()
  @IsIn(['ai', 'human'])
  userChoice?: 'ai' | 'human';

  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;
}
