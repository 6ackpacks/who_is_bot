import { IsString, IsBoolean, IsNumber, IsOptional, IsIn } from 'class-validator';

export class CreateContentDto {
  @IsIn(['text', 'image', 'video'])
  type: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsString()
  title: string;

  @IsBoolean()
  isAi: boolean;

  @IsString()
  modelTag: string;

  @IsString()
  provider: string;

  @IsNumber()
  deceptionRate: number;

  @IsString()
  explanation: string;
}
