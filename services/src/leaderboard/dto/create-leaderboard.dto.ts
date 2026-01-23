import { IsString, IsNumber, IsIn } from 'class-validator';

export class CreateLeaderboardDto {
  @IsString()
  modelName: string;

  @IsString()
  company: string;

  @IsIn(['text', 'image', 'video'])
  type: string;

  @IsNumber()
  deceptionRate: number;

  @IsNumber()
  totalTests: number;
}
