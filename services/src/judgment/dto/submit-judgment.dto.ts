import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class SubmitJudgmentDto {
  @IsString()
  @IsNotEmpty()
  contentId: string;

  @IsString()
  @IsNotEmpty()
  userChoice: 'ai' | 'human';

  @IsBoolean()
  isCorrect: boolean;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  guestId?: string;
}
