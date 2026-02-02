import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsIn } from 'class-validator';

export class SubmitJudgmentDto {
  @IsString()
  @IsNotEmpty({ message: 'contentId 不能为空' })
  contentId: string;

  @IsString()
  @IsNotEmpty({ message: 'userChoice 不能为空' })
  @IsIn(['ai', 'human'], { message: 'userChoice 必须是 ai 或 human' })
  userChoice: 'ai' | 'human';

  @IsBoolean({ message: 'isCorrect 必须是布尔值' })
  isCorrect: boolean;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  guestId?: string;
}
